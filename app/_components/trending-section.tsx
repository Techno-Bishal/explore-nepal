"use client";

import { useEffect, useState } from "react";
import { DestinationCard } from "@/components/destination-card";
import { TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TrendingSection() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations?trending=true&limit=4")
      .then((r: any) => r?.json?.())
      .then((d: any) => setDestinations(d?.destinations ?? []))
      .catch((e: any) => console.error("Trending fetch error:", e))
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
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-widest uppercase">Popular</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Trending Now</h2>
          </div>
          <Link href="/destinations?trending=true">
            <Button variant="outline">View All</Button>
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations?.map((d: any, i: number) => (
            <DestinationCard key={d?.id ?? i} destination={d} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
