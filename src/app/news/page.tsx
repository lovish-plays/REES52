import type { Metadata } from "next";
import TwitterNewsFeed from "@/components/news/TwitterNewsFeed";
import { getPublishedArticles } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Articles",
  description:
    "Read REES52 Academy news, classroom stories, robotics tutorials and electronics teaching articles in a Twitter-style feed stream.",
  alternates: { canonical: absoluteUrl("/news") },
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="flex-1 bg-zinc-950 text-white min-h-screen">
      <TwitterNewsFeed articles={articles} />
    </main>
  );
}
