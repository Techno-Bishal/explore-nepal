"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, GitCompare, Sparkles, Route, Award, BookmarkPlus } from "lucide-react";

const tools = [
  {
    href: "/quiz",
    icon: Sparkles,
    title: "Travel Personality Quiz",
    description: "Discover your unique Nepal travel style",
    color: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    href: "/trip-planner",
    icon: Route,
    title: "AI Trip Planner",
    description: "Generate personalized itineraries with AI",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    href: "/map",
    icon: Map,
    title: "Interactive Map",
    description: "Explore destinations across all 7 provinces",
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    href: "/compare",
    icon: GitCompare,
    title: "Compare Destinations",
    description: "Side-by-side on budget, difficulty & more",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
];

export function QuickToolsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Smart Travel <span className="text-primary">Tools</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to plan the perfect Nepal adventure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={tool.href}
                className="block p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group h-full"
              >
                <div className={`h-12 w-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                </div>
                <h3 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
