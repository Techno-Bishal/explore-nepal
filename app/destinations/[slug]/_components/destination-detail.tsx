"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MapPin, Mountain, Clock, Heart, Share2, ArrowLeft, Loader2,
  Thermometer, Compass, Shield, Shirt, Bus, Landmark, Users,
  Star, AlertTriangle, Lightbulb, ChevronRight, Hotel, Utensils,
  Sparkles, CloudSun, Send, ChevronDown, ChevronUp, DollarSign,
  Calendar, TreePine, MessageCircle, Camera, Palette, Navigation, Trash2,
  CheckCircle, BookmarkPlus, Phone, Wifi, Activity, Flag,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageGallery } from "@/components/image-gallery";
import { ReviewCard } from "@/components/review-card";
import { DestinationCard } from "@/components/destination-card";
import { DetailPageSkeleton } from "@/components/loading-skeleton";
import { AuthGuardProvider, useAuthGuard } from "@/components/auth-guard-modal";
import { ReportContentModal } from "@/components/report-content-modal";

interface Props { slug: string; }

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => interactive && onRate?.(s)} className={interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}>
          <Star className={`h-5 w-5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 rounded-xl bg-card border border-border/50 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
        <h3 className="font-display font-semibold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DestinationDetailInner({ slug }: Props) {
  const { data: session } = useSession() || {};
  const { requireAuth } = useAuthGuard();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string } | null>(null);
  const [imgError, setImgError] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [subDests, setSubDests] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [visited, setVisited] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/destinations/${slug}`);
        const data = await res.json();
        setD(data?.destination ?? null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const fetchReviews = useCallback(async () => {
    if (!d?.id) return;
    try {
      const res = await fetch(`/api/reviews?destinationId=${d.id}`);
      const data = await res.json();
      setReviews(data?.reviews ?? []); setAvgRating(data?.avgRating ?? 0); setReviewCount(data?.reviewCount ?? 0);
    } catch (e) { console.error(e); }
  }, [d?.id]);

  const fetchComments = useCallback(async () => {
    if (!d?.id) return;
    try {
      const res = await fetch(`/api/comments?destinationId=${d.id}`);
      const data = await res.json();
      setComments(data?.comments ?? []);
    } catch (e) { console.error(e); }
  }, [d?.id]);

  useEffect(() => {
    if (!d?.id) return;
    fetchReviews();
    fetchComments();
    fetch(`/api/destinations/${slug}/related`).then(r => r.json()).then(data => setRelated(data?.destinations ?? [])).catch(console.error);
    fetch(`/api/destinations/${slug}/sub-destinations`).then(r => r.json()).then(data => setSubDests(data?.subDestinations ?? [])).catch(console.error);
  }, [d?.id, slug, fetchReviews, fetchComments]);

  useEffect(() => {
    if (!session?.user || !d?.id) return;
    fetch("/api/favorites").then(r => r.json()).then(data => {
      setFavorited(data?.favorites?.some?.((f: any) => f?.destinationId === d?.id) ?? false);
    }).catch(console.error);
    fetch("/api/user/visited").then(r => r.json()).then(data => {
      setVisited(data?.visited?.some?.((v: any) => v?.destinationId === d?.id) ?? false);
    }).catch(console.error);
    fetch("/api/user/wishlist").then(r => r.json()).then(data => {
      setWishlisted(data?.wishlist?.some?.((w: any) => w?.destinationId === d?.id) ?? false);
    }).catch(console.error);
  }, [session, d?.id]);

  const handleVisited = async () => {
    if (!requireAuth("mark destinations as visited")) return;
    try {
      if (visited) {
        await fetch(`/api/user/visited?destinationId=${d?.id}`, { method: "DELETE" });
        setVisited(false);
        toast.success("Removed from visited");
      } else {
        await fetch("/api/user/visited", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinationId: d?.id }) });
        setVisited(true);
        toast.success("Marked as visited! 🎉");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const handleWishlist = async () => {
    if (!requireAuth("save destinations to your wishlist")) return;
    try {
      if (wishlisted) {
        await fetch(`/api/user/wishlist?destinationId=${d?.id}`, { method: "DELETE" });
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await fetch("/api/user/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinationId: d?.id }) });
        setWishlisted(true);
        toast.success("Added to wishlist! ✨");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const handleFavorite = async () => {
    if (!requireAuth("save favorites")) return;
    try {
      const res = await fetch("/api/favorites", { method: favorited ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinationId: d?.id }) });
      if (res?.ok) { setFavorited(!favorited); toast.success(favorited ? "Removed" : "Added to favorites!"); }
    } catch { toast.error("Something went wrong"); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth("write reviews")) return;
    if (!reviewTitle.trim() || !reviewContent.trim()) { toast.error("Fill all fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: reviewTitle.trim(), content: reviewContent.trim(), rating: reviewRating, destinationId: d?.id }) });
      const data = await res.json();
      if (res?.ok) { toast.success("Review posted!"); setReviewTitle(""); setReviewContent(""); setReviewRating(5); setShowReviewForm(false); fetchReviews(); }
      else { toast.error(data?.error || "Failed to post review"); }
    } catch { toast.error("Failed to post review"); }
    finally { setSubmitting(false); }
  };

  const handleComment = async () => {
    if (!requireAuth("post comments")) return;
    if (!commentText.trim()) return;
    try {
      const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: commentText.trim(), destinationId: d?.id }) });
      const data = await res.json();
      if (res?.ok) { setCommentText(""); fetchComments(); toast.success("Comment posted!"); }
      else { toast.error(data?.error || "Failed to post"); }
    } catch { toast.error("Failed to post"); }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res?.ok) { fetchComments(); toast.success("Deleted"); }
    } catch { toast.error("Failed"); }
  };

  if (loading) return <DetailPageSkeleton />;
  if (!d) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Mountain className="h-16 w-16 text-muted-foreground/30 mb-4" /><h2 className="text-xl font-semibold mb-2">Destination not found</h2><Link href="/destinations"><Button>Browse All</Button></Link></div>;

  const diffColor: Record<string, string> = { easy: "bg-green-500/10 text-green-700 dark:text-green-400", moderate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", hard: "bg-orange-500/10 text-orange-700 dark:text-orange-400", extreme: "bg-red-500/10 text-red-700 dark:text-red-400" };
  const allImages = [d.imageUrl, ...(d.galleryImages ?? [])].filter(Boolean);
  const tabs = ["overview", "places", "reviews", "community"];

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative h-[65vh] min-h-[450px]">
        <div className="absolute inset-0 bg-muted">
          {!imgError ? (
            <Image src={d.imageUrl ?? ""} alt={d.name ?? "Destination"} fill className="object-cover" priority sizes="100vw" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Mountain className="h-20 w-20 text-muted-foreground/20" /></div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-[1200px] mx-auto px-4 pb-8">
            <Link href="/destinations">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white mb-4 gap-2 bg-black/20"><ArrowLeft className="h-4 w-4" />All Destinations</Button>
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight mb-3">{d.name ?? ""}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{d.location ?? ""}</span>
              <span className="flex items-center gap-1"><Mountain className="h-4 w-4" />{(d.altitude ?? 0).toLocaleString()}m</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{d.travelDuration ?? ""}</span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-white/60">({reviewCount})</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleFavorite} variant="outline" size="sm" className="gap-2 border-white/30 text-white bg-black/30 hover:bg-white/10">
                <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />{favorited ? "Saved" : "Save"}
              </Button>
              <Button onClick={handleVisited} variant="outline" size="sm" className={`gap-2 border-white/30 text-white hover:bg-white/10 ${visited ? "bg-green-600/50" : "bg-black/30"}`}>
                <CheckCircle className={`h-4 w-4 ${visited ? "fill-green-400 text-green-400" : ""}`} />{visited ? "Visited" : "Mark Visited"}
              </Button>
              <Button onClick={handleWishlist} variant="outline" size="sm" className={`gap-2 border-white/30 text-white hover:bg-white/10 ${wishlisted ? "bg-amber-600/50" : "bg-black/30"}`}>
                <BookmarkPlus className={`h-4 w-4 ${wishlisted ? "fill-amber-400 text-amber-400" : ""}`} />{wishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-white/30 text-white bg-black/30 hover:bg-white/10" onClick={() => { navigator.clipboard?.writeText?.(window.location.href); toast.success("Link copied!"); }}>
                <Share2 className="h-4 w-4" />Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {tab === "places" ? `Famous Places${subDests.length ? ` (${subDests.length})` : ""}` : tab === "reviews" ? `Reviews (${reviewCount})` : tab === "community" ? `Community (${comments.length})` : "Overview"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <SectionCard title="About" icon={Landmark}>
                <p className="text-muted-foreground leading-relaxed">{d.longDescription ?? ""}</p>
                {(d.highlights?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {d.highlights.map((h: string, i: number) => (<Badge key={i} variant="secondary" className="text-xs">{h}</Badge>))}
                  </div>
                )}
              </SectionCard>

              {/* Gallery */}
              {allImages.length > 1 && (
                <SectionCard title="Photo Gallery" icon={Camera}>
                  <ImageGallery images={allImages} alt={d.name ?? ""} />
                </SectionCard>
              )}

              {/* Culture & Traditions */}
              {d.localCultureInfo && (
                <SectionCard title="Culture & Traditions" icon={Palette}>
                  <p className="text-muted-foreground leading-relaxed">{d.localCultureInfo}</p>
                </SectionCard>
              )}

              {/* Local Food */}
              {(d.nearbyRestaurants?.length ?? 0) > 0 && (
                <SectionCard title="Local Food & Restaurants" icon={Utensils}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {d.nearbyRestaurants.map((r: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0"><Utensils className="h-4 w-4 text-orange-600" /></div>
                        <span className="text-sm font-medium">{r}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Travel Tips */}
              {(d.travelTips?.length ?? 0) > 0 && (
                <SectionCard title="Travel Tips" icon={Lightbulb}>
                  <ul className="space-y-2">
                    {d.travelTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />{tip}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* Safety Tips */}
              {(d.safetyTips?.length ?? 0) > 0 && (
                <SectionCard title="Safety Tips" icon={Shield}>
                  <ul className="space-y-2">
                    {d.safetyTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{tip}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Facts */}
              <div className="p-5 rounded-xl bg-card border border-border/50 space-y-4">
                <h3 className="font-display font-semibold text-base">Quick Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Compass className="h-4 w-4" />Difficulty</span><Badge className={diffColor[d.difficultyLevel] ?? "bg-green-500/10 text-green-700"}>{d.difficultyLevel}</Badge></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Budget</span><span className="font-medium capitalize">{d.budgetLevel}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Best Season</span><span className="font-medium text-xs text-right max-w-[150px]">{d.bestSeason}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Mountain className="h-4 w-4" />Altitude</span><span className="font-medium">{(d.altitude ?? 0).toLocaleString()}m</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Duration</span><span className="font-medium">{d.travelDuration}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Family Friendly</span><span className="font-medium">{d.familyFriendly ? "Yes" : "Not recommended"}</span></div>
                  {d.adventureLevel > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Sparkles className="h-4 w-4" />Adventure</span><span className="font-medium">{d.adventureLevel}/10</span></div>}
                </div>
              </div>

              {/* Smart Budget Estimator */}
              {(d.budgetEstimateLow || d.budgetDetails) && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-green-600" /></div>
                    <h3 className="font-display font-semibold text-base">Budget Estimator</h3>
                  </div>
                  {d.budgetEstimateLow && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50">
                        <span className="text-sm text-muted-foreground">💰 Budget</span>
                        <span className="text-sm font-bold text-green-600">NPR {d.budgetEstimateLow?.toLocaleString()}/day</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50">
                        <span className="text-sm text-muted-foreground">💎 Mid-Range</span>
                        <span className="text-sm font-bold text-amber-600">NPR {d.budgetEstimateMid?.toLocaleString()}/day</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50">
                        <span className="text-sm text-muted-foreground">👑 Luxury</span>
                        <span className="text-sm font-bold text-purple-600">NPR {d.budgetEstimateHigh?.toLocaleString()}/day</span>
                      </div>
                    </div>
                  )}
                  {d.budgetDetails && <p className="text-xs text-muted-foreground mt-3">{d.budgetDetails}</p>}
                </div>
              )}

              {/* Emergency & Safety */}
              {(d.emergencyContacts || d.nearestHospital || d.altitudeWarning) && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center"><Phone className="h-4 w-4 text-red-600" /></div>
                    <h3 className="font-display font-semibold text-base">Emergency & Safety</h3>
                  </div>
                  <div className="space-y-3">
                    {d.altitudeWarning && (
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{d.altitudeWarning}
                        </p>
                      </div>
                    )}
                    {d.emergencyContacts && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Emergency Contacts</p>
                        <div className="text-xs text-foreground space-y-0.5">
                          {d.emergencyContacts.split(" | ").map((c: string, i: number) => (
                            <p key={i}>{c}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {d.nearestHospital && (
                      <div className="flex items-start gap-2 text-xs">
                        <Activity className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Hospital:</strong> {d.nearestHospital}</span>
                      </div>
                    )}
                    {d.nearestPolice && (
                      <div className="flex items-start gap-2 text-xs">
                        <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span><strong>Police:</strong> {d.nearestPolice}</span>
                      </div>
                    )}
                    {d.networkAvailability && (
                      <div className="flex items-start gap-2 text-xs">
                        <Wifi className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Network:</strong> {d.networkAvailability}</span>
                      </div>
                    )}
                    {d.crowdLevel && (
                      <div className="flex items-start gap-2 text-xs">
                        <Users className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                        <span><strong>Crowd Level:</strong> {d.crowdLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Weather */}
              {d.weatherInfo && (
                <SectionCard title="Weather" icon={CloudSun}>
                  <p className="text-sm text-muted-foreground">{d.weatherInfo}</p>
                </SectionCard>
              )}

              {/* Transport */}
              {d.transportDetails && (
                <SectionCard title="Getting There" icon={Bus}>
                  <p className="text-sm text-muted-foreground">{d.transportDetails}</p>
                </SectionCard>
              )}

              {/* Nearby Hotels */}
              {(d.nearbyHotels?.length ?? 0) > 0 && (
                <SectionCard title="Where to Stay" icon={Hotel}>
                  <ul className="space-y-2">
                    {d.nearbyHotels.map((h: string, i: number) => (
                      <li key={i} className="text-sm flex items-center gap-2"><Hotel className="h-3.5 w-3.5 text-primary" />{h}</li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* Packing */}
              {(d.packingSuggestions?.length ?? 0) > 0 && (
                <SectionCard title="What to Pack" icon={Shirt}>
                  <div className="flex flex-wrap gap-2">
                    {d.packingSuggestions.map((p: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{p}</Badge>))}
                  </div>
                </SectionCard>
              )}

              {/* Nearby Attractions */}
              {(d.nearbyAttractions?.length ?? 0) > 0 && (
                <SectionCard title="Nearby Attractions" icon={Navigation}>
                  <ul className="space-y-2">
                    {d.nearbyAttractions.map((a: string, i: number) => (
                      <li key={i} className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{a}</li>
                    ))}
                  </ul>
                </SectionCard>
              )}
            </div>
          </div>
        )}

        {/* FAMOUS PLACES TAB */}
        {activeTab === "places" && (
          <div>
            {subDests.length === 0 ? (
              <div className="text-center py-16"><TreePine className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">Famous places coming soon</h3><p className="text-muted-foreground text-sm">We are adding detailed sub-locations for this destination.</p></div>
            ) : (
              <div className="space-y-6">
                <p className="text-muted-foreground">Explore the famous places and attractions within {d.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subDests.map((sub: any, i: number) => (
                    <motion.div key={sub.id ?? i} initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg transition-all">
                      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                        <Image src={sub.imageUrl ?? ""} alt={sub.name ?? "Place"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                        <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0 text-xs capitalize">{sub.category ?? "attraction"}</Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold text-lg mb-2">{sub.name ?? ""}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{sub.description ?? ""}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="max-w-3xl space-y-6">
            {/* Rating Summary */}
            <div className="flex items-center gap-6 p-6 rounded-xl bg-card border border-border/50">
              <div className="text-center">
                <div className="text-4xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "--"}</div>
                <StarRating rating={Math.round(avgRating)} />
                <p className="text-xs text-muted-foreground mt-1">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1">
                <Button onClick={() => { if (!session?.user) { toast.error("Please sign in"); return; } setShowReviewForm(!showReviewForm); }} className="gap-2">
                  <Star className="h-4 w-4" />{showReviewForm ? "Cancel" : "Write a Review"}
                </Button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReview} className="p-6 rounded-xl bg-card border border-border/50 space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Rating</label><StarRating rating={reviewRating} onRate={setReviewRating} interactive /></div>
                <div><label className="text-sm font-medium mb-1 block">Title</label><Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Summarize your experience" /></div>
                <div><label className="text-sm font-medium mb-1 block">Review</label><Textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="Share your experience..." rows={4} /></div>
                <Button type="submit" disabled={submitting} className="gap-2">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}Post Review</Button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-12"><Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No reviews yet. Be the first!</p></div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (<ReviewCard key={r.id} review={r} onDelete={() => fetchReviews()} />))}
              </div>
            )}
          </div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === "community" && (
          <div className="max-w-3xl space-y-6">
            {/* Comment Input */}
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" />Join the Discussion</h3>
              <div className="flex gap-2">
                <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} onFocus={() => { if (!session?.user) requireAuth("post comments"); }} placeholder={session?.user ? "Share your thoughts about " + (d.name ?? "") + "..." : "Sign in to comment"} rows={2} className="flex-1" />
                <Button onClick={handleComment} disabled={!commentText.trim()} size="icon" className="shrink-0 h-10 w-10"><Send className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-12"><MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No comments yet. Start the conversation!</p></div>
            ) : (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{(c.user?.name ?? "U").charAt(0).toUpperCase()}</div>
                        <div><p className="text-sm font-medium">{c.user?.name ?? "User"}</p><p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p></div>
                      </div>
                      <div className="flex items-center gap-1">
                        {session?.user && c.userId !== session?.user?.id && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-500" onClick={() => setReportTarget({ type: "comment", id: c.id })}><Flag className="h-3 w-3" /></Button>
                        )}
                        {(c.userId === session?.user?.id || (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "moderator") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteComment(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.content ?? ""}</p>
                    {/* Replies */}
                    {(c.replies?.length ?? 0) > 0 && (
                      <div className="mt-3 ml-6 space-y-2 border-l-2 border-border pl-4">
                        {c.replies.map((r: any) => (
                          <div key={r.id} className="text-sm">
                            <span className="font-medium">{r.user?.name ?? "User"}</span>
                            <span className="text-muted-foreground ml-2">{r.content ?? ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Destinations */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Similar Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 3).map((r: any, i: number) => (<DestinationCard key={r.id ?? i} destination={r} index={i} />))}
            </div>
          </div>
        )}
      </div>

      {/* Report Content Modal */}
      {reportTarget && (
        <ReportContentModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          contentType={reportTarget.type}
          contentId={reportTarget.id}
        />
      )}
    </div>
  );
}

// Wrapper with AuthGuard
export function DestinationDetail({ slug }: Props) {
  const { data: session } = useSession() || {};
  return (
    <AuthGuardProvider isAuthenticated={!!session?.user}>
      <DestinationDetailInner slug={slug} />
    </AuthGuardProvider>
  );
}
