import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How REES52 Academy collects, uses, stores and protects learner information.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <PolicyShell
      eyebrow="Academy policy"
      title="Privacy Policy"
      summary="This policy explains how REES52 Academy handles information when learners browse courses, create accounts, save progress, take quizzes, submit feedback or contact support."
    >
      <PolicySection title="1. Who operates the Academy">
        <p>
          REES52 Academy is operated by Robotics Embedded Education Services Private Limited (“REES52”, “we”, “us” or “our”).
          This policy applies to the Academy website and its learning features. Purchases made on the separate REES52 store are governed by the store&apos;s own policies.
        </p>
      </PolicySection>

      <PolicySection title="2. Information we collect">
        <ul>
          <li><strong>Account information:</strong> name, email address, sign-in credentials or identity-provider details, and the school class selected during onboarding.</li>
          <li><strong>Learning activity:</strong> course enrolments, completed lessons, quiz answers and scores, saved projects, downloaded resources and certificate status.</li>
          <li><strong>Leaderboard activity:</strong> monthly point events linked to an account and a shortened display name; email addresses are never shown on the public leaderboard.</li>
          <li><strong>Content you submit:</strong> feedback, reviews, support messages and project information you choose to share.</li>
          <li><strong>Basic technical information:</strong> security logs, IP address, browser or device information, request timestamps and error details needed to keep the service reliable and secure.</li>
        </ul>
        <p>We do not ask learners to place passwords, Wi-Fi credentials or other secrets in project submissions or shared code.</p>
      </PolicySection>

      <PolicySection title="3. Why we use information">
        <ul>
          <li>To create and secure accounts, authenticate learners and prevent misuse.</li>
          <li>To deliver courses, remember progress, score quizzes, save project activity and issue course-completion certificates.</li>
          <li>To calculate monthly learner rankings from verified activity while limiting the public display to shortened names and point totals.</li>
          <li>To answer support requests, moderate feedback and improve lesson clarity.</li>
          <li>To maintain service security, investigate errors and comply with applicable law.</li>
        </ul>
        <p>REES52 Academy does not sell learner personal information and does not use Academy activity for behavioural advertising.</p>
      </PolicySection>

      <PolicySection title="4. Service providers and external content">
        <p>
          We use service providers for hosting, authentication, database storage, file delivery, email and security.
          These providers process information only to deliver those services under their own security and contractual controls.
          Course pages may embed official REES52 videos hosted by YouTube; loading or playing an embedded video may send technical information to YouTube under Google&apos;s policies.
        </p>
        <p>
          Links to the REES52 store, YouTube and other external sites open services that REES52 Academy does not control.
          Review their policies before submitting information there.
        </p>
      </PolicySection>

      <PolicySection title="5. Children and school learners">
        <p>
          The Academy includes content for school-age learners. A parent, guardian or authorised school representative should supervise account creation and use where the learner cannot provide valid consent under applicable law.
          We do not knowingly use children&apos;s information for targeted advertising, behavioural monitoring or data brokerage.
        </p>
        <p>
          A parent, guardian or school may contact us to review, correct or request deletion of a learner&apos;s account information.
          We may ask for reasonable proof of authority before acting on a request.
        </p>
      </PolicySection>

      <PolicySection title="6. Retention and security">
        <p>
          We keep account and learning information for as long as the account is active or as reasonably needed to provide the Academy, resolve disputes, prevent fraud and meet legal obligations.
          We delete or de-identify information when it is no longer needed, subject to lawful backup and record-keeping periods.
        </p>
        <p>
          We use access controls, encrypted connections and restricted administrative access. No online service can guarantee absolute security, so learners should use a unique password and report suspected account misuse promptly.
        </p>
      </PolicySection>

      <PolicySection title="7. Your choices and requests">
        <p>
          You may ask us to provide information about your account, correct inaccurate details, delete information that is no longer required, withdraw consent where processing relies on consent, or raise a complaint.
          Deleting an account may also remove saved course progress, quiz history and certificates.
        </p>
        <p>
          Send privacy requests to <a href="mailto:support@rees52.com">support@rees52.com</a> with the subject “Academy privacy request”.
          We may verify the request before changing or disclosing account information.
        </p>
      </PolicySection>

      <PolicySection title="8. Indian data-protection framework">
        <p>
          We review Academy practices against applicable Indian law, including the Digital Personal Data Protection Act, 2023 and its phased commencement and rules.
          Official texts are available from{" "}
          <a href="https://www.indiacode.nic.in/indiacode/handle/123456789/22037" target="_blank" rel="noopener noreferrer">India Code</a>
          {" "}and the{" "}
          <a href="https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025.pdf" target="_blank" rel="noopener noreferrer">Ministry of Electronics and Information Technology</a>.
        </p>
      </PolicySection>

      <PolicySection title="9. Contact and policy changes">
        <p>
          Robotics Embedded Education Services Private Limited<br />
          G-9, Om Vihar Phase 5, Uttam Nagar, New Delhi, India<br />
          Email: <a href="mailto:support@rees52.com">support@rees52.com</a><br />
          Phone: <a href="tel:+919599594520">+91 95995 94520</a>
        </p>
        <p>We will update the date below when material changes are made and will provide an additional notice when required.</p>
      </PolicySection>
    </PolicyShell>
  );
}

function PolicyShell({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 lg:px-8">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{title}</h1>
      <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">{summary}</p>
      <p className="mt-3 text-xs font-bold text-slate-500">Effective: 27 July 2026</p>
      <div className="mt-10 space-y-8">{children}</div>
      <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-xs font-black uppercase tracking-widest text-sky-800">
        <Link href="/cookie-policy">Cookie Policy</Link>
        <Link href="/terms">Terms of Use</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-slate-600 [&_a]:font-bold [&_a]:text-sky-800 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-black [&_strong]:text-slate-800">
        {children}
      </div>
    </section>
  );
}
