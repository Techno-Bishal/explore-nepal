"use client";

import { Star, User, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "@/lib/date-utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string | null; image: string | null };
  };
  onDelete?: (id: string) => void;
  onEdit?: (review: any) => void;
}

export function ReviewCard({ review, onDelete, onEdit }: ReviewCardProps) {
  const { data: session } = useSession() || {};
  const isOwner = (session?.user as any)?.id === review?.user?.id;
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{review?.user?.name ?? "Traveler"}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(review?.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < (review?.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium text-sm">{review?.title ?? ""}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review?.content ?? ""}</p>
      </div>
      {(isOwner || isAdmin) && (
        <div className="flex gap-2 pt-1">
          {isOwner && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(review)} className="h-7 text-xs gap-1">
              <Edit2 className="h-3 w-3" /> Edit
            </Button>
          )}
          {(isOwner || isAdmin) && onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(review.id)} className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
