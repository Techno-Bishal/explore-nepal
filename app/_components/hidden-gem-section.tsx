"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gem, MapPin, Mountain, ArrowRight, Star } from "lucide-react";

interface HiddenGem {
  name: string;
  slug: string;
  imageUrl: string;
  location: string;
  altitude: number;
  shortDescription: string;
  budgetEstimateLow: number | null;
}

export function HiddenGemSection() {
  const [gem, setGem] = useState<HiddenGem | null>(null);

  useEffect(() => {
    // Fetch a random hidden gem destination
    fetch("/api/destinations?category=hidden-gem&limit=5")
      .then(r => r.json())
      .then(data => {
        const dests = data?.destinations ?? [];
        if (dests.length > 0) {
          // Pick one deterministically based on day of week to avoid hydration mismatch
          const dayOfWeek = new Date().getDay();
          setGem(dests[dayOfWeek % dests.length]);
        }
      })
      .catch(console.error);
  }, []);

  if (!gem) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-muted">
              <Image
                src={gem.imageUrl}
                alt={gem.name}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="relative z-10 p-8 md:p-12 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary text-sm font-medium mb-4">
                <Gem className="h-4 w-4" />
                Hidden Gem of the Week
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                {gem.name}
              </h2>
              <div className="flex items-center gap-3 text-white/70 text-sm mb-4">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{gem.location}</span>
                <span className="flex items-center gap-1"><Mountain className="h-3.5 w-3.5" />{gem.altitude.toLocaleString()}m</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-3">
                {gem.shortDescription}
              </p>
              {gem.budgetEstimateLow && (
                <p className="text-sm text-green-400 mb-4">
                  Starting from NPR {gem.budgetEstimateLow.toLocaleString()}/day
                </p>
              )}
              <Link
                href={`/destinations/${gem.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors text-sm"
              >
                Discover <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
