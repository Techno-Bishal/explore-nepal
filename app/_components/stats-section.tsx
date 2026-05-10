"use client";

import { Mountain, MapPin, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: MapPin, value: "40+", label: "Destinations", color: "text-primary" },
  { icon: Mountain, value: "12", label: "Categories", color: "text-amber-500" },
  { icon: Users, value: "1000+", label: "Happy Travelers", color: "text-green-500" },
  { icon: Star, value: "4.8", label: "Average Rating", color: "text-amber-400" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <p className="font-display text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
