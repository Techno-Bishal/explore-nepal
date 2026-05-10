"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter, X, Loader2, Mountain, SlidersHorizontal, ChevronLeft, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Mountains", value: "mountain" },
  { label: "Trekking", value: "trekking" },
  { label: "Nature", value: "nature" },
  { label: "Cities", value: "city" },
  { label: "Adventure", value: "adventure" },
  { label: "Temples", value: "temple" },
  { label: "Lakes", value: "lake" },
  { label: "Wildlife", value: "wildlife" },
  { label: "Cultural", value: "cultural" },
  { label: "Hidden Gems", value: "hidden-gem" },
  { label: "Cable Car", value: "cable-car" },
  { label: "Pilgrimage", value: "pilgrimage" },
];

export function DestinationsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams?.get("category") ?? "";
  const difficulty = searchParams?.get("difficulty") ?? "";
  const budget = searchParams?.get("budget") ?? "";
  const familyFriendly = searchParams?.get("familyFriendly") ?? "";
  const featured = searchParams?.get("featured") ?? "";
  const trending = searchParams?.get("trending") ?? "";
  const sortBy = searchParams?.get("sortBy") ?? "name";
  const page = parseInt(searchParams?.get("page") ?? "1", 10);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/destinations?${params.toString()}`);
  }, [searchParams, router]);

  const clearFilters = useCallback(() => {
    router.push("/destinations");
  }, [router]);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (difficulty) params.set("difficulty", difficulty);
        if (budget) params.set("budget", budget);
        if (familyFriendly) params.set("familyFriendly", familyFriendly);
        if (featured) params.set("featured", featured);
        if (trending) params.set("trending", trending);
        if (sortBy) params.set("sortBy", sortBy);
        params.set("page", String(page ?? 1));
        params.set("limit", "12");

        const res = await fetch(`/api/destinations?${params.toString()}`);
        const data = await res.json();
        setDestinations(data?.destinations ?? []);
        setTotal(data?.total ?? 0);
        setTotalPages(data?.totalPages ?? 1);
      } catch (e: any) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [category, difficulty, budget, familyFriendly, featured, trending, sortBy, page]);

  const activeFilters = [category, difficulty, budget, familyFriendly, featured, trending].filter(Boolean);

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {featured ? "Featured" : trending ? "Trending" : category ? CATEGORIES.find((c: any) => c?.value === category)?.label ?? "" : "All"} Destinations
          </h1>
          <p className="text-muted-foreground">
            {total} destination{total !== 1 ? "s" : ""} to explore
          </p>
        </motion.div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            className="h-9 w-9 relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {(activeFilters?.length ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full" aria-hidden="true" />
            )}
          </Button>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES?.map((cat: any) => (
              <Link
                key={cat?.value ?? "all"}
                href={cat?.value === category ? "/destinations" : `/destinations?category=${cat?.value ?? ""}`}
              >
                <Button
                  variant={category === (cat?.value ?? "") ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {cat?.label ?? ""}
                </Button>
              </Link>
            ))}
          </div>

          {(activeFilters?.length ?? 0) > 0 && (
            <Link href="/destinations">
              <Button variant="outline" size="sm" className="gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                <X className="h-3 w-3" />
                Clear all
              </Button>
            </Link>
          )}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 1, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-lg bg-card border border-border/50"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Difficulty</label>
                <Select value={difficulty} onValueChange={(v: string) => updateParam("difficulty", v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget</label>
                <Select value={budget} onValueChange={(v: string) => updateParam("budget", v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="budget">Budget-Friendly</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v: string) => updateParam("sortBy", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="altitude">Altitude</SelectItem>
                    <SelectItem value="adventure">Adventure Level</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant={familyFriendly === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateParam("familyFriendly", familyFriendly === "true" ? "" : "true")}
                  className="w-full h-9"
                >
                  Family Friendly
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (destinations?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mountain className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No destinations found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Link href="/destinations"><Button variant="outline">Clear Filters</Button></Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations?.map((d: any, i: number) => (
                <DestinationCard key={d?.id ?? i} destination={d} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {(totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParam("page", String((page ?? 1) - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page ?? 1} of {totalPages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParam("page", String((page ?? 1) + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
