"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, BookOpen, Clock, Layers, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  image: string;
  type: "video" | "ebook";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  targetUrl: string;
}

interface FeaturedCarouselProps {
  onQuickPreview: (id: string, type: "video" | "ebook") => void;
  onStartLearning: (url: string) => void;
}

export default function FeaturedCarousel({ onQuickPreview, onStartLearning }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const featuredList: FeaturedProject[] = [
    {
      id: "video-spider-robot",
      title: "Mechanical Spider Robot Kit",
      description: "Build an multi-legged robotic spider using Arduino Nano. Program gait kinematics, crawling, and ultrasonic wall dodging mechanics.",
      image: "https://img.youtube.com/vi/W4EaB6HhM_M/0.jpg",
      type: "video",
      difficulty: "Intermediate",
      duration: "4 Hours",
      targetUrl: "/videos/video-spider-robot",
    },
    {
      id: "ebook-obstacle-detector",
      title: "Ultrasonic Obstacle Detector",
      description: "Master sensor interface, frequency ping emission, and tactile feedback buzzer calibration for visual assistance hardware.",
      image: "https://img.youtube.com/vi/FHww-ojh568/0.jpg",
      type: "ebook",
      difficulty: "Beginner",
      duration: "2.5 Hours",
      targetUrl: "/ebooks/ebook-obstacle-detector",
    },
    {
      id: "video-iot-soil",
      title: "IoT Soil Moisture System",
      description: "Deploy an ESP8266 node collecting soil humidity metrics, syncing data to cloud database telemetry dashboards.",
      image: "https://img.youtube.com/vi/aZntV_tP0d8/0.jpg",
      type: "video",
      difficulty: "Advanced",
      duration: "5 Hours",
      targetUrl: "/videos/video-iot-soil",
    },
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const handleNext = () => {
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

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-5 shadow-sm animate-fade-in-up glow-ambient-orange">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">
            Featured This Week
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
        className="relative w-full h-[280px] sm:h-[220px] overflow-hidden rounded-2xl"
      >
        {featuredList.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-700 ease-in-out transform ${
                isActive 
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" 
                  : "opacity-0 translate-x-full scale-95 pointer-events-none"
              }`}
            >
              {/* Left Column: Image with Play overlay */}
              <div className="relative w-full sm:w-2/5 h-[130px] sm:h-full rounded-xl overflow-hidden border border-slate-200/50 shadow-sm flex-shrink-0 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
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
                      item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}>
                      {item.type === "video" ? "Video Lecture" : "Ebook"}
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
                    className="flex-1 sm:flex-initial px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300 font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 premium-btn-interactive"
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
