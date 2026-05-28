import { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | REES52",
  description: "Read the REES52 Terms & Conditions. Understand the terms of use, membership rules, copyright details, and service modification conditions.",
  keywords: ["REES52 Terms and Conditions", "user agreement", "service terms"],
};

export default function TermsPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
      {/* Page Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
          <FileText className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-slate-900">
          Terms & Conditions
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mt-3">
          PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY!
        </p>
      </div>

      {/* Terms Card Container */}
      <div className="glassmorphism bg-white/70 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 space-y-8 text-sm text-slate-700 leading-relaxed font-semibold">
        <section className="space-y-4">
          <p>
            Welcome to <strong>www.rees52.com</strong>! These Terms of Use describe the terms and conditions applicable to your access and use of the website at www.rees52.com (referred to as &quot;Site&quot;). This document is a legally binding agreement between you as the user(s) of the Site (referred to as &quot;you&quot;, &quot;your&quot; or &quot;User&quot; hereinafter) and the rees52.com entity listed below (referred to as &quot;we&quot;, &quot;our&quot; or &quot;rees52.com&quot; hereinafter).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
            1. Application and Acceptance of the Terms
          </h2>
          <p>
            Your use of the Site and rees52.com services, software and products (collectively as the &quot;Services&quot; hereinafter) is subject to the terms and conditions contained in this document as well as the Privacy Policy and any other rules and policies of the Site that rees52.com may publish from time to time. This document and such other rules and policies of the Site are collectively referred to below as the &quot;Terms&quot;. By accessing the Site or using the Services, you agree to accept and be bound by the Terms. Please do not use the Services or the Site if you do not accept all of the Terms.
          </p>
          <p>
            You may not use the Services and may not accept the Terms if (a) you are not of legal age to form a binding contract with rees52.com.
          </p>
          <p>
            You acknowledge and agree that rees52.com may amend any Terms at any time by posting the relevant amended and restated Terms on the Site. By continuing to use the Services or the Site, you agree that the amended Terms will apply to you.
          </p>
          <p>
            If rees52.com has posted or provided a translation of the English language version of the Terms, you agree that the translation is provided for convenience only and that the English language version will govern your uses of the Services or the Site.
          </p>
          <p>
            You may be required to enter into a separate agreement, whether online or offline, with rees52.com or our affiliate for any Service (&quot;Additional Agreements&quot;). If there is any conflict or inconsistency between the Terms and an Additional Agreement, the Additional Agreement shall take precedence over the Terms only in relation to that Service concerned.
          </p>
          <p>
            The Terms may not otherwise be modified except in writing by an authorized officer of rees52.com.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
            2. Users Generally
          </h2>
          <p>
            As a condition of your access to and use of the Site or Services, you agree that you will comply with all applicable laws and regulations when using the Site or Services.
          </p>
          <p>
            You agree to use the Site or Services solely for your own private and internal purposes. You agree that (a) you will not copy, reproduce, download, re-publish, sell, distribute or resell any Services or any information, text, images, graphics, video clips, sound, directories, files, databases or listings, etc available on or through the Site (the &quot;Site Content&quot;), and (b) you will not copy, reproduce, download, compile or otherwise use any Site Content for the purposes of operating a business that competes with rees52.com, or otherwise commercially exploiting the Site Content. Systematic retrieval of Site Content from the Site to create or compile, directly or indirectly, a collection, compilation, database or directory (whether through robots, spiders, automatic devices or manual processes) without written permission from rees52.com is prohibited. Use of any content or materials on the Site for any purpose not expressly permitted in the Terms is prohibited.
          </p>
          <p>
            You must read REES52&apos;s Privacy Policy which governs the protection and use of personal information about Users in the possession of rees52.com and our affiliates. You accept the terms of the Privacy Policy and agree to the use of the personal information about you in accordance with the Privacy Policy.
          </p>
          <p>
            rees52.com may allow Users to access to content, products or services offered by third parties through hyperlinks (in the form of word link, banners, channels or otherwise), API or otherwise to such third parties&apos; web site. You are cautioned to read such web site&apos; terms and conditions and/or privacy policies before using the Site. You acknowledge that rees52.com has no control over such third parties&apos; web site, does not monitor such web site, and shall not be responsible or liable to anyone for such web site, or any content, products or services made available on such web site.
          </p>
          <p>
            You agree not to undertake any action to undermine the integrity of the computer systems or networks of rees52.com and / or any other User nor to gain unauthorized access to such computer systems or networks.
          </p>
          <p>
            You agree not to undertake any action which may undermine the integrity of REES52&apos;s feedback system, such as leaving positive feedback for yourself using secondary Member IDs or through third parties or by leaving unsubstantiated negative feedback for another User.
          </p>
          <p>
            By posting or displaying any information, content or material (&quot;User Content&quot;) on the Site or providing any User Content to rees52.com or our representative(s), you grant an irrevocable, perpetual, worldwide, royalty-free, and sub-licensable (through multiple tiers) license to rees52.com to display, transmit, distribute, reproduce, publish, duplicate, adapt, modify, translate, create derivative works, and otherwise use any or all of the User Content in any form, media, or technology now known or not currently known in any manner and for any purpose which may be beneficial to the operation of the Site, the provision of any Services and/or the business of the User. You confirm and warrant to rees52.com that you have all the rights, power and authority necessary to grant the above license.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
            3. Member Accounts
          </h2>
          <p>
            User must be registered on the Site to access or use some Services (a registered User is also referred to as a &quot;Member&quot; below). Except with rees52.com&apos;s approval, one User may only register one member account on the Site. rees52.com may cancel or terminate a User&apos;s member account if rees52.com has reasons to suspect that the User has concurrently registered or controlled two or more member accounts. Further, rees52.com may reject User&apos;s application for registration for any reason.
          </p>
          <p>
            Upon registration on the Site, rees52.com shall assign an account and issue a member ID and password (the latter shall be chosen by a registered User during registration) to each registered User. An account may have a web-based email account with limited storage space for the Member to send or receive emails.
          </p>
          <p>
            A set of Member ID and password is unique to a single account. Each Member shall be solely responsible for maintaining the confidentiality and security of your Member ID and password and for all activities that occur under your account. No Member may share, assign, or permit the use of your Member account, ID or password by another person outside of the Member&apos;s own business entity. Member agrees to notify rees52.com immediately if you become aware of any unauthorized use of your password or your account or any other breach of security of your account.
          </p>
          <p>
            Member acknowledges that sharing of your account with other persons, or allowing multiple users outside of your business entity to use your account (collectively, &quot;multiple use&quot;), may cause irreparable harm to rees52.com or other Users of the Site. Member shall indemnify rees52.com, our affiliates, directors, employees, agents and representatives against any loss or damages (including but not limited to loss of profits) suffered as a result of the multiple use of your account. Member also agrees that in case of the multiple use of your account or Member&apos;s failure to maintain the security of your account, rees52.com shall not be liable for any loss or damages arising from such a breach and shall have the right to suspend or terminate Member&apos;s account without liability to Member.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
            4. Modifications to Services and Pricing
          </h2>
          <p>
            Prices of products listed on our store are subject to change at any time without prior notice.
          </p>
          <p>
            REES52 reserves the right to modify, update, suspend, or discontinue any product, service, feature, or content of the website, either temporarily or permanently, without prior notice.
          </p>
          <p>
            We shall not be held liable to you or to any third party for any modification, price revision, suspension, or discontinuation of any product or service offered through our store.
          </p>
          <p>
            If you order a product that is currently in Preorder , and the price of that item increases in the future, you will be required to pay the difference in price.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
            5. Copyright and Patents
          </h2>
          <p>
            All content included on this site, such as text, graphics, logos, button icons, images, and audio clips, digital downloads, data compilations, and software, is the property of rees52.com or its content suppliers and protected by international copyright laws. The use of any rees52.com trademark or service mark without our express written consent is strictly prohibited.
          </p>
        </section>

        {/* Corporate contact block inside terms */}
        <section className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">
              Robotics Embedded Education Services Pvt Ltd.
            </h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              G-9 OM VIHAR PHASE 5 UTTAM NAGAR NEW DELHI
            </p>
          </div>
          <div className="space-y-1 text-xs font-semibold">
            <p className="text-slate-800">
              <strong className="text-slate-900">Contact No:</strong> +91 959959 4520
            </p>
            <p className="text-slate-850">
              <strong className="text-slate-900">Mail ID:</strong> support@rees52.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
