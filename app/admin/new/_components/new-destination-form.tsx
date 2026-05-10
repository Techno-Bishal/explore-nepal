"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, Upload, Mountain } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

export function NewDestinationForm() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    shortDescription: "",
    longDescription: "",
    imageUrl: "",
    latitude: "",
    longitude: "",
    altitude: "",
    difficultyLevel: "easy",
    budgetLevel: "moderate",
    bestSeason: "",
    travelDuration: "",
    adventureLevel: "5",
    familyFriendly: true,
    isFeatured: false,
    isTrending: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !isAdmin) {
      toast.error("Admin access required");
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e?.target as any)?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file?.name ?? "image",
          contentType: file?.type ?? "image/jpeg",
          isPublic: true,
        }),
      });
      const data = await res.json();
      if (!data?.uploadUrl) throw new Error("No upload URL");

      const signedHeaders = new URL(data.uploadUrl).searchParams?.get?.("X-Amz-SignedHeaders") ?? "";
      const headers: Record<string, string> = { "Content-Type": file?.type ?? "image/jpeg" };
      if (signedHeaders?.includes?.("content-disposition")) {
        headers["Content-Disposition"] = "attachment";
      }

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers,
        body: file,
      });

      const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? "";
      const region = "us-east-1";
      const publicUrl = `https://i.ytimg.com/vi/LWhnS5elz4o/maxresdefault.jpg ?? ""}`;

      setForm((prev: any) => ({ ...(prev ?? {}), imageUrl: publicUrl }));
      toast.success("Image uploaded!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Upload failed. You can paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form?.name || !form?.location) {
      toast.error("Name and location are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res?.ok) {
        toast.success("Destination created!");
        router.replace("/admin");
      } else {
        const data = await res.json();
        toast.error(data?.error ?? "Failed");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[800px]">
        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Add New Destination</h1>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl bg-card border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form?.name ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), name: e?.target?.value ?? "" }))} required />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input value={form?.location ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), location: e?.target?.value ?? "" }))} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={form?.shortDescription ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), shortDescription: e?.target?.value ?? "" }))} />
            </div>

            <div className="space-y-2">
              <Label>Long Description</Label>
              <Textarea value={form?.longDescription ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), longDescription: e?.target?.value ?? "" }))} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-2">
                <Input value={form?.imageUrl ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), imageUrl: e?.target?.value ?? "" }))} placeholder="Image URL or upload" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <span className="gap-2">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload</span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value={form?.latitude ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), latitude: e?.target?.value ?? "" }))} />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value={form?.longitude ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), longitude: e?.target?.value ?? "" }))} />
              </div>
              <div className="space-y-2">
                <Label>Altitude (m)</Label>
                <Input type="number" value={form?.altitude ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), altitude: e?.target?.value ?? "" }))} />
              </div>
              <div className="space-y-2">
                <Label>Adventure (1-10)</Label>
                <Input type="number" min="1" max="10" value={form?.adventureLevel ?? "5"} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), adventureLevel: e?.target?.value ?? "5" }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form?.difficultyLevel ?? "easy"} onValueChange={(v: string) => setForm((p: any) => ({ ...(p ?? {}), difficultyLevel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Level</Label>
                <Select value={form?.budgetLevel ?? "moderate"} onValueChange={(v: string) => setForm((p: any) => ({ ...(p ?? {}), budgetLevel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Travel Duration</Label>
                <Input value={form?.travelDuration ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), travelDuration: e?.target?.value ?? "" }))} placeholder="e.g. 3-5 days" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Best Season</Label>
              <Input value={form?.bestSeason ?? ""} onChange={(e: any) => setForm((p: any) => ({ ...(p ?? {}), bestSeason: e?.target?.value ?? "" }))} placeholder="e.g. Autumn (September-November)" />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form?.familyFriendly ?? true} onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...(p ?? {}), familyFriendly: v }))} />
                <Label>Family Friendly</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form?.isFeatured ?? false} onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...(p ?? {}), isFeatured: v }))} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form?.isTrending ?? false} onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...(p ?? {}), isTrending: v }))} />
                <Label>Trending</Label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Destination
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
