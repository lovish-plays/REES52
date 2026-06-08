"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, BookOpen, Clock, Layers, Eye } from "lucide-react";

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  image: string;
  type: "video" | "ebook";
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  targetUrl: string;
}

interface FeaturedCarouselProps {
  onQuickPreview: (id: string, type: "video" | "ebook" | "product") => void;
  onStartLearning: (url: string) => void;
  products: any[];
  items: any[];
  categories: any[];
}

function getYouTubeId(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default function FeaturedCarousel({ onQuickPreview, onStartLearning, products, items, categories }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Filter out products and webinars to show ONLY uploaded Videos and Ebooks dynamically
  const dbItems = items.filter(it => it.type === "video" || it.type === "ebook");

  const featuredList: FeaturedProject[] = dbItems.slice(0, 3).map((item) => {
    let image = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60";
    if (item.type === "video" && item.rawUrl) {
      const ytId = getYouTubeId(item.rawUrl);
      if (ytId) {
        image = `https://img.youtube.com/vi/${ytId}/0.jpg`;
      }
    } else if (item.type === "ebook") {
      const prod = products.find(p => p.id === item.productId);
      image = prod?.image_url || "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=60";
    }

    const cat = categories.find(c => c.id === item.categoryId);
    const categoryName = cat?.name ?? "STEM Prototyping";

    const titleLower = item.title.toLowerCase();
    const difficulty = titleLower.includes("soil") || titleLower.includes("moisture") ? "Advanced" : 
                       titleLower.includes("spider") || titleLower.includes("robot") || titleLower.includes("car") ? "Intermediate" : "Beginner";
    const duration = titleLower.includes("soil") || titleLower.includes("moisture") ? "5 Hours" : 
                     titleLower.includes("spider") || titleLower.includes("robot") || titleLower.includes("car") ? "4 Hours" : "2.5 Hours";

    return {
      id: item.id,
      title: item.title,
      description: item.description ?? "Explore this comprehensive companion course module designed for the REES52 DIY prototyping platform. Integrate microcontrollers with sensors, configure schematic diagrams, and construct autonomous embedded systems.",
      image,
      type: item.type as "video" | "ebook",
      category: categoryName,
      difficulty,
      duration,
      targetUrl: item.url,
    };
  });

  // Auto slide effect
  useEffect(() => {
    if (featuredList.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, featuredList.length]);

  const handlePrev = () => {
    if (featuredList.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (featuredList.length === 0) return;
    setCurrentIndex((prev) => (prev === featuredList.length - 1 ? 0 : prev + 1));
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext(); // Swiped left, show next slide
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrev(); // Swiped right, show previous slide
    }
  };

  if (featuredList.length === 0) {
    return null; // Hide the carousel if there is no uploaded content
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-5 shadow-sm animate-fade-in-up glow-ambient-orange">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">
            Featured Content
          </h2>
        </div>

        {/* Carousel manual navigation arrow icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-cyan-500 bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            aria-label="Previous featured project"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-cyan-500 bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            aria-label="Next featured project"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Slide Carousel Track */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[320px] sm:h-[220px] overflow-hidden rounded-2xl"
      >
        {featuredList.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-700 ease-in-out transform ${
                isActive 
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10" 
                  : "opacity-0 translate-x-full scale-95 pointer-events-none z-0"
              }`}
            >
              {/* Left Column: Image with Play overlay */}
              <div className="relative w-full sm:w-2/5 h-[130px] sm:h-full rounded-xl overflow-hidden border border-slate-200/50 shadow-sm flex-shrink-0 group">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
                  <div className="p-3 bg-white/95 text-cyan-600 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    {item.type === "video" ? (
                      <Play className="w-4 h-4 fill-cyan-600" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Spec info & Action Triggers */}
              <div className="flex-1 flex flex-col justify-between h-full py-1 text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                      item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" :
                      "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}>
                      {item.type === "video" ? "Video Lecture" : "Ebook Guide"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-650">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> {item.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.duration}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-cyan-700 tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-650 leading-relaxed line-clamp-2 font-medium max-w-xl">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onStartLearning(item.targetUrl)}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 premium-btn-interactive"
                  >
                    <span>Quick Start</span>
                    <Play className="w-3 h-3 fill-white text-white" />
                  </button>

                  <button
                    onClick={() => onQuickPreview(item.id, item.type)}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-350 font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 premium-btn-interactive"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Preview</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Micro Dot Slide Indicator Navigation elements */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {featuredList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? "w-5 bg-cyan-600" : "w-1.5 bg-slate-200 hover:bg-slate-350"
            }`}
            aria-label={`Go to featured slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
