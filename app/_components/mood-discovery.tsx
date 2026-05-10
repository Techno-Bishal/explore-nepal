"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Mountain, Compass, Sunrise, Sparkles, Loader2,
  TreePine, Snowflake, DollarSign, Users, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { id: "peaceful", label: "Peaceful", icon: Sunrise, color: "from-blue-500 to-cyan-500", description: "Serene and tranquil escapes" },
  { id: "adventure", label: "Adventure", icon: Compass, color: "from-orange-500 to-red-500", description: "Thrilling and exciting" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "from-pink-500 to-rose-500", description: "Perfect for couples" },
  { id: "budget", label: "Budget", icon: DollarSign, color: "from-green-500 to-emerald-500", description: "Affordable getaways" },
  { id: "hidden", label: "Hidden Gems", icon: Sparkles, color: "from-purple-500 to-violet-500", description: "Off the beaten path" },
  { id: "family", label: "Family", icon: Users, color: "from-amber-500 to-yellow-500", description: "Fun for all ages" },
];

export function MoodDiscovery() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMood = async (mood: string) => {
    setSelectedMood(mood);
    setLoading(true);
    setResults([]);
    try {
      const params: any = { mood };
      if (mood === "budget") params.budget = "budget";
      if (mood === "adventure") params.difficulty = "hard";
      if (mood === "family") params.difficulty = "easy";

      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setResults(data?.destinations ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-widest uppercase">AI-Powered</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">What's Your Travel Mood?</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Let our AI recommend the perfect Nepal destinations based on how you want to feel</p>
        </motion.div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMood(mood.id)}
              className={`group relative p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                selectedMood === mood.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <div className={`h-10 w-10 mx-auto rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center mb-2`}>
                <mood.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium">{mood.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{mood.description}</p>
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">AI is finding perfect destinations...</span>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div key="results" initial={{ opacity: 1, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.slice(0, 6).map((dest: any, i: number) => (
                  <Link key={dest.id ?? i} href={`/destinations/${dest.slug ?? ""}`}>
                    <div className="group rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all">
                      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                        <Image src={dest.imageUrl ?? ""} alt={dest.name ?? "Destination"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-black/50 text-white border-0 text-xs">
                            <MapPin className="h-3 w-3 mr-1" />{dest.location ?? ""}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors">{dest.name ?? ""}</h3>
                        {dest.aiReason ? (
                          <p className="text-sm text-primary/80 mt-1 line-clamp-2 italic">
                            <Sparkles className="h-3 w-3 inline mr-1" />{dest.aiReason}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dest.shortDescription ?? ""}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
