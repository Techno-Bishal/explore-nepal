"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if ((password?.length ?? 0) < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res?.ok) {
        toast.error(data?.error ?? "Signup failed");
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        toast.error("Account created. Please sign in.");
        router.replace("/login");
      } else {
        toast.success("Welcome to Explore Nepal!");
        router.replace("/dashboard");
      }
    } catch (e: any) {
      console.error("Signup error:", e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <Mountain className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold tracking-tight">Create Your Account</h1>
        <p className="text-muted-foreground mt-1">Start exploring Nepal&apos;s incredible destinations</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl bg-card border border-border/50">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e: any) => setName(e?.target?.value ?? "")}
              placeholder="Your full name"
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e?.target?.value ?? "")}
              placeholder="your@email.com"
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: any) => setPassword(e?.target?.value ?? "")}
              placeholder="Min 6 characters, mix of character types"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1 pt-1">
              {[
                { label: "6+ characters", pass: password.length >= 6 },
                { label: "Lowercase letter", pass: /[a-z]/.test(password) },
                { label: "Number or uppercase", pass: /[0-9]/.test(password) || /[A-Z]/.test(password) },
              ].map((c, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-xs ${c.pass ? "text-green-600" : "text-muted-foreground"}`}>
                  <div className={`w-1 h-1 rounded-full ${c.pass ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  {c.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
