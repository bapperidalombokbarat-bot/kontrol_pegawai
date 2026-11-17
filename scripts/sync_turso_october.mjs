import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const jsonPath = path.resolve(__dirname, "../Base_Data/employees_october_2026.json");

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function run() {
  console.log("=========================================");
  console.log(" MIGRASI DATA PEGAWAI OKTOBER 2026 KE TURSO ");
  console.log("=========================================\n");

  const env = loadEnv();
  const dbUrl = env.VITE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL;
  const authToken = env.VITE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error("❌ Turso credentials not found in .env");
    process.exit(1);
  }

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  const employees = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${employees.length} employees from JSON.`);

  // 1. Ensure columns exist on Turso
  console.log("Memperbarui skema tabel employees di Turso DB...");
  const newCols = [
    { name: "no_urut", type: "INTEGER DEFAULT 999" },
    { name: "jenis_jabatan", type: "TEXT DEFAULT ''" },
    { name: "jenjang_jabatan", type: "TEXT DEFAULT ''" },
    { name: "tmt_jabatan", type: "TEXT" },
    { name: "pendidikan_terakhir", type: "TEXT DEFAULT ''" },
    { name: "diklat_struktural", type: "TEXT DEFAULT ''" },
    { name: "diklat_fungsional", type: "TEXT DEFAULT ''" },
    { name: "diklat_teknis", type: "TEXT DEFAULT ''" },
    { name: "unit_kerja", type: "TEXT DEFAULT ''" },
    { name: "unor_induk", type: "TEXT DEFAULT 'Bapperida'" },
  ];

  for (const col of newCols) {
    try {
      await client.execute(`ALTER TABLE employees ADD COLUMN ${col.name} ${col.type};`);
      console.log(`+ Kolom ditambahkan: ${col.name}`);
    } catch (e) {
      // Column might already exist, safe to ignore
    }
  }

  // Clear demo employees (is_demo = 1 or old sample IDs)
  console.log("Menghapus data demo contoh lama...");
  await client.execute("DELETE FROM employees WHERE is_demo = 1;");

  // Insert/Upsert the 59 real employees
  console.log(`Memasukkan ${employees.length} pegawai real Oktober 2026...`);
  let inserted = 0;
  for (const emp of employees) {
    const keys = [
      "id", "no_urut", "nip", "name", "position", "rank", "grade", "employment_type",
      "retirement_category", "last_rank_tmt", "last_kgb_tmt", "base_salary",
      "tpp_basic", "job_class", "status", "is_demo", "jenis_jabatan",
      "jenjang_jabatan", "tmt_jabatan", "pendidikan_terakhir", "diklat_struktural",
      "diklat_fungsional", "diklat_teknis", "unit_kerja", "unor_induk",
      "created_at", "updated_at"
    ];

    const placeholders = keys.map(() => "?").join(", ");
    const updateCols = keys.filter(k => k !== "id" && k !== "nip").map(k => `${k} = excluded.${k}`).join(", ");
    const values = keys.map(k => {
      const v = emp[k];
      if (k === "is_demo") return v ? 1 : 0;
      return v === undefined ? null : v;
    });

    const sql = `INSERT INTO employees (${keys.join(", ")}) VALUES (${placeholders}) ON CONFLICT(nip) DO UPDATE SET ${updateCols}`;
    try {
      await client.execute({ sql, args: values });
      inserted++;
    } catch (err) {
      console.error(`Gagal pada ${emp.nip} - ${emp.name}:`, err.message);
    }
  }

  console.log(`\n✅ Selesai! ${inserted} pegawai berhasil disinkronkan ke Turso DB.`);

  // Verify count
  const countRes = await client.execute("SELECT count(*) as total, sum(CASE WHEN employment_type = 'PNS' THEN 1 ELSE 0 END) as pns, sum(CASE WHEN employment_type = 'PPPK' THEN 1 ELSE 0 END) as pppk FROM employees;");
  console.log("Rekap database Turso saat ini:", countRes.rows[0]);
}

run().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
