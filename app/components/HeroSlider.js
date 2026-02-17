'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef(null);
  const progressRef = useRef(null);

  // Default fallback slides
  const defaultSlides = [
    {
      id: '1',
      image: "https://www.google.com/logos/doodles/2026/ski-jumping-2026-feb-16-a-6753651837111229-la1f1f1f.gif",
      alt: "Ski jumping Olympic event 2026",
    },
    {
      id: '2',
      image: "https://www.google.com/logos/doodles/2026/ski-jumping-2026-feb-16-a-6753651837111229-la1f1f1f.gif",
      alt: "Winter sports competition",
    },
    {
      id: '3',
      image: "https://www.google.com/logos/doodles/2026/ski-jumping-2026-feb-16-a-6753651837111229-la1f1f1f.gif",
      alt: "Athlete performing ski jump",
    },
  ];

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slides');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setSlides(data.data);
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setSlides(defaultSlides);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSlides = slides.length;

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide || !slides.length) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    setProgress(0);
    
    setTimeout(() => setIsAnimating(false), 500);
  }, [currentSlide, isAnimating, slides.length]);

  const nextSlide = useCallback(() => {
    if (!slides.length) return;
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides, slides.length]);

  const prevSlide = useCallback(() => {
    if (!slides.length) return;
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides, slides.length]);

  useEffect(() => {
    if (!isAutoPlay || !slides.length) {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    const duration = 5000;
    let startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    autoPlayRef.current = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentSlide, nextSlide, isAutoPlay, slides.length]);

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden mt-[65px] h-[70vh] min-h-[500px] max-h-[800px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slides...</p>
        </div>
      </section>
    );
  }

  if (!slides.length) {
    return null;
  }

  return (
    <section 
      className="relative overflow-hidden mt-[65px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-[70vh] min-h-[500px] max-h-[800px] w-full">
        {slides.map((slide, index) => (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              unoptimized
            />
            {/* <div className="absolute inset-0 bg-black/20"></div> */}
          </div>
        ))}

        <button
          onClick={prevSlide}
          disabled={isAnimating}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 
            bg-black/30 hover:bg-black/50 text-white w-10 h-10 md:w-12 md:h-12 rounded-full 
            flex items-center justify-center transition-all z-20 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-white/50
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left text-lg md:text-xl"></i>
        </button>

        <button
          onClick={nextSlide}
          disabled={isAnimating}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 
            bg-black/30 hover:bg-black/50 text-white w-10 h-10 md:w-12 md:h-12 rounded-full 
            flex items-center justify-center transition-all z-20 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-white/50
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right text-lg md:text-xl"></i>
        </button>

        <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
          <div className="flex space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                className={`transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-6 h-2 bg-white' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full 
              hover:bg-black/50 transition-all flex items-center space-x-2
              focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isAutoPlay ? "Pause auto-play" : "Start auto-play"}
          >
            <i className={`fas ${isAutoPlay ? 'fa-pause' : 'fa-play'} text-sm`}></i>
            <span className="text-sm hidden md:inline">
              {isAutoPlay ? 'Pause' : 'Play'}
            </span>
          </button>

          <div className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>

        {isAnimating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </section>
  );
}