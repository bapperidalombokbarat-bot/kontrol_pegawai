import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const schemaPath = path.resolve(__dirname, "../turso-schema.sql");

// Simple .env parser
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
  console.log("   MIGRASI DATABASE TURSO - SIMPEG      ");
  console.log("=========================================\n");

  const env = loadEnv();
  const dbUrl = process.env.VITE_TURSO_DATABASE_URL || env.VITE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL;
  const authToken = process.env.VITE_TURSO_AUTH_TOKEN || env.VITE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error("❌ Error: VITE_TURSO_DATABASE_URL atau VITE_TURSO_AUTH_TOKEN belum diisi di file .env!");
    console.log("\nPetunjuk:");
    console.log("1. Buat database di https://turso.tech");
    console.log("2. Buka file .env dan isi:");
    console.log('   VITE_TURSO_DATABASE_URL="libsql://<nama-db>-<user>.turso.io"');
    console.log('   VITE_TURSO_AUTH_TOKEN="<token-anda>"');
    console.log("3. Jalankan kembali perintah ini: npm run db:setup-turso\n");
    process.exit(1);
  }

  console.log(`Mengubungkan ke database Turso: ${dbUrl}...`);
  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  const sqlContent = fs.readFileSync(schemaPath, "utf-8");
  const statements = sqlContent
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Menjalankan ${statements.length} instruksi SQL...`);

  let count = 0;
  for (const statement of statements) {
    try {
      await client.execute(statement);
      count++;
    } catch (err) {
      console.error(`Peringatan pada statement: ${statement.slice(0, 50)}...`);
      console.error(err.message);
    }
  }

  console.log(`\n✅ Berhasil! ${count} perintah dieksekusi.`);
  console.log("Tabel dan data awal SIMPEG siap digunakan secara online di Turso DB.\n");
}

run().catch((err) => {
  console.error("Gagal menjalankan migrasi:", err);
  process.exit(1);
});
