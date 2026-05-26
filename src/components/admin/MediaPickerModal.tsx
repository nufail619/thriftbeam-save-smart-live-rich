import { useMemo, useState } from "react";
import { Search, FileImage, FileText, Upload, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mediaApi } from "@/lib/api/media";
import { formatBytes } from "@/lib/adminStore";
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
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
    enabled: open,
  });
  const media: MediaItem[] = data ?? [];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return media.filter((m) => m.type === "image" && (!q || m.filename.toLowerCase().includes(q)));
  }, [media, query]);

  const selectedItem = filtered.find((m) => m.id === selected) ?? null;

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const it = await mediaApi.upload(file);
      toast.success("Uploaded");
      await refetch();
      if (it?.id) setSelected(it.id);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

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
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
          <div className="grid max-h-[420px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
            {isLoading ? (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
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
                  {selectedItem.width ? `${selectedItem.width}×${selectedItem.height} · ` : ""}{formatBytes(selectedItem.size)}
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
