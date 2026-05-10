"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mountain, Footprints, TreePine, Building2, Compass, Landmark,
  Waves, Bird, Palette, Gem, CableCar, Layers, Church,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Mountain, Footprints, TreePine, Building2, Compass, Landmark,
  Waves, Bird, Palette, Gem, CableCar, Church,
};

const categories = [
  { name: "Mountains", slug: "mountain", icon: "Mountain", color: "from-blue-500 to-blue-600" },
  { name: "Trekking", slug: "trekking", icon: "Footprints", color: "from-green-500 to-green-600" },
  { name: "Nature", slug: "nature", icon: "TreePine", color: "from-emerald-500 to-emerald-600" },
  { name: "Cities", slug: "city", icon: "Building2", color: "from-purple-500 to-purple-600" },
  { name: "Adventure", slug: "adventure", icon: "Compass", color: "from-orange-500 to-orange-600" },
  { name: "Temples", slug: "temple", icon: "Landmark", color: "from-amber-500 to-amber-600" },
  { name: "Lakes", slug: "lake", icon: "Waves", color: "from-cyan-500 to-cyan-600" },
  { name: "Wildlife", slug: "wildlife", icon: "Bird", color: "from-lime-500 to-lime-600" },
  { name: "Cultural", slug: "cultural", icon: "Palette", color: "from-rose-500 to-rose-600" },
  { name: "Hidden Gems", slug: "hidden-gem", icon: "Gem", color: "from-violet-500 to-violet-600" },
  { name: "Cable Car", slug: "cable-car", icon: "CableCar", color: "from-teal-500 to-teal-600" },
  { name: "Pilgrimage", slug: "pilgrimage", icon: "Church", color: "from-indigo-500 to-indigo-600" },
];

export function CategoriesSection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Layers className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-widest uppercase">Browse by</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Explore Categories</h2>
          <p className="text-muted-foreground mt-2">Find your perfect Nepal experience</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories?.map((cat: any, i: number) => {
            const IconComp = iconMap[cat?.icon ?? ""] ?? Mountain;
            return (
              <motion.div
                key={cat?.slug ?? i}
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/destinations?category=${cat?.slug ?? ""}`}>
                  <div className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all hover:shadow-md cursor-pointer">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${cat?.color ?? "from-gray-500 to-gray-600"} text-white transition-transform group-hover:scale-110`}>
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">{cat?.name ?? ""}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
