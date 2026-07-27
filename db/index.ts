export type D1RunResult = {
  meta?: { changes?: number };
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1RunResult>;
  all<T>(): Promise<{ results?: T[] }>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatement;
};

export async function getD1Database(): Promise<D1DatabaseLike> {
  const { env } = await import("cloudflare:workers");
  const database = (env as unknown as { DB?: D1DatabaseLike }).DB;
  if (!database) {
    throw new Error("Leaderboard storage is unavailable.");
  }
  return database;
}
