import Link from "next/link";
import { ArrowRight, Bot, Cpu, GraduationCap, School } from "lucide-react";

const paths = [
  {
    title: "Beginner Arduino",
    description: "Start with wiring, Arduino IDE, LEDs, sensors, and one smart alert project.",
    href: "/courses/arduino-beginner-course",
    label: "Best first course",
    icon: Cpu,
  },
  {
    title: "Robotics Starter",
    description: "Build wheeled robots with motors, sensor logic, and movement basics.",
    href: "/courses/robotics-starter-course",
    label: "Build a robot",
    icon: Bot,
  },
  {
    title: "IoT with ESP32",
    description: "Move into Wi-Fi projects, sensor data, dashboards, and automation.",
    href: "/courses/esp32-iot-course",
    label: "After basics",
    icon: GraduationCap,
  },
  {
    title: "School / ATL Lab",
    description: "Use short projects, worksheets, and component lists for classroom practice.",
    href: "/projects",
    label: "For labs",
    icon: School,
  },
];

export default function StartHerePaths() {
  return (
    <section className="rounded-lg border border-sky-100 bg-white/90 p-5 shadow-sm shadow-sky-500/5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">Start Here</p>
          <h2 className="mt-2 text-balance text-2xl font-black tracking-wide text-slate-950">Pick your learning path</h2>
        </div>
        <p className="max-w-md text-pretty text-sm font-semibold leading-relaxed text-slate-600">
          Choose the path closest to your current skill level and start with a preview lesson.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {paths.map(({ title, description, href, label, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="premium-interactive-card group flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50/80 p-4 transition-all hover:border-sky-300 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-sky-800">
                {label}
              </span>
              <Icon className="h-5 w-5 text-sky-700" />
            </div>
            <h3 className="mt-4 text-base font-black tracking-wide text-slate-950">{title}</h3>
            <p className="mt-2 flex-1 text-pretty text-xs font-semibold leading-relaxed text-slate-600">{description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-800 group-hover:text-sky-600">
              Start path
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
