"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DestinationCard } from "@/components/destination-card";
import { Heart, Loader2, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function FavoritesClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data?.favorites ?? []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, fetchFavorites]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            My Favorites
          </h1>
          <p className="text-muted-foreground">{favorites?.length ?? 0} saved destination{(favorites?.length ?? 0) !== 1 ? "s" : ""}</p>
        </motion.div>

        {(favorites?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mountain className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">Start exploring and save your dream destinations</p>
            <Link href="/destinations">
              <Button>Explore Destinations</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites?.map((fav: any, i: number) => (
              <DestinationCard
                key={fav?.id ?? i}
                destination={fav?.destination ?? {}}
                isFavorited={true}
                onFavoriteToggle={fetchFavorites}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
