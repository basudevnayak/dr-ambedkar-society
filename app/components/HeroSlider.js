'use client';

import { useState, useEffect } from 'react';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === totalSlides ? 1 : prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const showSlide = (slideNumber) => {
    setCurrentSlide(slideNumber);
  };

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="hero-slider">
        {/* Slide 1 */}
        <div className={`transition-opacity duration-800 ease-in-out ${currentSlide === 1 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-blue-700 text-white py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Empowering Communities</h2>
                <p className="text-xl mb-8 opacity-90">Dr. Ambedkar Society is dedicated to social welfare, education, and empowerment of underprivileged communities across India.</p>
                <a href="#programmes" className="inline-block bg-white dark:bg-gray-100 text-blue-700 dark:text-blue-800 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors duration-300">
                  Explore Our Programmes <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide 2 */}
        <div className={`transition-opacity duration-800 ease-in-out ${currentSlide === 2 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-900 dark:to-emerald-700 text-white py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Health & Nutrition Initiatives</h2>
                <p className="text-xl mb-8 opacity-90">We organize regular health checkup camps, blood donation drives, and thalassemia testing to promote community health.</p>
                <a href="#health" className="inline-block bg-white dark:bg-gray-100 text-emerald-700 dark:text-emerald-800 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors duration-300">
                  Learn About Our Health Programmes <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide 3 */}
        <div className={`transition-opacity duration-800 ease-in-out ${currentSlide === 3 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
          <div className="bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-900 dark:to-purple-700 text-white py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Education for All</h2>
                <p className="text-xl mb-8 opacity-90">Providing educational opportunities to children and youth from marginalized communities to build a brighter future.</p>
                <a href="#education" className="inline-block bg-white dark:bg-gray-100 text-purple-700 dark:text-purple-800 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors duration-300">
                  Support Our Education Initiatives <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {[1, 2, 3].map((slide) => (
          <button
            key={slide}
            onClick={() => showSlide(slide)}
            className={`w-3 h-3 rounded-full bg-white dark:bg-gray-300 transition-opacity duration-300 ${currentSlide === slide ? 'opacity-100' : 'opacity-50'}`}
            aria-label={`Go to slide ${slide}`}
          />
        ))}
      </div>
    </section>
  );
}