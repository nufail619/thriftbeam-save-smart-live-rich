import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function NewsletterSignup({
  variant = "default",
}: {
  variant?: "default" | "footer" | "coral";
}) {
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("You're subscribed! Welcome to ThriftBeam.");
    setEmail("");
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
              className="flex-1 h-12 px-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground border border-border outline-none focus:border-accent"
            />
            <button className="h-12 px-6 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
              Subscribe
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
          className="flex-1 h-11 px-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary"
        />
        <button className="h-11 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1">
          Join <ArrowRight className="h-4 w-4" />
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
        className="flex-1 h-12 px-4 rounded-xl bg-surface border border-border outline-none focus:border-primary"
      />
      <button className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
        Subscribe
      </button>
    </form>
  );
}
