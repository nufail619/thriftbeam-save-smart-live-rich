import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { newsletterApi } from "@/lib/api/newsletter";

export default function NewsletterSignup({
  variant = "default",
}: {
  variant?: "default" | "footer" | "coral";
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      await newsletterApi.subscribe(email, `site-${variant}`);
      toast.success("You're subscribed! Welcome to ThriftBeam.");
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message || "Could not subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (variant === "coral") {
    return (
      <section className="bg-[#FFE4E6] text-foreground">
        <div className="container-page section-pad text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Get smarter with money, weekly.</h2>
          <p className="mt-3 text-base md:text-lg text-foreground/75 max-w-xl mx-auto">
            One actionable email every Sunday. No fluff. Unsubscribe anytime.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={submitting}
              className="flex-1 h-12 px-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground border border-border outline-none focus:border-accent disabled:opacity-60"
            />
            <button disabled={submitting} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Subscribe
            </button>
          </form>
          <p className="mt-3 text-sm text-foreground/60">Join 10,000+ subscribers</p>
        </div>
      </section>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          disabled={submitting}
          className="flex-1 h-11 px-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary disabled:opacity-60"
        />
        <button disabled={submitting} className="inline-flex items-center gap-1 h-11 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Join <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={submitting}
        className="flex-1 h-12 px-4 rounded-xl bg-surface border border-border outline-none focus:border-primary disabled:opacity-60"
      />
      <button disabled={submitting} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Subscribe
      </button>
    </form>
  );
}
