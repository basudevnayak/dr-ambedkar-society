'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 shadow-md bg-white dark:bg-gray-900 dark:shadow-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-lg">
            <i className="fas fa-hands-helping text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dr. Ambedkar Society</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Serving Humanity Since 1995</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#home" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">HOME</a>
          
          <div className="dropdown relative group">
            <a href="#about" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              ABOUT <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </a>
            <div className="dropdown-menu absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 hidden group-hover:block z-20 border dark:border-gray-700">
              <a href="#about" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">1. ABOUT OUR HISTORY</a>
              <a href="#ambedkar" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">2. WHO IS DR. B.R. AMBEDKAR?</a>
              <a href="#governing-body" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">3. GOVERNING BODY</a>
              <a href="#reports" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">4. ANNUAL REPORTS</a>
              <a href="#media" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">5. MEDIA CENTRE</a>
            </div>
          </div>
          
          <div className="dropdown relative group">
            <a href="#focus" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              OUR FOCUS AREAS <i className="fas fa-chevron-down ml-1 text-xs"></i>
            </a>
            <div className="dropdown-menu absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 hidden group-hover:block z-20 border dark:border-gray-700">
              <a href="#women" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">1. WOMEN EMPOWERMENT</a>
              <a href="#child" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">2. CHILD WELFARE</a>
              <a href="#education" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">3. EDUCATION</a>
              <a href="#science" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">4. SCIENCE & TECHNOLOGY</a>
              <a href="#health" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">5. HEALTH & NUTRITION</a>
              <a href="#rural" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">6. RURAL DEVELOPMENT</a>
              <a href="#environment" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">7. ENVIRONMENT</a>
              <a href="#youth" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400">8. YOUTH WELFARE</a>
            </div>
          </div>
          
          <a href="#programmes" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">OUR PROGRAMMES</a>
          <a href="#events" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">WORKSHOPS & EVENTS</a>
          <a href="#contact" className="nav-link font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">CONTACT US</a>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-300">
            <i className="fas fa-hand-holding-heart mr-2"></i> DONATE NOW
          </button>
        </div>
      </div>
      
      <div className={`md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 px-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-4">
          <a href="#home" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">HOME</a>
          <a href="#about" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">ABOUT</a>
          <a href="#focus" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">OUR FOCUS AREAS</a>
          <a href="#programmes" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">OUR PROGRAMMES</a>
          <a href="#events" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">WORKSHOPS & EVENTS</a>
          <a href="#contact" className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">CONTACT US</a>
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium w-full transition-colors duration-300">
            <i className="fas fa-hand-holding-heart mr-2"></i> DONATE NOW
          </button>
        </div>
      </div>
    </header>
  );
}