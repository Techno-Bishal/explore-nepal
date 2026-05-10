"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain, Lock, Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strengthCount = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const passwordChecks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "Mix of character types (2+)", pass: strengthCount >= 2 },
    { label: "Passwords match", pass: password.length > 0 && password === confirmPassword },
  ];

  const allValid = passwordChecks.every((c) => c.pass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      toast.error("Please meet all password requirements");
      return;
    }
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <ShieldCheck className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground mb-4">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password">
            <Button>Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Password Reset!</h2>
          <p className="text-sm text-muted-foreground mb-6">Your password has been updated successfully. You can now sign in with your new password.</p>
          <Link href="/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
            <Mountain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
                placeholder="Create a strong password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Password strength indicators */}
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/50">
            {passwordChecks.map((check, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${check.pass ? "text-green-600" : "text-muted-foreground"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${check.pass ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                {check.label}
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !allValid}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reset Password
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
