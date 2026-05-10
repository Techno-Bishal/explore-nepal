"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  location: string;
  imageUrl: string;
  shortDescription: string;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchDestinations = useCallback(async (q: string) => {
    if (!q || q?.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/destinations/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data?.destinations ?? []);
    } catch (e: any) {
      console.error("Search error:", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDestinations(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchDestinations]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={query}
            onChange={(e: any) => setQuery(e?.target?.value ?? "")}
            className="border-0 shadow-none focus-visible:ring-0 text-base px-0"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {(results?.length ?? 0) > 0 && (
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results?.map((r: SearchResult) => (
              <button
                key={r?.id}
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/destinations/${r?.slug}`);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="relative h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={r?.imageUrl ?? "/placeholder.jpg"}
                    alt={r?.name ?? "Destination"}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r?.name ?? ""}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r?.location ?? ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        {query?.length >= 2 && !loading && (results?.length ?? 0) === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No destinations found for &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
