import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookies and local storage used by REES52 Academy for sign-in, progress and embedded course videos.",
  alternates: { canonical: absoluteUrl("/cookie-policy") },
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 lg:px-8">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700">Academy policy</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Cookie Policy</h1>
      <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
        This policy explains the cookies and browser storage used by REES52 Academy to keep learners signed in, save progress and deliver course media.
      </p>
      <p className="mt-3 text-xs font-bold text-slate-500">Effective: 27 July 2026</p>

      <div className="mt-10 space-y-8">
        <Section title="1. What cookies and browser storage are">
          <p>
            Cookies are small text records stored by a browser. Local storage and similar technologies can remember settings on the device.
            Some are set by REES52 Academy, while embedded services may set their own records.
          </p>
        </Section>

        <Section title="2. Essential Academy storage">
          <p>Essential records support:</p>
          <ul>
            <li>Secure sign-in, session continuity and sign-out.</li>
            <li>Account protection, request validation and abuse prevention.</li>
            <li>Course enrolment, lesson completion, quiz state and saved learning activity.</li>
            <li>Basic interface preferences needed for a consistent experience.</li>
          </ul>
          <p>
            These functions are necessary for registered learning features. Blocking them may prevent sign-in or cause progress to stop saving.
          </p>
        </Section>

        <Section title="3. Embedded REES52 videos">
          <p>
            Course lessons embed videos hosted by YouTube. When the video frame loads or is played, YouTube may receive technical information and may use cookies under Google&apos;s policies.
            Learners can use the linked PDF and written lesson materials without playing an embedded video, but the video lesson itself is part of course completion.
          </p>
        </Section>

        <Section title="4. Analytics and advertising">
          <p>
            At the effective date, REES52 Academy does not load third-party advertising scripts or Academy analytics cookies.
            If optional analytics are introduced later, we will update this policy and provide any choice or notice required before those tools are enabled.
          </p>
          <p>The separate REES52 store may use different commerce, analytics or advertising technologies under its own cookie policy.</p>
        </Section>

        <Section title="5. How to control cookies">
          <p>
            Browser settings can delete or block cookies and site storage. Private-browsing modes may clear them automatically.
            Blocking essential storage can sign a learner out, remove local preferences or prevent course progress from being associated with the account.
          </p>
          <p>
            To ask what Academy storage applies to your account, email <a href="mailto:info@rees52.tech">info@rees52.tech</a>.
          </p>
        </Section>

        <Section title="6. Changes and contact">
          <p>
            We update this page when the Academy changes the technologies it uses. Material changes will be reflected in the effective date.
          </p>
          <p>
            Robotics Embedded Education Services Private Limited<br />
            G-9, Om Vihar Phase 5, Uttam Nagar, New Delhi, India<br />
            <a href="mailto:info@rees52.tech">info@rees52.tech</a> · <a href="tel:+919599594520">+91 95995 94520</a>
          </p>
        </Section>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-xs font-black uppercase tracking-widest text-sky-800">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Use</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-slate-600 [&_a]:font-bold [&_a]:text-sky-800 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
        {children}
      </div>
    </section>
  );
}
