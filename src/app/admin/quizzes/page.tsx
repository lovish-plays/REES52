import AdminFeaturePage from "@/components/lms/AdminFeaturePage";

export default function AdminQuizzesPage() {
  return (
    <AdminFeaturePage
      title="Quizzes"
      description="Create MCQ quizzes for courses and modules, define passing score, and prepare unlock-next-module logic."
      features={[
        "Add Quiz linked to course_id and module_id.",
        "Add MCQ questions with four options.",
        "Set correct answers and explanations.",
        "Set Passing Score, defaulting to 60.",
        "Save quiz attempts with score, total questions, passed status, and attempted_at.",
        "Use quiz results to unlock next module after backend rules are connected."
      ]}
    />
  );
}
