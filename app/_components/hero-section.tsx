"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, Search, Mountain, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const heroSlides = [
  {
    image: "https://cdn.abacus.ai/images/9084eac5-2563-4a37-a773-76df4b01f814.png",
    title: "Conquer the Himalayas",
    subtitle: "Trek to the roof of the world",
  },
  {
    image: "https://cdn.abacus.ai/images/3e99d2c5-ded1-456e-9d7e-b4466aae4275.png",
    title: "Lakeside Serenity",
    subtitle: "Discover Nepal's breathtaking lakes",
  },
  {
    image: "https://cdn.abacus.ai/images/bf412de7-931b-4b5a-94cc-e2e6b057341c.png",
    title: "Ancient Heritage",
    subtitle: "Explore living cultural treasures",
  },
  {
    image: "https://i.pinimg.com/564x/9a/99/17/9a991771b67f2461bcc55a66b03cb18c.jpg",
    title: "Wild Encounters",
    subtitle: "Safari through pristine jungles",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [mounted]);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Images */}
      {heroSlides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${mounted && currentSlide === i ? "opacity-100" : "opacity-0"}`}>
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={i === 0} sizes="100vw" />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-[1200px] px-4 w-full">
          <motion.div initial={{ opacity: 1, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="text-primary font-medium tracking-wider text-sm uppercase">Explore Nepal</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              Discover the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Beauty</span>
              {" "}of Nepal
            </h1>

            {/* Animated subtitle */}
            <div className="h-8 mb-6 overflow-hidden">
              {heroSlides.map((slide, i) => (
                <p key={i} className={`text-lg md:text-xl text-white/80 transition-all duration-500 ${mounted && currentSlide === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute"}`}>
                  {slide.subtitle}
                </p>
              ))}
            </div>

            <p className="text-white/60 text-base md:text-lg mb-8 max-w-lg">
              From majestic Himalayan peaks to serene lakeside towns, ancient temples to hidden gems — your perfect Nepal adventure awaits.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/destinations">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                  <Compass className="h-5 w-5" />Explore Destinations<ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/destinations?featured=true">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 bg-black/30 backdrop-blur-sm">
                  <Search className="h-5 w-5" />Featured Places
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${mounted && currentSlide === i ? "w-8 bg-primary" : "w-3 bg-white/30 hover:bg-white/50"}`}
          />
        ))}
      </div>

      {/* Bottom scroll hint */}
      <div className="absolute bottom-4 right-4 text-white/40 text-xs flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {mounted ? heroSlides[currentSlide]?.title : heroSlides[0]?.title}
      </div>
    </section>
  );
}
