import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

export default function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [val, setVal] = useState("");

  const add = (v: string) => {
    const t = v.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
    setVal("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(val);
    } else if (e.key === "Backspace" && !val && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-background p-1.5 focus-within:ring-2 focus-within:ring-primary/40">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => add(val)}
        placeholder="Add tag…"
        className="h-6 min-w-[80px] flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
