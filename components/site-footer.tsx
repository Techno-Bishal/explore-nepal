import Link from "next/link";
import { Mountain } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">Explore Nepal</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/destinations" className="hover:text-foreground transition-colors">Destinations</Link>
            <Link href="/stories" className="hover:text-foreground transition-colors">Stories</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made by <span className="font-medium text-foreground">Bishal</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
