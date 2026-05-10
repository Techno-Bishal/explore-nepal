"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Heart, Settings, Loader2, Save, Star, PenSquare,
  MapPin, Calendar, BookOpen, Trophy, Target, Compass,
  CheckCircle, BookmarkPlus, Sparkles, Award, TrendingUp,
  Mountain, Trash2, Map, Shield, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ReviewCard } from "@/components/review-card";

export function DashboardClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "reviews" | "posts" | "visited" | "wishlist" | "badges">("overview");
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [badges, setBadges] = useState<any>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((r: any) => r?.json?.())
        .then((data: any) => {
          const u = data?.user;
          setProfile(u ?? null);
          setName(u?.name ?? "");
          setBio(u?.bio ?? "");
          setTravelStyle(u?.travelStyle ?? "");
          setLocation(u?.location ?? "");
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Fetch stats
      fetch("/api/user/stats").then(r => r.json()).then(setUserStats).catch(console.error);
      fetch("/api/user/badges").then(r => r.json()).then(setBadges).catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    if (!profile?.id) return;
    if (activeTab === "reviews") {
      setLoadingContent(true);
      fetch(`/api/reviews?userId=${profile.id}`)
        .then(r => r.json()).then(data => setMyReviews(data?.reviews ?? []))
        .catch(console.error).finally(() => setLoadingContent(false));
    } else if (activeTab === "posts") {
      setLoadingContent(true);
      fetch(`/api/travel-posts?userId=${profile.id}`)
        .then(r => r.json()).then(data => setMyPosts(data?.posts ?? []))
        .catch(console.error).finally(() => setLoadingContent(false));
    } else if (activeTab === "visited") {
      setLoadingContent(true);
      fetch("/api/user/visited")
        .then(r => r.json()).then(data => setVisitedPlaces(data?.visited ?? []))
        .catch(console.error).finally(() => setLoadingContent(false));
    } else if (activeTab === "wishlist") {
      setLoadingContent(true);
      fetch("/api/user/wishlist")
        .then(r => r.json()).then(data => setWishlistItems(data?.wishlist ?? []))
        .catch(console.error).finally(() => setLoadingContent(false));
    }
  }, [activeTab, profile?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, travelStyle, location }),
      });
      if (res?.ok) toast.success("Profile updated!");
      else toast.error("Failed to update");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      setMyReviews(prev => prev.filter(r => r.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/travel-posts/${id}`, { method: "DELETE" });
      toast.success("Post deleted");
      setMyPosts(prev => prev.filter(p => p.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const removeVisited = async (destinationId: string) => {
    try {
      await fetch(`/api/user/visited?destinationId=${destinationId}`, { method: "DELETE" });
      setVisitedPlaces(prev => prev.filter(v => v.destinationId !== destinationId));
      toast.success("Removed from visited");
    } catch { toast.error("Failed"); }
  };

  const removeWishlist = async (destinationId: string) => {
    try {
      await fetch(`/api/user/wishlist?destinationId=${destinationId}`, { method: "DELETE" });
      setWishlistItems(prev => prev.filter(w => w.destinationId !== destinationId));
      toast.success("Removed from wishlist");
    } catch { toast.error("Failed"); }
  };

  if (status === "loading" || loading) {
    return (<div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>);
  }
  if (!session?.user) return null;

  const explorerLevelNames = ["", "Beginner", "Wanderer", "Explorer", "Trekker", "Adventurer", "Pathfinder", "Mountaineer", "Sage", "Legend", "Nepal Master"];
  const levelName = explorerLevelNames[userStats?.explorerLevel || 1] || "Beginner";
  const levelProgress = ((userStats?.explorerLevel || 1) / 10) * 100;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Compass },
    { id: "profile" as const, label: "Profile", icon: Settings },
    { id: "visited" as const, label: "Visited", icon: CheckCircle },
    { id: "wishlist" as const, label: "Wishlist", icon: BookmarkPlus },
    { id: "badges" as const, label: "Badges", icon: Award },
    { id: "reviews" as const, label: "Reviews", icon: Star },
    { id: "posts" as const, label: "Posts", icon: PenSquare },
  ];

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your travel journey at a glance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-xl bg-card border border-border/50 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display font-bold text-lg">{profile?.name ?? "User"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
              
              {/* Travel Personality */}
              {userStats?.travelPersonality && (
                <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                  <p className="text-xs text-muted-foreground">Travel Personality</p>
                  <p className="text-sm font-bold text-primary">{userStats.travelPersonality}</p>
                </div>
              )}

              {/* Explorer Level */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Level {userStats?.explorerLevel || 1}</span>
                  <span className="font-medium text-primary">{levelName}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{userStats?.totalPoints || 0} XP</p>
              </div>

              {profile?.location && (<p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2"><MapPin className="h-3 w-3" />{profile.location}</p>)}
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Calendar className="h-3 w-3" />Joined {new Date(profile?.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Link href="/dashboard/favorites"><Button variant="outline" className="w-full gap-2 justify-start" size="sm"><Heart className="h-4 w-4 text-red-500" />Favorites ({profile?._count?.favorites ?? 0})</Button></Link>
              <Link href="/quiz"><Button variant="outline" className="w-full gap-2 justify-start" size="sm"><Sparkles className="h-4 w-4 text-purple-500" />{userStats?.travelPersonality ? "Retake Quiz" : "Take Personality Quiz"}</Button></Link>
              <Link href="/map"><Button variant="outline" className="w-full gap-2 justify-start" size="sm"><Map className="h-4 w-4 text-teal-500" />Interactive Map</Button></Link>
            </div>

            {/* Tab Navigation */}
            <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                }`}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Visited", value: userStats?.visitedCount || 0, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Wishlist", value: userStats?.wishlistCount || 0, icon: BookmarkPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Reviews", value: userStats?.reviewCount || 0, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    { label: "Badges", value: userStats?.badgeCount || 0, icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
                  ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-card border border-border/50">
                      <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Exploration Progress */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Nepal Exploration</h3>
                    <span className="text-sm font-bold text-primary">{userStats?.explorationPercentage || 0}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${userStats?.explorationPercentage || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userStats?.visitedCount || 0} of {userStats?.totalDestinations || 41} destinations explored
                  </p>
                </div>

                {/* Recent Badges */}
                {(badges?.earned?.length ?? 0) > 0 && (
                  <div className="p-6 rounded-xl bg-card border border-border/50">
                    <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Recent Badges</h3>
                    <div className="flex flex-wrap gap-3">
                      {badges.earned.slice(0, 6).map((b: any) => (
                        <div key={b.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <span className="text-2xl">{b.badgeIcon}</span>
                          <div>
                            <p className="text-sm font-medium">{b.badgeName}</p>
                            <p className="text-xs text-muted-foreground">{b.badgeDesc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {badges.earned.length > 6 && (
                      <button onClick={() => setActiveTab("badges")} className="mt-3 text-sm text-primary hover:underline">View all badges →</button>
                    )}
                  </div>
                )}

                {/* Quick Tips */}
                {!userStats?.travelPersonality && (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-purple-500" />Discover Your Travel Personality</h3>
                    <p className="text-sm text-muted-foreground mb-3">Take our quick quiz to unlock personalized Nepal destination recommendations!</p>
                    <Link href="/quiz"><Button size="sm" className="gap-2"><Sparkles className="h-3.5 w-3.5" />Take the Quiz</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-xl bg-card border border-border/50">
                <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Profile Settings</h2>
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e: any) => setName(e?.target?.value ?? "")} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e: any) => setLocation(e?.target?.value ?? "")} placeholder="Where are you from?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={bio} onChange={(e: any) => setBio(e?.target?.value ?? "")} placeholder="Tell us about your travel experiences..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Travel Style</Label>
                    <Select value={travelStyle} onValueChange={setTravelStyle}>
                      <SelectTrigger><SelectValue placeholder="Select your travel style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adventure">Adventure Seeker</SelectItem>
                        <SelectItem value="cultural">Culture Explorer</SelectItem>
                        <SelectItem value="nature">Nature Lover</SelectItem>
                        <SelectItem value="luxury">Luxury Traveler</SelectItem>
                        <SelectItem value="budget">Budget Backpacker</SelectItem>
                        <SelectItem value="spiritual">Spiritual Journey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Changes
                  </Button>

                  {/* Privacy & Security */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />Privacy & Security
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Profile Visibility</Label>
                        <Select
                          value={profile?.profilePrivacy || "public"}
                          onValueChange={async (val) => {
                            try {
                              const res = await fetch("/api/user/privacy", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ profilePrivacy: val }),
                              });
                              if (res.ok) toast.success("Privacy updated");
                              else toast.error("Failed to update privacy");
                            } catch { toast.error("Failed to update"); }
                          }}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public — Anyone can see your profile</SelectItem>
                            <SelectItem value="private">Private — Only you can see your profile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div>
                          <p className="text-sm font-medium">Logout from all devices</p>
                          <p className="text-xs text-muted-foreground">Invalidate all active sessions</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/auth/logout-all", { method: "POST" });
                              if (res.ok) {
                                toast.success("All sessions invalidated. Redirecting...");
                                setTimeout(() => window.location.href = "/login", 1500);
                              } else toast.error("Failed");
                            } catch { toast.error("Failed"); }
                          }}
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1.5" />Logout All
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISITED TAB */}
            {activeTab === "visited" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Visited Places ({visitedPlaces.length})</h2>
                {loadingContent ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : visitedPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visitedPlaces.map((v: any) => (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={v.destination?.imageUrl || ""} alt={v.destination?.name || ""} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/destinations/${v.destination?.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {v.destination?.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{v.destination?.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mountain className="h-3 w-3" />{v.destination?.altitude?.toLocaleString()}m
                            </span>
                          </div>
                        </div>
                        <button onClick={() => removeVisited(v.destinationId)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No visited places yet.</p>
                    <p className="text-sm mt-1">Mark destinations as visited from their detail pages!</p>
                    <Link href="/destinations"><Button variant="outline" size="sm" className="mt-3">Browse Destinations</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><BookmarkPlus className="h-5 w-5 text-amber-500" />Wishlist ({wishlistItems.length})</h2>
                {loadingContent ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {wishlistItems.map((w: any) => (
                      <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={w.destination?.imageUrl || ""} alt={w.destination?.name || ""} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/destinations/${w.destination?.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {w.destination?.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{w.destination?.location}</p>
                          {w.destination?.budgetEstimateLow && (
                            <p className="text-xs text-green-600 mt-0.5">From NPR {w.destination.budgetEstimateLow.toLocaleString()}/day</p>
                          )}
                        </div>
                        <button onClick={() => removeWishlist(w.destinationId)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <BookmarkPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p>Your wishlist is empty.</p>
                    <p className="text-sm mt-1">Add destinations to your wishlist from their detail pages!</p>
                    <Link href="/destinations"><Button variant="outline" size="sm" className="mt-3">Browse Destinations</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* BADGES TAB */}
            {activeTab === "badges" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Achievements & Badges</h2>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center gap-4">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <p className="font-semibold">Level {userStats?.explorerLevel || 1} — {levelName}</p>
                    <p className="text-sm text-muted-foreground">{userStats?.totalPoints || 0} XP earned · {badges?.earned?.length || 0} badges unlocked</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {badges?.all?.map((badge: any) => (
                    <div key={badge.id} className={`p-4 rounded-xl border flex items-center gap-3 ${
                      badge.earned
                        ? "bg-card border-primary/30 shadow-sm"
                        : "bg-muted/30 border-border/30 opacity-60"
                    }`}>
                      <span className="text-3xl">{badge.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{badge.name}</p>
                          {badge.earned && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><Star className="h-5 w-5 text-amber-400" />My Reviews</h2>
                {loadingContent ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : myReviews.length > 0 ? (
                  myReviews.map((r: any) => (
                    <div key={r.id}>
                      {r.destination && (
                        <Link href={`/destinations/${r.destination.slug}`} className="text-xs text-primary hover:underline mb-1 inline-block">→ {r.destination.name}</Link>
                      )}
                      <ReviewCard review={r} onDelete={deleteReview} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No reviews yet.</p>
                    <Link href="/destinations"><Button variant="outline" size="sm" className="mt-3">Browse Destinations</Button></Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* POSTS TAB */}
            {activeTab === "posts" && (
              <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />My Travel Posts</h2>
                  <Link href="/stories/new"><Button size="sm" className="gap-1.5"><PenSquare className="h-3.5 w-3.5" />Write a Story</Button></Link>
                </div>
                {loadingContent ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : myPosts.length > 0 ? (
                  myPosts.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl bg-card border border-border/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.content}</p>
                          {p.destination && (<p className="text-xs text-primary mt-1">→ {p.destination.name}</p>)}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deletePost(p.id)} className="text-destructive hover:text-destructive h-7 text-xs">Delete</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No travel posts yet.</p>
                    <Link href="/stories/new"><Button variant="outline" size="sm" className="mt-3">Write Your First Story</Button></Link>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
