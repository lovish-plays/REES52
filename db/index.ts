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
  try {
    const { env } = await import("cloudflare:workers");
    const database = (env as unknown as { DB?: D1DatabaseLike }).DB;
    if (database) return database;
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
  }

  if (process.env.NODE_ENV !== "production") {
    return getDevelopmentDatabase();
  }

  throw new Error("Academy database storage is unavailable.");
}

type DevelopmentArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageUrl: string | null;
  authorId: string;
  authorName: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DevelopmentDatabaseGlobal = typeof globalThis & {
  __rees52DevelopmentArticles?: DevelopmentArticleRow[];
};

function getDevelopmentDatabase(): D1DatabaseLike {
  const runtime = globalThis as DevelopmentDatabaseGlobal;
  runtime.__rees52DevelopmentArticles ??= [
    {
      id: "art-teacher-test-001",
      title: "The Rise of Embedded Machine Learning in K-12 STEM Education (Test Article)",
      slug: "rise-of-embedded-machine-learning-stem-education",
      excerpt: "Discover how TinyML and low-power microcontrollers are transforming how high school students learn artificial intelligence.",
      content: "Artificial intelligence is no longer restricted to cloud datacenters and high-performance GPUs. With TinyML, microcontrollers like the ESP32 and Raspberry Pi Pico can run compact neural network models directly at the edge.\n\nIn this article, we explore how hands-on sensor-based AI models—such as gesture recognition and acoustic keyword spotting—help students gain intuitive, practical understanding of machine learning principles.",
      category: "AI & Embedded Systems",
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      authorId: "usr-teacher-test-001",
      authorName: "Dr. Alex Vance (Test Teacher)",
      status: "published",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    prepare(query: string) {
      let values: unknown[] = [];
      const normalized = query.replace(/\s+/g, " ").trim().toLowerCase();

      const statement: D1PreparedStatement = {
        bind(...nextValues: unknown[]) {
          values = nextValues;
          return statement;
        },
        async run() {
          const rows = runtime.__rees52DevelopmentArticles!;

          if (normalized.startsWith("insert into articles")) {
            const [
              id,
              title,
              slug,
              excerpt,
              content,
              category,
              coverImageUrl,
              authorId,
              authorName,
              status,
              publishedAt,
              createdAt,
              updatedAt,
            ] = values;
            if (rows.some((row) => row.slug === slug)) {
              throw new Error("UNIQUE constraint failed: articles.slug");
            }
            rows.push({
              id: String(id),
              title: String(title),
              slug: String(slug),
              excerpt: String(excerpt),
              content: String(content),
              category: String(category),
              coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
              authorId: String(authorId),
              authorName: String(authorName),
              status: status === "published" ? "published" : "draft",
              publishedAt: publishedAt ? String(publishedAt) : null,
              createdAt: String(createdAt),
              updatedAt: String(updatedAt),
            });
            return { meta: { changes: 1 } };
          }

          if (normalized.startsWith("update articles")) {
            const id = String(values[9]);
            const row = rows.find((article) => article.id === id);
            if (!row) return { meta: { changes: 0 } };
            const nextSlug = String(values[1]);
            if (rows.some((article) => article.id !== id && article.slug === nextSlug)) {
              throw new Error("UNIQUE constraint failed: articles.slug");
            }
            Object.assign(row, {
              title: String(values[0]),
              slug: nextSlug,
              excerpt: String(values[2]),
              content: String(values[3]),
              category: String(values[4]),
              coverImageUrl: values[5] ? String(values[5]) : null,
              status: values[6] === "published" ? "published" : "draft",
              publishedAt: values[7] ? String(values[7]) : null,
              updatedAt: String(values[8]),
            });
            return { meta: { changes: 1 } };
          }

          if (normalized.startsWith("delete from articles")) {
            const index = rows.findIndex((article) => article.id === String(values[0]));
            if (index === -1) return { meta: { changes: 0 } };
            rows.splice(index, 1);
            return { meta: { changes: 1 } };
          }

          throw new Error("Unsupported development database operation.");
        },
        async all<T>() {
          let rows = [...runtime.__rees52DevelopmentArticles!];

          if (normalized.includes("where status = 'published'")) {
            rows = rows.filter(
              (article) => article.status === "published" && article.publishedAt,
            );
          }
          if (normalized.includes("where slug = ?")) {
            rows = rows.filter((article) => article.slug === String(values[0]));
          }
          if (normalized.includes("where id = ?")) {
            rows = rows.filter((article) => article.id === String(values[0]));
          }
          if (normalized.includes("order by published_at desc")) {
            rows.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
          }
          if (normalized.includes("order by updated_at desc")) {
            rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          }
          if (normalized.includes("limit ?")) {
            rows = rows.slice(0, Number(values.at(-1)) || 0);
          } else if (normalized.includes("limit 1")) {
            rows = rows.slice(0, 1);
          }

          return { results: rows.map((row) => ({ ...row })) as T[] };
        },
      };

      return statement;
    },
  };
}
