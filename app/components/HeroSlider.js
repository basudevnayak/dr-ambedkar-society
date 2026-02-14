'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Image from 'next/image';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const sliderRef = useRef(null);
  const progressInterval = useRef(null);
  const totalSlides = 3;
  const { theme } = useTheme();

  // Slide data with light and dark mode configurations
  const slides = [
    {
      id: 1,
      title: "Empowering Communities",
      description: "Dr. Ambedkar Society is dedicated to social welfare, education, and empowerment of underprivileged communities across India.",
      buttonText: "Explore Our Programmes",
      link: "#programmes",
      // Light mode
      gradientLight: "from-blue-800 to-blue-600",
      buttonColorLight: "text-blue-700",
      // Dark mode
      gradientDark: "from-blue-900 to-blue-700",
      buttonColorDark: "text-blue-300",
      // Common
      image: "/images/hero-1.jpg",
      alt: "Community empowerment activities",
      icon: "fas fa-hands-helping",
    },
    {
      id: 2,
      title: "Health & Nutrition Initiatives",
      description: "We organize regular health checkup camps, blood donation drives, and thalassemia testing to promote community health.",
      buttonText: "Learn About Our Health Programmes",
      link: "#health",
      // Light mode
      gradientLight: "from-emerald-800 to-emerald-600",
      buttonColorLight: "text-emerald-700",
      // Dark mode
      gradientDark: "from-emerald-900 to-emerald-700",
      buttonColorDark: "text-emerald-300",
      // Common
      image: "/images/hero-2.jpg",
      alt: "Health camp and medical services",
      icon: "fas fa-heartbeat",
    },
    {
      id: 3,
      title: "Education for All",
      description: "Providing educational opportunities to children and youth from marginalized communities to build a brighter future.",
      buttonText: "Support Our Education Initiatives",
      link: "#education",
      // Light mode
      gradientLight: "from-purple-800 to-purple-600",
      buttonColorLight: "text-purple-700",
      // Dark mode
      gradientDark: "from-purple-900 to-purple-700",
      buttonColorDark: "text-purple-300",
      // Common
      image: "/images/hero-3.jpg",
      alt: "Children learning in classroom",
      icon: "fas fa-graduation-cap",
    },
  ];

  // Get current theme colors
  const getSlideGradient = (slide) => {
    return theme === 'dark' ? slide.gradientDark : slide.gradientLight;
  };

  const getButtonColor = (slide) => {
    return theme === 'dark' ? slide.buttonColorDark : slide.buttonColorLight;
  };

  // Smooth slide transition
  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    setProgress(0);
    
    // Reset animation flag after transition
    setTimeout(() => setIsAnimating(false), 700);
  }, [currentSlide, isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides]);

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const swipeThreshold = 50;
    
    if (distance > swipeThreshold) {
      // Swipe left - next slide
      nextSlide();
    } else if (distance < -swipeThreshold) {
      // Swipe right - previous slide
      prevSlide();
    }
    
    // Reset touch positions
    setTouchStartX(0);
    setTouchEndX(0);
  };

  // Auto-play with progress tracking
  useEffect(() => {
    if (!isAutoPlay) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    const startTime = Date.now();
    const duration = 5000; // 5 seconds
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    const autoPlay = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(autoPlay);
    };
  }, [currentSlide, nextSlide, isAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key >= '1' && e.key <= '3') goToSlide(parseInt(e.key) - 1);
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay(!isAutoPlay);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, goToSlide, isAutoPlay]);

  // Theme-based colors for controls
  const navButtonBg = theme === 'dark' 
    ? 'bg-gray-900/20 hover:bg-gray-900/40' 
    : 'bg-white/20 hover:bg-white/40';

  const indicatorBg = theme === 'dark' 
    ? 'bg-gray-900/30' 
    : 'bg-black/20';

  const dotActiveBg = theme === 'dark' 
    ? 'bg-gray-200' 
    : 'bg-white';

  const dotInactiveBg = theme === 'dark' 
    ? 'bg-gray-200/50 hover:bg-gray-200/80' 
    : 'bg-white/50 hover:bg-white/80';

  const borderColor = theme === 'dark' 
    ? 'border-gray-200/50' 
    : 'border-white/50';

  const hoverBorderColor = theme === 'dark' 
    ? 'border-gray-200/30' 
    : 'border-white/30';

  const textMuted = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-white/80';

  const textLight = theme === 'dark' 
    ? 'text-gray-400' 
    : 'text-white/60';

  return (
    <section 
      id="home" 
      className="relative overflow-hidden mt-[65px]"

      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={sliderRef}
    >
      <div className="hero-slider relative h-[70vh] min-h-[500px] max-h-[800px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              currentSlide === index
                ? 'opacity-100 z-10'
                : 'opacity-0 z-0'
            }`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
            }}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                {/* Gradient Overlay */}
                <div 
                  className={`absolute inset-0 z-10 bg-gradient-to-r ${getSlideGradient(slide)} opacity-90 transition-opacity duration-1000`}
                />
                
                {/* Background Image */}
                <div className="absolute inset-0">
                  {/* Image container with different opacity based on theme */}
                  <div className={`w-full h-full ${
                    theme === 'dark' 
                      ? 'bg-gray-900/70' 
                      : 'bg-gray-800/60'
                  }`}>
                    {/* Uncomment when you have actual images */}
                    {/* <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      className="object-cover transition-transform duration-10000 ease-linear mix-blend-overlay"
                      priority={index === 0}
                      sizes="100vw"
                      style={{ 
                        transform: `scale(${currentSlide === index ? 1.1 : 1})`,
                        opacity: theme === 'dark' ? 0.7 : 0.8
                      }}
                    /> */}
                  </div>
                  
                  {/* Pattern overlay for depth */}
                  <div className={`absolute inset-0 z-10 ${
                    theme === 'dark'
                      ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-gray-900/50'
                      : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-black/30'
                  }`}></div>
                </div>
              </div>
            </div>

            {/* Content with staggered animation */}
            <div className="relative z-20 h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  {/* Slide icon */}
                  <div className={`mb-6 transform transition-all duration-700 ease-out delay-100 ${
                    currentSlide === index 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  }`}>
                    <div className={`inline-flex p-4 rounded-2xl ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 backdrop-blur-sm'
                        : 'bg-white/20 backdrop-blur-sm'
                    }`}>
                      <i className={`${slide.icon} text-3xl ${
                        theme === 'dark' ? 'text-gray-200' : 'text-white'
                      }`}></i>
                    </div>
                  </div>
                  
                  <div className={`transform transition-all duration-700 ease-out delay-300 ${
                    currentSlide === index 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  }`}>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">
                      {slide.title}
                    </h2>
                  </div>
                  
                  <div className={`transform transition-all duration-700 ease-out delay-500 ${
                    currentSlide === index 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  }`}>
                    <p className={`text-xl md:text-2xl mb-10 leading-relaxed max-w-2xl ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-100'
                    } drop-shadow-lg`}>
                      {slide.description}
                    </p>
                  </div>
                  
                  <div className={`transform transition-all duration-700 ease-out delay-700 ${
                    currentSlide === index 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  }`}>
                    <a
                      href={slide.link}
                      className={`inline-flex items-center group ${
                        theme === 'dark'
                          ? 'bg-gray-800/80 hover:bg-gray-800 backdrop-blur-md'
                          : 'bg-white/90 hover:bg-white backdrop-blur-sm'
                      } font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl border ${
                        theme === 'dark'
                          ? 'border-gray-700/50 hover:border-gray-600'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <span className={`${getButtonColor(slide)} font-bold`}>
                        {slide.buttonText}
                      </span>
                      <i className={`fas fa-arrow-right ml-3 text-lg transform transition-transform duration-300 group-hover:translate-x-2 ${
                        currentSlide === index ? 'animate-gentle-pulse' : ''
                      } ${getButtonColor(slide)}`}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows with theme support */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className={`absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30 ${navButtonBg} backdrop-blur-md text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/30'
        }`}
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left text-xl md:text-2xl group-hover:-translate-x-1 transition-transform duration-300"></i>
      </button>

      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className={`absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30 ${navButtonBg} backdrop-blur-md text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/30'
        }`}
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right text-xl md:text-2xl group-hover:translate-x-1 transition-transform duration-300"></i>
      </button>

      {/* Progress Bar with theme support */}
      <div className={`absolute bottom-0 left-0 right-0 z-30 h-1 ${
        theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/20'
      }`}>
        <div 
          className={`h-full ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-300 to-gray-100'
              : 'bg-gradient-to-r from-white to-gray-100'
          } transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide Indicators with theme support */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Slide Numbers */}
          <div className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-2 border ${
            theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
          }`}>
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-gray-200' : 'text-white'
            }`}>
              {currentSlide + 1}
            </span>
            <span className={textLight}>/</span>
            <span className={textLight}>{totalSlides}</span>
          </div>

          {/* Slide Dots with animation */}
          <div className={`flex items-center space-x-3 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-3 border ${
            theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
          }`}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                className="relative group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? `${dotActiveBg} scale-125 ${
                        theme === 'dark' ? 'shadow-[0_0_10px_rgba(229,231,235,0.5)]' : 'shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                      }`
                    : `${dotInactiveBg}`
                }`} />
                
                {/* Hover effect */}
                <div className={`absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border-2 transition-all duration-300 ${
                  currentSlide === index
                    ? `${borderColor} scale-125`
                    : `border-transparent group-hover:${hoverBorderColor}`
                }`} />
              </button>
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-2 ${
              theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-white/80 hover:text-white'
            } transition-colors duration-300 group border ${
              theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
            }`}
            aria-label={isAutoPlay ? "Pause auto-play" : "Play auto-play"}
          >
            {isAutoPlay ? (
              <>
                <i className="fas fa-pause-circle group-hover:animate-pulse"></i>
                <span className="text-sm">Pause</span>
              </>
            ) : (
              <>
                <i className="fas fa-play-circle group-hover:animate-pulse"></i>
                <span className="text-sm">Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions for users with theme support */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden lg:flex items-center space-x-4 animate-pulse">
        <div className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-2 border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
        }`}>
          <kbd className={`px-2 py-1 rounded text-xs ${
            theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white/10 text-white/90'
          }`}>←</kbd>
          <kbd className={`px-2 py-1 rounded text-xs ${
            theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white/10 text-white/90'
          }`}>→</kbd>
          <span className={textMuted}>Navigate</span>
        </div>
        <div className={`h-4 w-px ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-white/30'
        }`}></div>
        <div className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-2 border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
        }`}>
          <i className={`fas fa-mouse-pointer ${textMuted}`}></i>
          <span className={textMuted}>Click dots</span>
        </div>
        <div className={`h-4 w-px ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-white/30'
        }`}></div>
        <div className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-4 py-2 border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
        }`}>
          <i className={`fas fa-hand-pointer ${textMuted}`}></i>
          <span className={textMuted}>Swipe</span>
        </div>
      </div>

      {/* Theme indicator */}
      <div className="absolute top-8 right-8 z-30 hidden lg:block">
        <div className={`flex items-center space-x-2 ${indicatorBg} backdrop-blur-sm rounded-full px-3 py-1.5 border ${
          theme === 'dark' ? 'border-gray-700/30' : 'border-white/20'
        }`}>
          <i className={`fas ${theme === 'dark' ? 'fa-moon text-amber-300' : 'fa-sun text-amber-500'} text-sm`}></i>
          <span className={`text-xs ${textMuted}`}>
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        </div>
      </div>

      {/* Loading indicator during animation */}
      {isAnimating && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin ${
            theme === 'dark'
              ? 'border-gray-700 border-t-gray-300'
              : 'border-white/20 border-t-white'
          }`}></div>
        </div>
      )}
    </section>
  );
}