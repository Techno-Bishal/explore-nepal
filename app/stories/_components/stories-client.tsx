"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, PenSquare, Loader2, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "@/lib/date-utils";

export function StoriesClient() {
  const { data: session } = useSession() || {};
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/travel-posts?limit=20")
      .then(r => r.json())
      .then(data => setPosts(data?.posts ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-[900px]">
        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />Travel Stories
            </h1>
            <p className="text-muted-foreground">Real experiences from fellow travelers exploring Nepal</p>
          </div>
          {session?.user && (
            <Link href="/stories/new">
              <Button className="gap-2"><PenSquare className="h-4 w-4" />Write a Story</Button>
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any, i: number) => (
              <motion.div key={post.id} initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post?.user?.name ?? "Traveler"}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(post?.createdAt)}</p>
                  </div>
                  {post?.destination && (
                    <Link href={`/destinations/${post.destination.slug}`} className="ml-auto text-xs text-primary hover:underline flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{post.destination.name}
                    </Link>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{post?.title ?? ""}</h3>
                <p className="text-muted-foreground leading-relaxed">{post?.content ?? ""}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display font-bold text-lg mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share your Nepal travel experience!</p>
            {session?.user && (
              <Link href="/stories/new"><Button className="gap-2"><PenSquare className="h-4 w-4" />Write the First Story</Button></Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
