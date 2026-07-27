import { Metadata } from "next";
import DashboardCourseCard from "@/components/lms/DashboardCourseCard";
import { getDashboardSnapshotForCurrentUser } from "@/lib/lms/data";

export const metadata: Metadata = {
  title: "My Courses | REES52 Academy",
};

export default async function MyCoursesPage() {
  const dashboard = await getDashboardSnapshotForCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-slate-950">My Courses</h1>
      </div>
      <div className="space-y-5">
        {dashboard.myCourses.map((course, index) => (
          <DashboardCourseCard
            key={course.slug}
            course={course}
            progress={index === 0 ? dashboard.progressPercentage : 15 + index * 20}
            lastLesson={index === 0 ? dashboard.lastLesson : "Course introduction"}
          />
        ))}
      </div>
    </div>
  );
}
