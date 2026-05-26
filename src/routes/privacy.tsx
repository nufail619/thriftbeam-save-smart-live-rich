import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ThriftBeam" },
      { name: "description", content: "How ThriftBeam collects, uses and protects your data." },
      { property: "og:title", content: "Privacy Policy — ThriftBeam" },
      { property: "og:description", content: "Our privacy commitments to readers." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      breadcrumbLabel="Privacy"
      updated="January 1, 2025"
      intro="We respect your privacy. This page explains, in plain language, what we collect and what we do with it."
      sections={[
        { id: "info-we-collect", title: "Information We Collect", body: <>
          <p>When you visit ThriftBeam, we collect basic technical information automatically: the pages you view, the device and browser you use, and approximate location based on IP address. If you subscribe to our newsletter or contact us, we also collect the email address and any other info you choose to send.</p>
        </>},
        { id: "how-we-use", title: "How We Use It", body: <>
          <p>We use this information to (a) deliver and improve the site, (b) measure which articles are useful, and (c) respond to your messages. We never sell your personal information to third parties.</p>
        </>},
        { id: "cookies", title: "Cookies", body: <>
          <p>We use a small number of cookies for analytics, advertising and remembering your theme preference. You can review and adjust your choices anytime via the cookie banner — or by clearing your browser cookies.</p>
        </>},
        { id: "third-parties", title: "Third Parties", body: <>
          <p>We work with reputable analytics and ad providers (e.g. Google Analytics, AdSense) that may set their own cookies. Each provider has its own privacy policy, and you can opt out at the provider level if you prefer.</p>
        </>},
        { id: "your-rights", title: "Your Rights", body: <>
          <p>Depending on where you live, you may have the right to access, correct, or delete your personal information, or to object to certain processing. To exercise these rights, email us at the address below.</p>
        </>},
        { id: "contact", title: "Contact", body: <>
          <p>Privacy questions? Email <a href="mailto:hello@thriftbeam.com">hello@thriftbeam.com</a> and we'll respond within two business days.</p>
        </>},
      ]}
    />
  );
}
