import { Suspense } from "react";
import ContentExplorer from "@/components/ContentExplorer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex-1">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-20 text-cyan-600 font-extrabold uppercase tracking-widest">Loading Explorer...</div>}>
        <ContentExplorer initialType="all" />
      </Suspense>
    </div>
  );
}
