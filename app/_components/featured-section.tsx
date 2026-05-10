"use client";

import { useEffect, useState } from "react";
import { DestinationCard } from "@/components/destination-card";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturedSection() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations?featured=true&limit=6")
      .then((r: any) => r?.json?.())
      .then((d: any) => setDestinations(d?.destinations ?? []))
      .catch((e: any) => console.error("Featured fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="mx-auto max-w-[1200px] flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if ((destinations?.length ?? 0) === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-widest uppercase">Handpicked</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Featured Destinations</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Curated collection of Nepal&apos;s most spectacular places</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations?.map((d: any, i: number) => (
            <DestinationCard key={d?.id ?? i} destination={d} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
