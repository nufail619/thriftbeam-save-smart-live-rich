import { createFileRoute } from "@tanstack/react-router";
import { cloneElement, useId, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { Mail, Clock, Twitter, Facebook, Linkedin, ChevronDown, Loader2 } from "lucide-react";
import { contactApi } from "@/lib/api/contact";

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

const SOCIALS = [
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Linkedin, label: "LinkedIn", href: "#" },
];

const INPUT_CLASS =
  "w-full h-12 px-4 rounded-xl border border-border bg-background text-base text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60";

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    setSubmitting(true);
    try {
      await contactApi.send(payload);
      toast.success("Message sent — we'll be in touch soon.");
      form.reset();
    } catch (err) {
      toast.error((err as Error).message || "Could not send message");
    } finally {
      setSubmitting(false);
    }
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
            <FormField label="Your name">
              <input name="name" required autoComplete="name" placeholder="Jane Smith" disabled={submitting} className={INPUT_CLASS} />
            </FormField>
            <FormField label="Email">
              <input name="email" required type="email" autoComplete="email" placeholder="you@example.com" disabled={submitting} className={INPUT_CLASS} />
            </FormField>
          </div>
          <FormField label="Subject">
            <input name="subject" required placeholder="A quick question about…" disabled={submitting} className={INPUT_CLASS} />
          </FormField>
          <FormField label="Message">
            <textarea
              name="message"
              required
              rows={6}
              placeholder="Tell us what's on your mind…"
              disabled={submitting}
              className={`${INPUT_CLASS} h-auto py-3 resize-y leading-relaxed`}
            />
          </FormField>
          <button disabled={submitting} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Send message
          </button>
        </form>


        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface border border-border p-6">
            <h2 className="font-bold mb-4 text-base">Reach us directly</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-medium">hello@thriftbeam.com</div>
                  <div className="text-muted-foreground text-xs">General inquiries</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-medium">Within 2 business days</div>
                  <div className="text-muted-foreground text-xs">Average response time</div>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Follow us</p>
              <div className="flex gap-2">
                {SOCIALS.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={`Follow ThriftBeam on ${label}`}
                    className="h-11 w-11 rounded-lg border border-border inline-flex items-center justify-center hover:bg-card hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
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
              <summary className="cursor-pointer list-none flex items-center justify-between p-5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-xl">
                {f.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return (
    <div className="block">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1.5">{cloneElement(children, { id })}</div>
    </div>
  );
}
