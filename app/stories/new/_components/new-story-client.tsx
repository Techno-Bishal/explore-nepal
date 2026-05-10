"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function NewStoryClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [destinations, setDestinations] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/destinations?limit=100")
      .then(r => r.json())
      .then(data => setDestinations(data?.destinations ?? []))
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/travel-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, destinationId: destinationId || null }),
      });
      if (res.ok) {
        toast.success("Story published!");
        router.push("/stories");
      } else { toast.error("Failed to publish"); }
    } catch { toast.error("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (status === "loading") {
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[700px]">
        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <PenSquare className="h-8 w-8 text-primary" />Write a Travel Story
          </h1>
          <p className="text-muted-foreground mb-8">Share your Nepal travel experiences with the community</p>

          <div className="space-y-5 p-6 rounded-xl bg-card border border-border/50">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="My unforgettable trek to..." value={title} onChange={(e: any) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Related Destination (optional)</Label>
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger><SelectValue placeholder="Select a destination" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {destinations.map((d: any) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your Story</Label>
              <Textarea placeholder="Tell us about your experience..." value={content} onChange={(e: any) => setContent(e.target.value)} rows={10} />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Publish Story
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
