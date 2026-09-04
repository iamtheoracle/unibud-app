import { Pool } from "pg";
import {
  CompiledQuery,
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type Driver,
  type Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type QueryCompiler,
  type QueryResult,
  type TransactionSettings,
} from "kysely";

/** Compatibility name retained for the existing Better Auth server import. */
export function pgliteDialect(_getClient: () => Promise<unknown> | unknown): Dialect {
  return {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new NeonDriver(),
    createQueryCompiler: (): QueryCompiler => new PostgresQueryCompiler(),
    createIntrospector: (db: Kysely<unknown>): DatabaseIntrospector => new PostgresIntrospector(db),
  };
}

class NeonDriver implements Driver {
  private pool?: Pool;
  private connection?: NeonConnection;

  async init(): Promise<void> {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) throw new Error("DATABASE_URL is required for Better Auth.");
    this.pool = new Pool({ connectionString: url });
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.pool) await this.init();
    if (this.connection) throw new Error("Concurrent Better Auth connection acquisition is not supported.");
    this.connection = new NeonConnection(await this.pool!.connect());
    return this.connection;
  }

  async releaseConnection(connection: DatabaseConnection): Promise<void> {
    if (connection !== this.connection) throw new Error("Invalid connection");
    this.connection.release();
    this.connection = undefined;
  }

  async beginTransaction(conn: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    const sql = settings.isolationLevel
      ? `start transaction isolation level ${settings.isolationLevel}`
      : "begin";
    await (conn as NeonConnection).query(sql, []);
  }

  async commitTransaction(conn: DatabaseConnection): Promise<void> {
    await (conn as NeonConnection).query("commit", []);
  }

  async rollbackTransaction(conn: DatabaseConnection): Promise<void> {
    await (conn as NeonConnection).query("rollback", []);
  }

  async destroy(): Promise<void> {
    this.connection = undefined;
    if (this.pool) await this.pool.end();
    this.pool = undefined;
  }
}

class NeonConnection implements DatabaseConnection {
  constructor(private readonly client: import("pg").PoolClient) {}

  async query(text: string, params: unknown[]): Promise<void> {
    await this.client.query(text, params);
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const result = await this.client.query(compiledQuery.sql, [...compiledQuery.parameters]);
    return {
      numAffectedRows: result.rowCount === null ? undefined : BigInt(result.rowCount),
      rows: result.rows as O[],
    };
  }

  async *streamQuery<O>(compiledQuery: CompiledQuery, chunkSize: number): AsyncIterableIterator<QueryResult<O>> {
    if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new Error("chunkSize must be a positive integer");
    const result = await this.client.query(compiledQuery.sql, [...compiledQuery.parameters]);
    for (let i = 0; i < result.rows.length; i += chunkSize) {
      yield { rows: result.rows.slice(i, i + chunkSize) as O[] };
    }
  }

  release(): void {
    this.client.release();
  }
}
