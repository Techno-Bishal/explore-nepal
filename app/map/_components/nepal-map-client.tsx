"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mountain, TrendingUp, Star, X, ExternalLink, Loader2, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MapDestination {
  id: string;
  name: string;
  slug: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  imageUrl: string;
  shortDescription: string;
  difficultyLevel: string;
  budgetLevel: string;
  isTrending: boolean;
  isFeatured: boolean;
  region: string;
  categories: { name: string; slug: string }[];
  _count: { favorites: number; visitedBy: number; reviews: number };
}

const REGIONS: Record<string, { name: string; color: string; labelPos: [number, number] }> = {
  province1: { name: "Koshi", color: "hsl(200, 70%, 50%)", labelPos: [82, 35] },
  madhesh: { name: "Madhesh", color: "hsl(35, 80%, 55%)", labelPos: [78, 55] },
  bagmati: { name: "Bagmati", color: "hsl(150, 60%, 45%)", labelPos: [72, 40] },
  gandaki: { name: "Gandaki", color: "hsl(280, 60%, 55%)", labelPos: [60, 32] },
  lumbini: { name: "Lumbini", color: "hsl(340, 70%, 55%)", labelPos: [58, 55] },
  karnali: { name: "Karnali", color: "hsl(25, 75%, 50%)", labelPos: [42, 30] },
  sudurpashchim: { name: "Sudurpashchim", color: "hsl(170, 60%, 45%)", labelPos: [25, 35] },
};

// Simplified Nepal boundary - approximate SVG coordinates mapped from lat/lng
function latLngToSvg(lat: number, lng: number): [number, number] {
  // Nepal bounding box approx: lat 26.3-30.5, lng 80-88.2
  const x = ((lng - 80) / (88.2 - 80)) * 100;
  const y = ((30.5 - lat) / (30.5 - 26.3)) * 65 + 5;
  return [Math.max(2, Math.min(98, x)), Math.max(5, Math.min(68, y))];
}

export default function NepalMapClient() {
  const [destinations, setDestinations] = useState<MapDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState<MapDestination | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/destinations/map-data")
      .then(r => r.json())
      .then(data => {
        setDestinations(data.destinations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    destinations.forEach(d => d.categories?.forEach(c => cats.add(c.name)));
    return Array.from(cats).sort();
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;
    if (activeRegion) filtered = filtered.filter(d => d.region === activeRegion);
    if (filterCategory) filtered = filtered.filter(d => d.categories?.some(c => c.name === filterCategory));
    return filtered;
  }, [destinations, activeRegion, filterCategory]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    destinations.forEach(d => {
      counts[d.region] = (counts[d.region] || 0) + 1;
    });
    return counts;
  }, [destinations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Interactive Nepal Map
            </span>
          </h1>
          <p className="text-muted-foreground">Explore {destinations.length} destinations across 7 provinces</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => { setActiveRegion(null); setFilterCategory(null); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeRegion && !filterCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
            }`}
          >
            All Regions
          </button>
          {Object.entries(REGIONS).map(([key, region]) => (
            <button
              key={key}
              onClick={() => setActiveRegion(activeRegion === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeRegion === key ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
              }`}
            >
              {region.name} ({regionCounts[key] || 0})
            </button>
          ))}
        </div>

        {filterCategory && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setFilterCategory(null)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm"
            >
              <Filter className="w-3 h-3" /> {filterCategory}
              <X className="w-3 h-3 ml-1" />
            </button>
          </div>
        )}

        {/* Map + List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SVG Map */}
          <div className="lg:col-span-2">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-6 relative">
              <svg
                viewBox="0 0 100 72"
                className="w-full h-auto"
                style={{ maxHeight: "500px" }}
              >
                {/* Nepal outline (simplified) */}
                <path
                  d="M5,45 L8,42 L12,44 L15,40 L18,38 L22,35 L28,32 L32,28 L38,25 L42,22 L48,20 L52,18 L58,17 L62,16 L68,18 L72,20 L76,22 L80,25 L84,28 L88,32 L92,36 L95,40 L93,44 L90,48 L85,52 L80,55 L75,57 L70,56 L65,54 L60,55 L55,56 L50,55 L45,53 L40,52 L35,53 L30,54 L25,52 L20,50 L15,48 L10,47 L5,45 Z"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.3"
                  opacity={0.3}
                />

                {/* Destination dots */}
                {filteredDestinations.map(dest => {
                  const [x, y] = latLngToSvg(dest.latitude, dest.longitude);
                  const isSelected = selectedDest?.id === dest.id;
                  const size = dest.isTrending ? 1.2 : dest.isFeatured ? 1 : 0.7;

                  return (
                    <g key={dest.id} onClick={() => setSelectedDest(dest)} style={{ cursor: "pointer" }}>
                      {/* Pulse effect for trending */}
                      {dest.isTrending && (
                        <circle cx={x} cy={y} r={2.5} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.2" opacity={0.4}>
                          <animate attributeName="r" from="1.5" to="3.5" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        cx={x} cy={y} r={size}
                        fill={isSelected ? "hsl(var(--secondary))" : dest.isTrending ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)"}
                        stroke={isSelected ? "hsl(var(--secondary))" : "white"}
                        strokeWidth={isSelected ? 0.4 : 0.2}
                        className="transition-all duration-200 hover:r-2"
                      />
                      {isSelected && (
                        <text x={x} y={y - 2} textAnchor="middle" fontSize="2" fill="hsl(var(--foreground))" fontWeight="bold">
                          {dest.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Trending
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary/70" /> Featured
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50" /> Destination
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar: Selected or List */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedDest ? (
                <motion.div
                  key={selectedDest.id}
                  initial={{ opacity: 1, x: 20 }}
                  animate={{ x: 0 }}
                  exit={{ opacity: 1, x: 20 }}
                  className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden"
                >
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={selectedDest.imageUrl}
                      alt={selectedDest.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <button
                      onClick={() => setSelectedDest(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {selectedDest.isTrending && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-1">{selectedDest.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedDest.location}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{selectedDest.shortDescription}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <Mountain className="w-3 h-3 text-primary mb-1" />
                        <span className="font-medium">{selectedDest.altitude.toLocaleString()}m</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <Star className="w-3 h-3 text-secondary mb-1" />
                        <span className="font-medium capitalize">{selectedDest.difficultyLevel}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedDest.categories?.map(c => (
                        <button
                          key={c.slug}
                          onClick={() => { setFilterCategory(c.name); setSelectedDest(null); }}
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>

                    <Link
                      href={`/destinations/${selectedDest.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                    >
                      Explore <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 max-h-[500px] overflow-y-auto"
                >
                  <h3 className="text-lg font-semibold mb-3">
                    {activeRegion ? REGIONS[activeRegion]?.name : "All"} Destinations ({filteredDestinations.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredDestinations.map(dest => (
                      <button
                        key={dest.id}
                        onClick={() => setSelectedDest(dest)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{dest.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{dest.location}</p>
                        </div>
                        {dest.isTrending && (
                          <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" /> Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
