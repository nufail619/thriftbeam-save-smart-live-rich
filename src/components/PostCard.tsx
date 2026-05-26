import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { type Post, getAuthor, getCategory, formatDate } from "@/lib/mockData";

export default function PostCard({ post, size = "default" }: { post: Post; size?: "default" | "large" }) {
  const author = getAuthor(post.authorSlug);
  const category = getCategory(post.category);
  const isLarge = size === "large";

  return (
    <article className={`group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col`}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block aspect-video overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          width={1200}
          height={675}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        {category && (
          <Link
            to="/blog"
            search={{ category: category.slug }}
            className="inline-flex self-start mb-3 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
          >
            {category.name}
          </Link>
        )}
        <h3 className={`${isLarge ? "text-xl md:text-2xl" : "text-lg"} font-bold leading-tight line-clamp-2`}>
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-xs text-muted-foreground mt-auto">
          {author && (
            <>
              <img src={author.avatar} alt="" loading="lazy" decoding="async" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              <span className="font-medium text-foreground">{author.name}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span className="ml-auto inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min</span>
        </div>
      </div>
    </article>
  );
}
