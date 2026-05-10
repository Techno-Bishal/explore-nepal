"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Mountain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready for Your Nepal Adventure?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Create an account to save your favorite destinations, get personalized recommendations, and plan your perfect trip.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/destinations">
              <Button size="lg" variant="outline" className="px-8">
                Browse Destinations
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
