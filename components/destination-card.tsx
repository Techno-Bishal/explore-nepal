"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Mountain, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DestinationCardProps {
  destination: {
    id: string;
    name: string;
    slug: string;
    location: string;
    shortDescription: string;
    imageUrl: string;
    difficultyLevel: string;
    budgetLevel: string;
    altitude: number;
    travelDuration: string;
    categories?: Array<{ category: { name: string; slug: string } }>;
  };
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  index?: number;
}

export function DestinationCard({ destination, isFavorited = false, onFavoriteToggle, index = 0 }: DestinationCardProps) {
  const { data: session } = useSession() || {};
  const [favorited, setFavorited] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);

  const d = destination ?? {};

  const handleFavorite = async (e: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!session?.user) {
      toast.error("Please sign in to save favorites");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: favorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: d?.id }),
      });
      if (res?.ok) {
        setFavorited(!favorited);
        toast.success(favorited ? "Removed from favorites" : "Added to favorites!");
        onFavoriteToggle?.();
      }
    } catch (err: any) {
      console.error("Favorite error:", err);
      toast.error("Something went wrong");
    }
  };

  const difficultyColor = {
    easy: "bg-green-500/10 text-green-600 dark:text-green-400",
    moderate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    hard: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    extreme: "bg-red-500/10 text-red-600 dark:text-red-400",
  }[d?.difficultyLevel ?? "easy"] ?? "bg-green-500/10 text-green-600";

  return (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index ?? 0) * 0.05 }}
    >
      <Link href={`/destinations/${d?.slug ?? ""}`}>
        <div className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/50 hover:border-primary/20">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {!imgError ? (
              <Image
                src={d?.imageUrl ?? "/placeholder.jpg"}
                alt={d?.name ?? "Destination"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Mountain className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white"
            >
              <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor}`}>
                {(d?.difficultyLevel ?? "easy")?.charAt?.(0)?.toUpperCase?.() ?? ""}{(d?.difficultyLevel ?? "easy")?.slice?.(1) ?? ""}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-display font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
              {d?.name ?? ""}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {d?.location ?? ""}
            </p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {d?.shortDescription ?? ""}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                {(d?.altitude ?? 0)?.toLocaleString?.() ?? "0"}m
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {d?.travelDuration ?? ""}
              </span>
              <span className="capitalize">{d?.budgetLevel ?? ""}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
