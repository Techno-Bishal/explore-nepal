"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mountain, DollarSign, Clock, Star, Shield, Wifi, Users,
  Search, X, Plus, ArrowRight, Loader2, ThumbsUp, AlertTriangle,
  Sun, Check
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CompareDestination {
  id: string;
  name: string;
  slug: string;
  location: string;
  imageUrl: string;
  altitude: number;
  difficultyLevel: string;
  budgetLevel: string;
  budgetEstimateLow: number | null;
  budgetEstimateMid: number | null;
  budgetEstimateHigh: number | null;
  bestSeason: string;
  travelDuration: string;
  adventureLevel: number;
  familyFriendly: boolean;
  networkAvailability: string | null;
  crowdLevel: string | null;
  categories: string[];
  avgRating: string;
  reviewCount: number;
  favoriteCount: number;
  visitedCount: number;
  highlights: string[];
  weatherInfo: string | null;
  altitudeWarning: string | null;
}

interface SearchDest {
  name: string;
  slug: string;
  imageUrl: string;
  location: string;
}

export default function CompareClient() {
  const [selected, setSelected] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<CompareDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchDest[]>([]);
  const [allDestinations, setAllDestinations] = useState<SearchDest[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  useEffect(() => {
    fetch("/api/destinations?limit=100")
      .then(r => r.json())
      .then(data => {
        const dests = (data.destinations || []).map((d: any) => ({
          name: d.name, slug: d.slug, imageUrl: d.imageUrl, location: d.location,
        }));
        setAllDestinations(dests);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const q = searchQuery.toLowerCase();
      setSearchResults(
        allDestinations.filter(d =>
          d.name.toLowerCase().includes(q) && !selected.includes(d.slug)
        ).slice(0, 8)
      );
    } else {
      setSearchResults(
        allDestinations.filter(d => !selected.includes(d.slug)).slice(0, 8)
      );
    }
  }, [searchQuery, allDestinations, selected]);

  const addDestination = (slug: string) => {
    if (selected.length >= 3 || selected.includes(slug)) return;
    setSelected(prev => [...prev, slug]);
    setSearchQuery("");
    setActiveSlot(-1);
  };

  const removeDestination = (slug: string) => {
    setSelected(prev => prev.filter(s => s !== slug));
    setCompareData(prev => prev.filter(d => d.slug !== slug));
  };

  const doCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/destinations/compare?slugs=${selected.join(",")}`);
      const data = await res.json();
      setCompareData(data.destinations || []);
    } catch (e) {
      console.error("Compare error:", e);
    }
    setLoading(false);
  };

  const difficultyColor = (level: string) => {
    switch (level) {
      case "easy": return "text-green-500";
      case "moderate": return "text-yellow-500";
      case "hard": return "text-orange-500";
      case "extreme": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const budgetColor = (level: string) => {
    switch (level) {
      case "budget": return "text-green-500";
      case "moderate": return "text-yellow-500";
      case "expensive": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Compare Destinations
            </span>
          </h1>
          <p className="text-muted-foreground">Select 2-3 destinations to compare side by side</p>
        </div>

        {/* Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(idx => {
              const slug = selected[idx];
              const dest = allDestinations.find(d => d.slug === slug);

              if (slug && dest) {
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 1, scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-card rounded-xl border border-border overflow-hidden relative"
                  >
                    <div className="relative aspect-[3/2] bg-muted">
                      <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover" sizes="300px" />
                      <button
                        onClick={() => removeDestination(slug)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold">{dest.name}</h3>
                      <p className="text-xs text-muted-foreground">{dest.location}</p>
                    </div>
                  </motion.div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[180px] ${
                    activeSlot === idx ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  } ${idx === 2 ? "hidden md:flex" : ""}`}
                  onClick={() => setActiveSlot(idx)}
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add Destination</span>
                </div>
              );
            })}
          </div>

          {/* Search when adding */}
          {activeSlot >= 0 && selected.length < 3 && (
            <motion.div
              initial={{ opacity: 1, y: 10 }}
              animate={{ y: 0 }}
              className="mt-4 bg-card rounded-xl border border-border p-4"
            >
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                {searchResults.map(d => (
                  <button
                    key={d.slug}
                    onClick={() => addDestination(d.slug)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      <Image src={d.imageUrl} alt={d.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Compare Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={doCompare}
              disabled={selected.length < 2 || loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Comparing...</>
              ) : (
                <>Compare {selected.length} Destinations <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {compareData.length >= 2 && (
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground w-36">Feature</th>
                    {compareData.map(d => (
                      <th key={d.id} className="p-3 text-center min-w-[200px]">
                        <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-2 bg-muted">
                          <Image src={d.imageUrl} alt={d.name} fill className="object-cover" sizes="250px" />
                        </div>
                        <Link href={`/destinations/${d.slug}`} className="text-lg font-bold hover:text-primary transition-colors">
                          {d.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{d.location}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <CompareRow label="Rating" icon={Star}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        <span className="text-lg font-bold text-secondary">{d.avgRating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({d.reviewCount} reviews)</span>
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Altitude" icon={Mountain}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center font-medium">
                        {d.altitude.toLocaleString()}m
                        {d.altitudeWarning && (
                          <span className="block text-xs text-orange-500 mt-1">
                            <AlertTriangle className="w-3 h-3 inline" /> Warning
                          </span>
                        )}
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Difficulty" icon={Shield}>
                    {compareData.map(d => (
                      <td key={d.id} className={`p-3 text-center font-medium capitalize ${difficultyColor(d.difficultyLevel)}`}>
                        {d.difficultyLevel}
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Budget/Day" icon={DollarSign}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        <span className={`font-medium capitalize ${budgetColor(d.budgetLevel)}`}>{d.budgetLevel}</span>
                        {d.budgetEstimateLow && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            NPR {d.budgetEstimateLow?.toLocaleString()} - {d.budgetEstimateHigh?.toLocaleString()}
                          </span>
                        )}
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Best Season" icon={Sun}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-sm">{d.bestSeason}</td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Duration" icon={Clock}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-sm font-medium">{d.travelDuration}</td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Family Friendly" icon={Users}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        {d.familyFriendly ? (
                          <span className="inline-flex items-center gap-1 text-green-500 text-sm"><Check className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not ideal</span>
                        )}
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Crowd Level" icon={Users}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-sm">{d.crowdLevel || "—"}</td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Network" icon={Wifi}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-sm">{d.networkAvailability || "—"}</td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Adventure" icon={Mountain}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < d.adventureLevel ? "bg-primary" : "bg-muted"}`} />
                          ))}
                        </div>
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Popularity" icon={ThumbsUp}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-sm">
                        <span className="text-primary font-medium">{d.favoriteCount}</span> favorites · <span className="text-secondary font-medium">{d.visitedCount}</span> visited
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Categories" icon={Star}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {d.categories.map(c => (
                            <span key={c} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{c}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </CompareRow>
                  <CompareRow label="Highlights" icon={Star}>
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center text-xs">
                        {d.highlights.slice(0, 3).join(", ")}
                      </td>
                    ))}
                  </CompareRow>
                  <tr>
                    <td className="p-3" />
                    {compareData.map(d => (
                      <td key={d.id} className="p-3 text-center">
                        <Link
                          href={`/destinations/${d.slug}`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CompareRow({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <tr className="hover:bg-accent/30 transition-colors">
      <td className="p-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="w-4 h-4 text-primary" /> {label}
        </span>
      </td>
      {children}
    </tr>
  );
}
