"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogIn, UserPlus, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Context ────────────────────────────────────────────────────────────────
interface AuthGuardContextType {
  requireAuth: (action?: string) => boolean;
  showAuthModal: (action?: string) => void;
}

const AuthGuardContext = createContext<AuthGuardContextType>({
  requireAuth: () => false,
  showAuthModal: () => {},
});

export function useAuthGuard() {
  return useContext(AuthGuardContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthGuardProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionName, setActionName] = useState("");
  const router = useRouter();

  const requireAuth = useCallback((action?: string): boolean => {
    if (isAuthenticated) return true;
    setActionName(action || "perform this action");
    setIsOpen(true);
    return false;
  }, [isAuthenticated]);

  const showAuthModal = useCallback((action?: string) => {
    setActionName(action || "perform this action");
    setIsOpen(true);
  }, []);

  return (
    <AuthGuardContext.Provider value={{ requireAuth, showAuthModal }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 1, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header gradient */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/15">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-bold">Sign In Required</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You need to be signed in to <span className="font-medium text-foreground">{actionName}</span>. Create a free account to unlock all features.
                </p>
              </div>

              {/* Features list */}
              <div className="px-6 py-4">
                <div className="space-y-2.5">
                  {[
                    "Save destinations to your wishlist",
                    "Write reviews & share travel stories",
                    "Track visited places & earn badges",
                    "Get personalized AI recommendations",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 pt-2 flex flex-col gap-2.5">
                <Button
                  onClick={() => { setIsOpen(false); router.push("/login"); }}
                  className="w-full gap-2"
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setIsOpen(false); router.push("/signup"); }}
                  className="w-full gap-2"
                  size="lg"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Free Account
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthGuardContext.Provider>
  );
}
