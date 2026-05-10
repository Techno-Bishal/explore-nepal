"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Mountain,
  Search,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Compass,
  BookOpen,
  Map,
  GitCompare,
  Sparkles,
  Route,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchDialog } from "@/components/search-dialog";

export function SiteHeader() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin" || userRole === "moderator";

  const navLinks = [
    { href: "/destinations", label: "Destinations", icon: Compass },
    { href: "/map", label: "Map", icon: Map },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/trip-planner", label: "Trip Planner", icon: Route },
    { href: "/quiz", label: "Quiz", icon: Sparkles },
    { href: "/stories", label: "Stories", icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Mountain className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-display text-lg font-bold tracking-tight">
              Explore <span className="text-primary">Nepal</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks?.map((link: any) => (
              <Link key={link?.href} href={link?.href ?? "/"}>
                <Button
                  variant={pathname === link?.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  {link?.icon && <link.icon className="h-4 w-4" />}
                  {link?.label ?? ""}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>

            <ThemeToggle />

            {status === "authenticated" && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{session?.user?.name ?? "User"}</p>
                      {userRole && userRole !== "user" && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{userRole}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{session?.user?.email ?? ""}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-600 dark:text-green-400">Secure session</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/favorites" className="gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col p-4 gap-2">
              {navLinks?.map((link: any) => (
                <Link key={link?.href} href={link?.href ?? "/"} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    {link?.icon && <link.icon className="h-4 w-4" />}
                    {link?.label ?? ""}
                  </Button>
                </Link>
              ))}
              {status !== "authenticated" && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
