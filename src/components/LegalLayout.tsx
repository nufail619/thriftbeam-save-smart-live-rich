import type { ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

type Section = { id: string; title: string; body: ReactNode };

export default function LegalLayout({
  title,
  intro,
  updated,
  sections,
  breadcrumbLabel,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: Section[];
  breadcrumbLabel: string;
}) {
  return (
    <div className="container-page py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: breadcrumbLabel }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold">{title}</h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>
      </header>

      <div className="mt-10 grid lg:grid-cols-[1fr_240px] gap-10">
        <div className="prose-tb prose-container lg:mx-0 space-y-10">

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <div className="mt-3 text-foreground/85 leading-relaxed space-y-3">{s.body}</div>
            </section>
          ))}
        </div>
        <aside className="hidden lg:block">
          <nav className="sticky top-20 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">On this page</h3>
            <ul className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-primary block py-0.5">{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
