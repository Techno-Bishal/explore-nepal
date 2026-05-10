"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, MapPin, Clock, DollarSign,
  AlertTriangle, Shirt, Calendar, Users, ArrowRight,
  Mountain, Utensils, Hotel, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";

const INTERESTS = [
  "Trekking", "Culture & Heritage", "Wildlife Safari", "Temples & Spirituality",
  "Photography", "Adventure Sports", "Food & Cuisine", "Meditation & Yoga",
  "Mountain Views", "Lake & Waterfalls", "Local Villages", "Festivals",
];

interface TripDay {
  day: number;
  location: string;
  slug?: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  travelTip: string;
  estimatedCost: number;
}

interface TripPlan {
  tripName: string;
  totalDays: number;
  estimatedBudget: { low: number; mid: number; high: number };
  days: TripDay[];
  packingList: string[];
  safetyTips: string[];
  bestTimeToGo: string;
}

export default function TripPlannerClient() {
  const { data: session } = useSession() || {};
  const [duration, setDuration] = useState("7");
  const [budget, setBudget] = useState("moderate");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [groupSize, setGroupSize] = useState("2");
  const [startCity, setStartCity] = useState("Kathmandu");
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const generateTrip = async () => {
    setLoading(true);
    setTripPlan(null);
    setRawContent(null);
    try {
      const res = await fetch("/api/ai/trip-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: parseInt(duration),
          budget,
          interests: selectedInterests,
          travelStyle,
          startCity,
          groupSize: parseInt(groupSize),
        }),
      });
      const data = await res.json();
      if (data.tripPlan) setTripPlan(data.tripPlan);
      else if (data.rawContent) setRawContent(data.rawContent);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Dream Trip Generator
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tell us your preferences and our AI will craft the perfect personalized Nepal itinerary for you.
          </p>
        </div>

        {!tripPlan && !rawContent && (
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 md:p-8 space-y-6">
              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-2 block">Trip Duration</label>
                <div className="flex flex-wrap gap-2">
                  {["3", "5", "7", "10", "14", "21"].map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        duration === d ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Level</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "budget", label: "💰 Budget", desc: "NPR 1,500-3,000/day" },
                    { value: "moderate", label: "💎 Mid-Range", desc: "NPR 5,000-8,000/day" },
                    { value: "luxury", label: "👑 Luxury", desc: "NPR 15,000+/day" },
                  ].map(b => (
                    <button
                      key={b.value}
                      onClick={() => setBudget(b.value)}
                      className={`flex-1 min-w-[120px] p-3 rounded-lg text-sm font-medium transition-colors text-center ${
                        budget === b.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                      }`}
                    >
                      <span className="block">{b.label}</span>
                      <span className={`text-xs block mt-0.5 ${budget === b.value ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-medium mb-2 block">Interests (select up to 5)</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent disabled:opacity-40"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style & Group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Travel Style</label>
                  <select
                    value={travelStyle}
                    onChange={e => setTravelStyle(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="adventurous">Adventurous</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="cultural">Cultural Deep-dive</option>
                    <option value="fast-paced">Fast-paced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Group Size</label>
                  <select
                    value={groupSize}
                    onChange={e => setGroupSize(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="1">Solo</option>
                    <option value="2">Couple</option>
                    <option value="4">Small Group (3-4)</option>
                    <option value="6">Group (5-6)</option>
                    <option value="10">Large Group (7+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Starting City</label>
                  <select
                    value={startCity}
                    onChange={e => setStartCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateTrip}
                disabled={loading || selectedInterests.length === 0}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating your dream trip...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate My Dream Trip</>                )}
              </button>

              {!session?.user && (
                <p className="text-xs text-center text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link> to save your trip plan and earn badges!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-card/80 px-6 py-4 rounded-xl border border-border/50">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div className="text-left">
                <p className="font-medium">AI is crafting your perfect trip...</p>
                <p className="text-sm text-muted-foreground">This usually takes 10-15 seconds</p>
              </div>
            </div>
          </div>
        )}

        {/* Trip Plan Result */}
        {tripPlan && (
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ y: 0 }}
            className="max-w-4xl mx-auto mt-8"
          >
            {/* Trip Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{tripPlan.tripName}</h2>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{tripPlan.totalDays} days</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />NPR {tripPlan.estimatedBudget?.mid?.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tripPlan.bestTimeToGo}</span>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="text-lg font-bold text-green-600">NPR {tripPlan.estimatedBudget?.low?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Mid-Range</p>
                <p className="text-lg font-bold text-amber-600">NPR {tripPlan.estimatedBudget?.mid?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Luxury</p>
                <p className="text-lg font-bold text-purple-600">NPR {tripPlan.estimatedBudget?.high?.toLocaleString()}</p>
              </div>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Day-by-Day Itinerary</h3>
              {tripPlan.days?.map((day) => (
                <div key={day.day} className="bg-card/80 rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {day.day}
                      </div>
                      <div>
                        <p className="font-medium">{day.location}</p>
                        <p className="text-xs text-muted-foreground">{day.activities?.[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">NPR {day.estimatedCost?.toLocaleString()}</span>
                      {expandedDay === day.day ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedDay === day.day && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Activities</p>
                            <ul className="space-y-1">
                              {day.activities?.map((a, i) => (
                                <li key={i} className="text-sm flex items-start gap-2"><ArrowRight className="w-3 h-3 text-primary shrink-0 mt-1" />{a}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Hotel className="w-3 h-3" />Accommodation</p>
                              <p className="text-sm">{day.accommodation}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Utensils className="w-3 h-3" />Meals</p>
                              <p className="text-sm">{day.meals?.join(", ")}</p>
                            </div>
                          </div>
                          {day.travelTip && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                              💡 {day.travelTip}
                            </p>
                          )}
                          {day.slug && (
                            <Link href={`/destinations/${day.slug}`} className="text-xs text-primary hover:underline inline-block">View destination details →</Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Packing & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {tripPlan.packingList?.length > 0 && (
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 mb-3"><Shirt className="w-4 h-4 text-primary" />Packing List</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tripPlan.packingList.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded-full text-xs">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {tripPlan.safetyTips?.length > 0 && (
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <h4 className="font-semibold flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-500" />Safety Tips</h4>
                  <ul className="space-y-1">
                    {tripPlan.safetyTips.map((tip, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { setTripPlan(null); setRawContent(null); }}
                className="px-6 py-3 bg-card border border-border rounded-xl font-medium hover:bg-accent transition-colors"
              >
                Plan Another Trip
              </button>
              <Link
                href="/destinations"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Explore Destinations
              </Link>
            </div>
          </motion.div>
        )}

        {/* Raw content fallback */}
        {rawContent && !tripPlan && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Your Trip Plan</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{rawContent}</div>
              <button
                onClick={() => { setTripPlan(null); setRawContent(null); }}
                className="mt-6 px-6 py-3 bg-card border border-border rounded-xl font-medium hover:bg-accent transition-colors"
              >
                Plan Another Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
