import AdminFeaturePage from "@/components/lms/AdminFeaturePage";

export default function AdminUsersPage() {
  return (
    <AdminFeaturePage
      title="Users"
      description="View student profiles, course enrollments, lesson progress, ebook access, quiz attempts, and teacher access controls."
      features={[
        "View Students with profile details and role.",
        "View Progress across course_enrollments and student_progress.",
        "View Quiz Attempts and passing status.",
        "Manage Access for paid courses and locked ebooks.",
        "Promote trusted staff to the teacher role only from a secure service-role workflow.",
        "Keep profile data protected with Row Level Security policies."
      ]}
    />
  );
}
