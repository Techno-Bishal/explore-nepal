"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "misinformation", label: "False information" },
  { value: "other", label: "Other" },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: string;
  contentId: string;
}

export function ReportContentModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, reason, details }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }
      toast.success("Report submitted. Thank you for keeping our community safe.");
      setReason("");
      setDetails("");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 1, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent p-6 pb-4">
              <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-500/15">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-display font-bold">Report Content</h3>
              </div>
              <p className="text-sm text-muted-foreground">Help us maintain a safe community by reporting inappropriate content.</p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      reason === r.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                className="w-full p-3 rounded-lg border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={500}
              />
            </div>

            <div className="px-6 pb-6 flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading || !reason} className="flex-1 gap-2 bg-red-600 hover:bg-red-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                Submit Report
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
