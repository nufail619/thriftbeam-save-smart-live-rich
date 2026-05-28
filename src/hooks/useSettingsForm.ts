// Reusable hook + setting-group helpers for admin settings forms.
// Loads /settings, exposes a single group, and saves the whole group via PUT /settings/{key}.

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSiteSettings, SETTINGS_QUERY_KEY } from "@/context/SettingsContext";
import { siteSettingsApi } from "@/lib/api/siteSettings";

export function useSettingsForm<T extends Record<string, unknown>>(groupName: string, defaults: T) {
  const { settings, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<T>(defaults);

  useEffect(() => {
    const g = (settings[groupName] ?? {}) as Record<string, unknown>;
    setDraft({ ...defaults, ...g } as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, groupName]);

  const mut = useMutation({
    mutationFn: (next: T) => siteSettingsApi.updateGroup(groupName, next),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return {
    draft,
    setDraft,
    set: <K extends keyof T>(key: K, value: T[K]) => setDraft((d) => ({ ...d, [key]: value })),
    save: () => mut.mutate(draft),
    saving: mut.isPending,
    isLoading,
  };
}
