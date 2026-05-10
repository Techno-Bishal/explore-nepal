"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Check Your Email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            If an account exists with <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
          </p>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            <Mountain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Reset Link
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
