// Unified Turso DB client with fallback to local localStorage engine
import { createClient } from "@libsql/client/web";
import { localBackend } from "./local-backend";

const TURSO_URL = import.meta.env.VITE_TURSO_DATABASE_URL || "";
const TURSO_TOKEN = import.meta.env.VITE_TURSO_AUTH_TOKEN || "";

export const isTursoEnabled = Boolean(TURSO_URL && TURSO_TOKEN && TURSO_URL.startsWith("libsql"));

let tursoClient: ReturnType<typeof createClient> | null = null;

if (isTursoEnabled) {
  try {
    // If url starts with libsql://, Turso HTTP client accepts https:// as well
    const httpUrl = TURSO_URL.replace(/^libsql:\/\//, "https://");
    tursoClient = createClient({
      url: httpUrl,
      authToken: TURSO_TOKEN,
    });
  } catch (e) {
    console.error("[Turso] Failed to initialize client, fallback to local storage:", e);
    tursoClient = null;
  }
}

const BOOLEAN_COLUMNS = new Set(["is_demo", "is_asn", "is_working", "student_certificate"]);

function formatRowFromDb(row: Record<string, any>): any {
  if (!row || typeof row !== "object") return row;
  const out: Record<string, any> = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (BOOLEAN_COLUMNS.has(key)) {
      out[key] = Boolean(value);
    } else if (key === "details" && typeof value === "string") {
      try {
        out[key] = JSON.parse(value);
      } catch {
        // keep as is
      }
    }
  }
  return out;
}

function formatRowForDb(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (BOOLEAN_COLUMNS.has(key)) {
      out[key] = value ? 1 : 0;
    } else if (key === "details" && typeof value === "object" && value !== null) {
      out[key] = JSON.stringify(value);
    }
  }
  return out;
}

class TursoQueryBuilder {
  private table: string;
  private operation: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectedFields: string = "*";
  private whereClauses: string[] = [];
  private params: any[] = [];
  private orderClause: string = "";
  private limitCount?: number;
  private mutationData: any = null;
  private mutationOptions?: { onConflict?: string };

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string) {
    if (fields) this.selectedFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereClauses.push(`${column} = ?`);
    this.params.push(BOOLEAN_COLUMNS.has(column) ? (value ? 1 : 0) : value);
    return this;
  }

  in(column: string, values: any[]) {
    if (!values || values.length === 0) {
      this.whereClauses.push("1 = 0");
      return this;
    }
    const placeholders = values.map(() => "?").join(", ");
    this.whereClauses.push(`${column} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? "DESC" : "ASC";
    this.orderClause = `ORDER BY ${column} ${dir}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(data: any | any[]) {
    this.operation = "insert";
    this.mutationData = data;
    return this;
  }

  update(payload: any) {
    this.operation = "update";
    this.mutationData = payload;
    return this;
  }

  upsert(data: any | any[], options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.mutationData = data;
    this.mutationOptions = options;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    if (!tursoClient) {
      if (this.operation === "select") return { data: [], error: null };
      return { data: null, error: new Error("Turso client not connected") };
    }

    try {
      if (this.operation === "select") {
        let sql = `SELECT ${this.selectedFields} FROM ${this.table}`;
        if (this.whereClauses.length > 0) {
          sql += ` WHERE ${this.whereClauses.join(" AND ")}`;
        }
        if (this.orderClause) {
          sql += ` ${this.orderClause}`;
        }
        if (typeof this.limitCount === "number") {
          sql += ` LIMIT ${this.limitCount}`;
        }
        const res = await tursoClient.execute({ sql, args: this.params });
        const rows = res.rows.map((r) => formatRowFromDb(r as any));
        return { data: rows, error: null };
      }

      if (this.operation === "insert") {
        const items = (Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData]).map((item) => ({
          id: item.id || `tur-${Math.random().toString(36).slice(2, 9)}`,
          created_at: item.created_at || new Date().toISOString(),
          ...formatRowForDb(item),
        }));

        const results: any[] = [];
        for (const item of items) {
          const keys = Object.keys(item);
          const placeholders = keys.map(() => "?").join(", ");
          const values = keys.map((k) => item[k]);
          const sql = `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
          const res = await tursoClient.execute({ sql, args: values });
          if (res.rows[0]) {
            results.push(formatRowFromDb(res.rows[0] as any));
          } else {
            results.push(item);
          }
        }
        const resData = Array.isArray(this.mutationData) ? results : results[0];
        return { data: resData, error: null };
      }

      if (this.operation === "update") {
        const formatted = formatRowForDb(this.mutationData);
        formatted.updated_at = new Date().toISOString();
        const setKeys = Object.keys(formatted);
        const setClause = setKeys.map((k) => `${k} = ?`).join(", ");
        const args = [...setKeys.map((k) => formatted[k]), ...this.params];

        let sql = `UPDATE ${this.table} SET ${setClause}`;
        if (this.whereClauses.length > 0) {
          sql += ` WHERE ${this.whereClauses.join(" AND ")}`;
        }
        sql += ` RETURNING *`;

        const res = await tursoClient.execute({ sql, args });
        const updatedRows = res.rows.map((r) => formatRowFromDb(r as any));
        const resData = updatedRows.length === 1 ? updatedRows[0] : updatedRows;
        return { data: resData, error: null };
      }

      if (this.operation === "upsert") {
        const conflictCol = this.mutationOptions?.onConflict || "id";
        const items = (Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData]).map((item) => ({
          id: item.id || `tur-${Math.random().toString(36).slice(2, 9)}`,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...formatRowForDb(item),
        }));

        const results: any[] = [];
        for (const item of items) {
          const keys = Object.keys(item);
          const placeholders = keys.map(() => "?").join(", ");
          const updateCols = keys.filter((k) => k !== conflictCol).map((k) => `${k} = excluded.${k}`).join(", ");
          const values = keys.map((k) => item[k]);
          const sql = `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders}) ON CONFLICT(${conflictCol}) DO UPDATE SET ${updateCols} RETURNING *`;
          const res = await tursoClient.execute({ sql, args: values });
          results.push(formatRowFromDb(res.rows[0] as any));
        }
        const resData = Array.isArray(this.mutationData) ? results : results[0];
        return { data: resData, error: null };
      }

      if (this.operation === "delete") {
        let sql = `DELETE FROM ${this.table}`;
        if (this.whereClauses.length > 0) {
          sql += ` WHERE ${this.whereClauses.join(" AND ")}`;
        }
        await tursoClient.execute({ sql, args: this.params });
        return { data: null, error: null };
      }

      return { data: null, error: new Error(`Unknown operation: ${this.operation}`) };
    } catch (err) {
      console.error(`[Turso ${this.operation} Error]:`, err);
      return { data: null, error: err };
    }
  }

  async single() {
    this.limitCount = 1;
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (Array.isArray(data)) {
      if (data.length === 0) return { data: null, error: new Error("Row not found") };
      return { data: data[0], error: null };
    }
    return { data: data ?? null, error: data ? null : new Error("Row not found") };
  }

  async maybeSingle() {
    this.limitCount = 1;
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (Array.isArray(data)) {
      return { data: data[0] ?? null, error: null };
    }
    return { data: data ?? null, error: null };
  }

  then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    this.execute().then(resolve, reject);
  }
}

export const tursoBackend = {
  isTurso: true,
  from(table: string) {
    if (isTursoEnabled && tursoClient) {
      return new TursoQueryBuilder(table);
    }
    return localBackend.from(table);
  },
  auth: localBackend.auth,
};
