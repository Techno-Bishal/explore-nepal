"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, MapPin, Users, Heart, Layers, TrendingUp, Star,
  Loader2, Trash2, Edit, Eye, ToggleLeft, ToggleRight,
  Plus, Mountain,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function AdminClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin" || userRole === "moderator";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      toast.error("Admin access required");
      router.replace("/dashboard");
      return;
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      Promise.all([
        fetch("/api/admin/stats").then((r: any) => r?.json?.()),
        fetch("/api/admin/destinations").then((r: any) => r?.json?.()),
      ])
        .then(([statsData, destData]: any[]) => {
          setStats(statsData?.stats ?? null);
          setDestinations(destData?.destinations ?? []);
        })
        .catch((e: any) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [status, isAdmin]);

  const toggleFeature = async (id: string, field: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (res?.ok) {
        setDestinations((prev: any[]) =>
          (prev ?? [])?.map?.((d: any) =>
            d?.id === id ? { ...(d ?? {}), [field]: !currentValue } : d
          ) ?? []
        );
        toast.success("Updated!");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window?.confirm?.(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
      if (res?.ok) {
        setDestinations((prev: any[]) => (prev ?? [])?.filter?.((d: any) => d?.id !== id) ?? []);
        toast.success("Deleted!");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: "Destinations", value: stats?.totalDestinations ?? 0, icon: MapPin, color: "text-blue-500" },
    { label: "Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-green-500" },
    { label: "Favorites", value: stats?.totalFavorites ?? 0, icon: Heart, color: "text-red-500" },
    { label: "Categories", value: stats?.totalCategories ?? 0, icon: Layers, color: "text-purple-500" },
    { label: "Featured", value: stats?.featuredCount ?? 0, icon: Star, color: "text-amber-500" },
    { label: "Trending", value: stats?.trendingCount ?? 0, icon: TrendingUp, color: "text-cyan-500" },
  ];

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage destinations, users, and platform settings</p>
          </div>
          <Link href="/admin/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Destination
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards?.map?.((s: any, i: number) => (
            <motion.div
              key={s?.label ?? i}
              initial={{ opacity: 1, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-card border border-border/50 text-center"
            >
              {s?.icon && <s.icon className={`h-6 w-6 ${s?.color ?? ""} mx-auto mb-2`} />}
              <p className="font-display text-2xl font-bold">{s?.value ?? 0}</p>
              <p className="text-xs text-muted-foreground">{s?.label ?? ""}</p>
            </motion.div>
          ))}
        </div>

        {/* Destinations table */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-bold">All Destinations ({destinations?.length ?? 0})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground">Destination</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Difficulty</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Featured</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Trending</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground text-center hidden md:table-cell">Favorites</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations?.map?.((d: any) => (
                  <tr key={d?.id ?? ""} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={d?.imageUrl ?? "/placeholder.jpg"}
                            alt={d?.name ?? ""}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <span className="font-medium text-sm">{d?.name ?? ""}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{d?.location ?? ""}</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">{d?.difficultyLevel ?? ""}</Badge>
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleFeature(d?.id ?? "", "isFeatured", d?.isFeatured ?? false)}>
                        {d?.isFeatured ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleFeature(d?.id ?? "", "isTrending", d?.isTrending ?? false)}>
                        {d?.isTrending ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center text-sm hidden md:table-cell">{d?._count?.favorites ?? 0}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/destinations/${d?.slug ?? ""}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(d?.id ?? "", d?.name ?? "")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
