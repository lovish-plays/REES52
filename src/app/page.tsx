import ContentExplorer from "@/components/ContentExplorer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex-1">
      <ContentExplorer initialType="all" />
    </div>
  );
}
