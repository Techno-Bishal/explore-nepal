"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Mountain, Expand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const validImages = images?.filter((_, i) => !imgErrors.has(i)) ?? [];
  if (validImages.length === 0) return null;

  const handleImgError = (index: number) => {
    setImgErrors(prev => new Set(prev).add(index));
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < images.length) setCurrentIndex(index);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted group cursor-pointer" onClick={() => setFullscreen(true)}>
          {!imgErrors.has(currentIndex) ? (
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Photo ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 800px"
              onError={() => handleImgError(currentIndex)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Mountain className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors" disabled={currentIndex === 0}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors" disabled={currentIndex === images.length - 1}>
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === i ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {!imgErrors.has(i) ? (
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" onError={() => handleImgError(i)} />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center"><Mountain className="h-3 w-3 text-muted-foreground/30" /></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10" onClick={() => setFullscreen(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              {!imgErrors.has(currentIndex) && (
                <Image
                  src={images[currentIndex]}
                  alt={`${alt} - Full size ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  quality={90}
                />
              )}
            </div>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" disabled={currentIndex === 0}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" disabled={currentIndex === images.length - 1}>
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                      className={`h-2 w-2 rounded-full transition-all ${currentIndex === i ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
