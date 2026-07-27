import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth";
import { isTeacherRole } from "@/lib/auth/roles";

export const metadata = {
  title: "Teacher workspace",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeacherWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AccessMessage
        title="Teacher sign-in required"
        message="Sign in with a teacher account to create or manage learning content."
        href="/login?portal=teacher&redirect_to=/admin"
        action="Teacher sign in"
      />
    );
  }

  if (!isTeacherRole(currentUser.role)) {
    return (
      <AccessMessage
        title="Teacher access only"
        message="Your student account can view learning content, but it cannot add, edit, publish, or delete it."
        href="/courses"
        action="Browse courses"
      />
    );
  }

  return children;
}

function AccessMessage({
  title,
  message,
  href,
  action,
}: {
  title: string;
  message: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-md">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-4 text-2xl font-black tracking-wide text-slate-950">{title}</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{message}</p>
        <Link
          href={href}
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          {action}
        </Link>
      </div>
    </div>
  );
}
