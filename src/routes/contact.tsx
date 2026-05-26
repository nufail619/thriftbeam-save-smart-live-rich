import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Clock, Twitter, Facebook, Linkedin, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ThriftBeam" },
      { name: "description", content: "Get in touch with the ThriftBeam team. We read every message." },
      { property: "og:title", content: "Contact ThriftBeam" },
      { property: "og:description", content: "Send us a question, tip, or story idea." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const FAQS = [
  { q: "How quickly do you respond?", a: "Within 2 business days. Story tips and corrections get bumped to the top of the queue." },
  { q: "Do you accept guest posts?", a: "Occasionally — for writers with deep experience in budgeting, debt or frugal living. Send a 3-sentence pitch with your background." },
  { q: "How is ThriftBeam funded?", a: "Display ads and a small number of affiliate links. We disclose every commercial relationship on every relevant article." },
  { q: "Will you review my product?", a: "We only review products we'd genuinely use. Paid reviews are not on the menu — please don't pitch them." },
  { q: "Is this financial advice?", a: "No. ThriftBeam is education, not personal advice. See our disclaimer page for details." },
];

function ContactPage() {
  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Message sent — we'll be in touch soon.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-sm text-primary font-semibold uppercase tracking-wide">Contact</p>
      <h1 className="mt-2 text-4xl md:text-5xl font-bold">Get in touch</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        Questions, tips, corrections, kind words — we read every message. Pick a channel below.
      </p>

      <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-8">
        <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Your name"><input required className="form-input" placeholder="Jane Smith" /></FormField>
            <FormField label="Email"><input required type="email" className="form-input" placeholder="you@example.com" /></FormField>
          </div>
          <FormField label="Subject"><input required className="form-input" placeholder="A quick question about…" /></FormField>
          <FormField label="Message">
            <textarea required rows={6} className="form-input resize-y" placeholder="Tell us what's on your mind…" />
          </FormField>
          <button className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Send message
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface border border-border p-6">
            <h3 className="font-bold mb-4">Reach us directly</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">hello@thriftbeam.com</div>
                  <div className="text-muted-foreground text-xs">General inquiries</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Within 2 business days</div>
                  <div className="text-muted-foreground text-xs">Average response time</div>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Follow us</p>
              <div className="flex gap-2">
                {[Twitter, Facebook, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social" className="h-10 w-10 rounded-lg border border-border inline-flex items-center justify-center hover:bg-card hover:border-primary hover:text-primary transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between p-5 font-semibold">
                {f.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <style>{`.form-input{width:100%;padding:0 1rem;height:48px;border-radius:12px;border:1px solid var(--color-border);background:var(--color-background);outline:none;font-size:0.95rem}.form-input:focus{border-color:var(--color-primary)}textarea.form-input{padding:0.75rem 1rem;height:auto;line-height:1.5}`}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
