import ContentExplorer from "@/components/ContentExplorer";

export default function HomePage() {
  return (
    <div className="flex-1">
      <ContentExplorer initialType="all" />
    </div>
  );
}
