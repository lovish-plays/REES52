import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Academy Terms of Use",
  description: "Terms governing REES52 Academy accounts, courses, projects, certificates and safe hardware learning.",
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 lg:px-8">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700">Academy terms</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Terms of Use</h1>
      <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
        These terms apply to REES52 Academy accounts, courses, project guides, quizzes, workbooks, learner submissions and course-completion certificates.
      </p>
      <p className="mt-3 text-xs font-bold text-slate-500">Effective: 27 July 2026</p>

      <div className="mt-10 space-y-8">
        <Section title="1. Operator and acceptance">
          <p>
            REES52 Academy is operated by Robotics Embedded Education Services Private Limited.
            By using the Academy, you agree to these terms and the Academy Privacy and Cookie Policies.
            If you use the Academy for a school or organisation, you confirm that you are authorised to do so.
          </p>
        </Section>

        <Section title="2. Accounts and school-age learners">
          <ul>
            <li>Provide accurate account details and keep sign-in credentials confidential.</li>
            <li>Do not share another learner&apos;s account or attempt to access restricted administrative features.</li>
            <li>A parent, guardian or authorised school representative should supervise account use where required for a minor.</li>
            <li>Tell us promptly if an account may have been compromised.</li>
          </ul>
        </Section>

        <Section title="3. Course access and progress">
          <p>
            Public course listings are free unless a price is clearly shown. Account features can save enrolment, lesson completion, quiz results and certificate status.
            We may correct errors, replace unsafe instructions, update links or withdraw content when needed.
          </p>
          <p>
            Progress records depend on a valid account and network connection. Learners should keep personal copies of code, photographs and project notes they want to retain.
          </p>
        </Section>

        <Section title="4. Hardware and classroom safety">
          <p>
            Electronics, batteries, motors, tools, soldering equipment and moving mechanisms can cause injury or damage when used incorrectly.
            Follow the stated voltage, polarity and power-off checks; use age-appropriate adult or instructor supervision; wear appropriate protective equipment; and stop if a component overheats, smells unusual or behaves unexpectedly.
          </p>
          <p>
            Academy instructions are educational guidance, not a substitute for a qualified instructor, manufacturer datasheet, school safety procedure or professional engineering advice.
          </p>
        </Section>

        <Section title="5. Kits, components and external services">
          <p>
            Kit and component links open the separate REES52 store. Product availability, price, payment, shipping, returns and warranties are governed by the terms shown at checkout on that store.
            Embedded YouTube videos and other external links are subject to the third party&apos;s terms and availability.
          </p>
        </Section>

        <Section title="6. Certificates">
          <p>
            A REES52 Academy certificate records completion of the specified Academy learning path according to the progress available to the service.
            It is not a school degree, professional licence, government-accredited qualification or guarantee of employment, admission or skill level.
            Certificates may be withheld or revoked when progress was obtained through misuse or inaccurate records.
          </p>
        </Section>

        <Section title="7. Acceptable use and learner submissions">
          <p>You must not:</p>
          <ul>
            <li>Upload unlawful, harmful, deceptive, infringing or privacy-invasive material.</li>
            <li>Post passwords, Wi-Fi credentials, private keys or another person&apos;s personal information.</li>
            <li>Interfere with service security, scrape protected information or overload the service.</li>
            <li>Present another person&apos;s project, code, photograph or review as your own.</li>
          </ul>
          <p>
            You retain ownership of original material you submit. You give REES52 the limited permission needed to store, display, moderate and process it for the Academy feature you selected.
            We will ask before using identifiable learner work in broader marketing unless another valid permission already applies.
          </p>
        </Section>

        <Section title="8. Academy content and licence">
          <p>
            Course structure, text, diagrams, workbooks, branding and original code examples are owned by REES52 or used with permission.
            You may use and print Academy materials for personal learning or supervised classroom teaching.
            You may not resell, republish at scale, remove attribution from or create a competing content library from Academy materials without written permission.
          </p>
        </Section>

        <Section title="9. Availability, suspension and termination">
          <p>
            We aim to keep the Academy available but cannot promise uninterrupted access. Maintenance, security incidents, provider failures or content corrections may cause temporary interruption.
            We may restrict or terminate access for material misuse, security risk or repeated breach of these terms.
            You may stop using the Academy and request account deletion at any time.
          </p>
        </Section>

        <Section title="10. Disclaimers and liability">
          <p>
            To the extent permitted by law, the Academy is provided on an “as available” basis for educational use.
            REES52 does not guarantee that every board variant, third-party library, external video, store product or learner-built circuit will behave identically.
            Nothing in these terms excludes rights or liabilities that cannot lawfully be excluded.
          </p>
          <p>
            To the extent permitted by law, REES52 is not liable for indirect or consequential loss arising from Academy use.
            Users remain responsible for safe assembly, suitable supervision, backups and compliance with local school or workplace rules.
          </p>
        </Section>

        <Section title="11. Governing law, changes and contact">
          <p>
            These terms are governed by the laws of India. Courts in New Delhi will have jurisdiction, subject to any mandatory consumer forum or other right that applies.
            We may update these terms when the Academy or applicable law changes; the effective date will show the latest version.
          </p>
          <p>
            Robotics Embedded Education Services Private Limited<br />
            G-9, Om Vihar Phase 5, Uttam Nagar, New Delhi, India<br />
            <a href="mailto:support@rees52.com">support@rees52.com</a> · <a href="tel:+919599594520">+91 95995 94520</a>
          </p>
        </Section>
      </div>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-xs font-black uppercase tracking-widest text-sky-800">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/cookie-policy">Cookie Policy</Link>
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
