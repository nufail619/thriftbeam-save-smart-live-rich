import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { type Category } from "@/lib/mockData";

export default function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <Link
      to="/blog"
      search={{ category: category.slug }}
      className="group block rounded-2xl p-6 bg-card border border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg">{category.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Read articles <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
