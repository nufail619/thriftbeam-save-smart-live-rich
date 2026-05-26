import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/LegalLayout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — ThriftBeam" },
      { name: "description", content: "Editorial independence, affiliate disclosure, and a reminder that ThriftBeam is education — not personal financial advice." },
      { property: "og:title", content: "Disclaimer — ThriftBeam" },
      { property: "og:description", content: "How ThriftBeam approaches editorial independence and affiliate links." },
      { property: "og:url", content: "/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      breadcrumbLabel="Disclaimer"
      updated="January 1, 2025"
      intro="Important context about what ThriftBeam is — and what it isn't."
      sections={[
        { id: "editorial", title: "Editorial independence", body: <>
          <p>ThriftBeam's editorial team chooses every topic. No advertiser, affiliate partner or sponsor has any input on what we publish, the conclusions we reach, or the products we recommend. If a relationship would create a conflict of interest, we either disclose it prominently or decline the partnership.</p>
        </>},
        { id: "affiliate", title: "Affiliate disclosure", body: <>
          <p>Some links on ThriftBeam are affiliate links — we earn a small commission if you sign up or purchase, at no extra cost to you. Commissions never influence which products we recommend or how we rank them. We only link to products we'd recommend to a friend.</p>
        </>},
        { id: "not-advice", title: "Not financial advice", body: <>
          <p>ThriftBeam publishes educational content for a general audience. We're not licensed financial advisors, accountants or tax professionals, and nothing on this site should be treated as personal financial, investment, tax or legal advice. For decisions tied to your specific situation, please speak with a qualified professional.</p>
        </>},
        { id: "accuracy", title: "Accuracy disclaimer", body: <>
          <p>We work hard to keep articles accurate and up to date, but rates, terms, products and tax rules change frequently. Always verify current details on the official source before acting. If you spot something out of date, please email us — corrections get fast-tracked.</p>
        </>},
      ]}
    />
  );
}
