import AdminFeaturePage from "@/components/lms/AdminFeaturePage";

export default function AdminEbooksPage() {
  return (
    <AdminFeaturePage
      title="Ebooks"
      description="Upload and organize downloadable study material for Arduino, robotics, sensors, IoT, ATL labs, 3D printing, and AI."
      features={[
        "Upload Ebook metadata with title, slug, category, level, description, cover, and file URL.",
        "Use ebook-files bucket for PDFs and ebook-covers bucket for cover images.",
        "Lock or unlock ebooks with is_free.",
        "Publish or unpublish ebooks.",
        "Show login required state for locked ebooks.",
        "Track downloads later through analytics events."
      ]}
    />
  );
}
