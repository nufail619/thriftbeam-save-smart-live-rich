import { useMemo, useState } from "react";
import { Search, FileImage, FileText, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMedia, mediaApi, formatBytes } from "@/lib/adminStore";
import type { MediaItem } from "@/lib/mockAdminData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (item: MediaItem) => void;
}) {
  const media = useMedia();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return media.filter((m) => m.type === "image" && (!q || m.filename.toLowerCase().includes(q)));
  }, [media, query]);

  const selectedItem = filtered.find((m) => m.id === selected) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select an image</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media…"
            className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => {
              const [it] = mediaApi.uploadMock(1);
              toast.success("Uploaded 1 file (mock)");
              if (it) setSelected(it.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
          <div className="grid max-h-[420px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
            {filtered.length === 0 ? (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                <FileImage className="mx-auto mb-2 h-8 w-8" />
                No images found.
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
                    selected === m.id && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  {m.type === "image" ? (
                    <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="m-auto h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
          <aside className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            {selectedItem ? (
              <>
                <img src={selectedItem.url} alt={selectedItem.alt} className="aspect-square w-full rounded-md object-cover" />
                <p className="mt-2 truncate text-xs font-medium">{selectedItem.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.width}×{selectedItem.height} · {formatBytes(selectedItem.size)}
                </p>
                <button
                  type="button"
                  onClick={() => onSelect(selectedItem)}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Use this image
                </button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Pick an image to see details.</p>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
