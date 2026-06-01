import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | REES52",
  description: "Read the REES52 Privacy Policy to understand how we collect, use, and protect your personal data when using our services.",
  keywords: ["REES52 Privacy Policy", "Shopify cookies", "personal data protection"],
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
      {/* Page Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-sm mb-4">
          <Shield className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-slate-900">
          Privacy Policy
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mt-3">
          Last Updated: May 2026
        </p>
      </div>

      {/* Policy Card Container */}
      <div className="glassmorphism bg-white/70 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50 space-y-8 text-sm text-slate-700 leading-relaxed font-semibold">
        <section className="space-y-4">
          <p>
            This Privacy Policy describes how REES52 collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from <strong>rees52.com</strong>. For purposes of this Privacy Policy, &quot;you&quot; and &quot;your&quot; means you as the Services user, whether you are a customer, website visitor, or another individual whose information we have collected pursuant to this Privacy Policy.
          </p>
          <p>
            Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use or access any of the Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the &quot;Last updated&quot; date and take any other steps required by applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            How We Collect and Use Your Personal Information
          </h2>
          <p>
            To provide the Services, we collect and have collected over the past 12 months personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.
          </p>
          <p>
            In addition to the specific uses set out below, we may use the information we collect about you to communicate with you, provide the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and protect or defend the Services, our rights, and the rights of our users or others.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            What Personal Information We Collect
          </h2>
          <p>
            The types of personal information we obtain about you depend on how you interact with our Site and use our Services. When we use the term &quot;personal information&quot;, we are referring to information that identifies, relates to, describes or can be associated with you. The following sections describe the categories and specific types of personal information we collect.
          </p>

          <div className="space-y-3 pl-2 border-l-2 border-cyan-500/30">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Information We Collect Directly from You
            </h3>
            <p>
              Information that you directly submit to us through our Services may include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Basic contact details including your name, address, phone number, and email.</li>
              <li>Order information includes your name, billing address, shipping address, payment confirmation, email address, and phone number.</li>
              <li>Account information including your username, password, and security questions.</li>
              <li>Shopping information including the items you view, put in your cart or add to your wishlist.</li>
              <li>Customer support information including the information you choose to include in communications with us, for example, when sending a message through the Services.</li>
            </ul>
            <p className="text-xs">
              Some features of the Services may require you to directly provide us with certain information about yourself. You may elect not to provide this information, but doing so may prevent you from using or accessing these features.
            </p>
          </div>

          <div className="space-y-3 pl-2 border-l-2 border-cyan-500/30">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Information We Collect Through Cookies
            </h3>
            <p>
              We also automatically collect certain information about your interaction with the Services (&quot;Usage Data&quot;). To do this, we may use cookies, pixels and similar technologies (&quot;Cookies&quot;). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.
            </p>
          </div>

          <div className="space-y-3 pl-2 border-l-2 border-cyan-500/30">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Information We Obtain from Third Parties
            </h3>
            <p>
              Finally, we may obtain information about you from third parties, including from vendors and service providers who may collect information on our behalf, such as:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Companies who support our Site and Services, such as Shopify.</li>
              <li>Our payment processors collect payment information (e.g., bank account, credit or debit card information, billing address) to process your payment in order to fulfil your orders and provide you with products or services you have requested, in order to perform our contract with you.</li>
            </ul>
            <p className="text-xs">
              When you visit our Site, open or click on emails we send you, or interact with our Services or advertisements, we, or third parties we work with, may automatically collect certain information using online tracking technologies such as pixels, web beacons, software developer kits, third-party libraries, and cookies.
            </p>
            <p className="text-xs">
              Any information we obtain from third parties will be treated in accordance with this Privacy Policy. We are not responsible or liable for the accuracy of the information provided to us by third parties and are not responsible for any third party&apos;s policies or practices. For more information, see the section below, <em>Third Party Websites and Links</em>.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            How We Use Your Personal Information
          </h2>
          <ul className="space-y-3 text-xs text-slate-600">
            <li>
              <strong className="text-slate-900">Providing Products and Services:</strong> We use your personal information to provide you with the Services in order to perform our contract with you, including processing your payments, fulfil your orders, sending notifications to you related to your account, purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, facilitate any returns and exchanges and to enable you to post reviews.
            </li>
            <li>
              <strong className="text-slate-900">Marketing and Advertising:</strong> We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you advertisements for products or services. This may include using your personal information to better tailor the Services and advertising on our Site and other websites.
            </li>
            <li>
              <strong className="text-slate-900">Security and Fraud Prevention:</strong> We use your personal information to detect, investigate or take action regarding possible fraudulent, illegal or malicious activity. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password, or other access details with anyone else. If you believe your account has been compromised, please contact us immediately.
            </li>
            <li>
              <strong className="text-slate-900">Communicating with you:</strong> We use your personal information to provide you with customer support and improve our Services. This is in our legitimate interests in order to be responsive to you, to provide effective services to you, and to maintain our business relationship with you.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Cookies
          </h2>
          <p>
            Like many websites, we use Cookies on our Site. For specific information about the Cookies we use related to powering our store with Shopify, see <a href="https://www.shopify.com/legal/cookies" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline">https://www.shopify.com/legal/cookies</a>. We use Cookies to power and improve our Site and our Services (including to remember your actions and preferences), to run analytics and to better understand user interaction with the Services (in our legitimate interests to administer, improve and optimize the Services). We may also permit third parties and service providers to use Cookies on our Site to better tailor the services, products and advertising on our Site and other websites.
          </p>
          <p>
            Most browsers automatically accept Cookies by default, but you can choose to set your browser to remove or reject Cookies through your browser controls. Please keep in mind that removing or blocking Cookies can negatively impact your user experience and may cause some of the Services, including certain features and general functionality, to work incorrectly or no longer be available. Additionally, blocking Cookies may not completely prevent how we share information with third parties such as our advertising partners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            How We Disclose Personal Information
          </h2>
          <p>
            In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>With vendors or other third parties who perform services on our behalf (e.g., IT management, payment processing, data analytics, customer support, cloud storage, fulfilment and shipping).</li>
            <li>When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship your products or through your use of social media widgets or login integrations, with your consent.</li>
            <li>With our affiliates or otherwise within our corporate group, in our legitimate interests to run a successful business.</li>
            <li>In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including responding to subpoenas, search warrants and similar requests), to enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.</li>
          </ul>

          <p className="mt-4">
            We have, in the past 12 months disclosed the following categories of personal information and sensitive personal information (denoted by *) about users for the purposes set out above in &quot;How We Collect and Use Your Personal Information&quot; and &quot;How We Disclose Personal Information&quot;:
          </p>

          <div className="overflow-x-auto mt-4 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/5 border-b border-slate-200">
                  <th className="p-3 font-black uppercase text-slate-900">Category</th>
                  <th className="p-3 font-black uppercase text-slate-900">Categories of Recipients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-3 text-slate-800">
                    Identifiers such as basic contact details and certain order and account information
                  </td>
                  <td className="p-3 text-slate-600" rowSpan={3}>
                    Vendors and third parties who perform services on our behalf (such as Internet service providers, payment processors, fulfilment partners, customer support partners and data analytics providers)<br />
                    Business and marketing partners<br />
                    Affiliates
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800 border-t border-slate-200">
                    Commercial information such as order information, shopping information and customer support information
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-800 border-t border-slate-200">
                    Internet or other similar network activity, such as Usage Data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs">
            We do not use or disclose sensitive personal information for the purposes of inferring characteristics about you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            User Generated Content
          </h2>
          <p>
            The Services may enable you to post product reviews and other user-generated content. If you choose to submit user-generated content to any public area of the Services, this content will be public and accessible to anyone.
          </p>
          <p>
            We do not control who will have access to the information that you choose to make available to others and cannot ensure that parties who have access to such information will respect your privacy or keep it secure. We are not responsible for the privacy or security of any information that you make publicly available, or for the accuracy, use or misuse of any information that you disclose or receive from third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Third-Party Websites and Links
          </h2>
          <p>
            Our Site may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Security and Retention of Your Information
          </h2>
          <p>
            Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee “perfect security.” In addition, any information you send to us may not be secure while in transit. We recommend that you do not use insecure channels to communicate sensitive or confidential information to us.
          </p>
          <p>
            How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, provide the Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Your Rights and Choices
          </h2>
          <p>
            Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li><strong className="text-slate-900">Right to Access / Know:</strong> You may have a right to request access to personal information that we hold about you, including details relating to the ways in which we use and share your information.</li>
            <li><strong className="text-slate-900">Right to Delete:</strong> You may have a right to request that we delete the personal information we maintain about you.</li>
            <li><strong className="text-slate-900">Right to Correct:</strong> You may have a right to request that we correct the inaccurate personal information we maintain about you.</li>
            <li><strong className="text-slate-900">Right of Portability:</strong> You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.</li>
            <li><strong className="text-slate-900">Restriction of Processing:</strong> You may have the right to ask us to stop or restrict our processing of personal information.</li>
            <li><strong className="text-slate-900">Withdrawal of Consent:</strong> Where we rely on consent to process your personal information, you may have the right to withdraw this consent.</li>
            <li><strong className="text-slate-900">Appeal:</strong> You may have a right to appeal our decision if we decline to process your request. You can do so by replying directly to our denial.</li>
            <li><strong className="text-slate-900">Managing Communication Preferences:</strong> We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt-out, we may still send you non-promotional emails, such as those about your account or orders that you have made.</li>
          </ul>
          <p>
            You may exercise any of these rights where indicated on our Site or by contacting us using the contact details provided below.
          </p>
          <p>
            We will not discriminate against you for exercising any of these rights. We may need to collect information from you to verify your identity, such as your email address or account information, before providing a substantive response to the request. In accordance with applicable laws, You may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Complaints
          </h2>
          <p>
            If you have complaints about how we process your personal information, please contact us using the contact details provided below. If you are not satisfied with our response to your complaint, depending on where you live you may have the right to appeal our decision by contacting us using the contact details set out below or lodge your complaint with your local data protection authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            International Users
          </h2>
          <p>
            Please note that we may transfer, store and process your personal information outside the country you live in, including the United States. Your personal information is also processed by staff and third-party service providers and partners in these countries.
          </p>
          <p>
            If we transfer your personal information out of Europe, we will rely on recognized transfer mechanisms like the European Commission&apos;s Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
            Contact
          </h2>
          <p>
            Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please call <strong>+91 95995 94520</strong> or email us at <a href="mailto:info@rees52.in" className="text-cyan-600 underline">info@rees52.in</a> or contact us at <strong>G-9, Om Vihar, phase-5, Uttam nagar, 110059 new delhi DL, India</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
