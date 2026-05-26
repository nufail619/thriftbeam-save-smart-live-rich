import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  accessor?: (row: T) => string | number;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
  empty?: ReactNode;
};

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize = 20,
  searchable = false,
  searchPlaceholder = "Search…",
  searchAccessor,
  empty,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return rows;
    const q = query.toLowerCase();
    const acc = searchAccessor ?? ((r: T) => Object.values(r as object).join(" "));
    return rows.filter((r) => String(acc(r)).toLowerCase().includes(q));
  }, [rows, query, searchable, searchAccessor]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.accessor) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      {searchable && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("px-4", c.className)}>
                {c.sortable && c.accessor ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    {c.header}
                    {sortKey === c.key ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </button>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.header}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-12 text-center">
                {empty ?? <span className="text-sm text-muted-foreground">No results.</span>}
              </TableCell>
            </TableRow>
          ) : (
            paged.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn("px-4 py-3", c.className)}>
                    {c.render ? c.render(row) : c.accessor ? String(c.accessor(row)) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            Page {safePage} of {totalPages} · {sorted.length} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-lg border border-border px-3 font-medium disabled:opacity-50 hover:bg-muted"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-lg border border-border px-3 font-medium disabled:opacity-50 hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
