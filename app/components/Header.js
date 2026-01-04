'use client';

import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/app/context/ThemeContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({ about: false, focus: false });
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headerRef = useRef(null);
  const { theme } = useTheme();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
    }
  };

  // Handle scroll events with hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      const currentScrollY = window.scrollY;
      
      // For transparency effect - change to solid after 10px scroll
      const isScrolled = currentScrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }

      // For hide/show behavior (scroll down = hide, scroll up = show)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling DOWN - hide header
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP - show header
        setVisible(true);
      }

      // Update scroll progress
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      // Update active link based on scroll position
      const sections = ['home', 'about', 'focus', 'programmes', 'events', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveLink(currentSection);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled, lastScrollY]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'auto';
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setDropdownOpen({ about: false, focus: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown) => {
    setDropdownOpen(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({ about: false, focus: false });
  };

  const scrollToSection = (sectionId) => {
    if (typeof document === 'undefined') return;
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = headerRef.current?.offsetHeight || 80;
      const targetPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      setMobileMenuOpen(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
      closeAllDropdowns();
    }
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { 
      id: 'about', 
      label: 'ABOUT',
      dropdownItems: [
        { id: 'about-history', label: '1. ABOUT OUR HISTORY' },
        { id: 'ambedkar', label: '2. WHO IS DR. B.R. AMBEDKAR?' },
        { id: 'governing-body', label: '3. GOVERNING BODY' },
        { id: 'reports', label: '4. ANNUAL REPORTS' },
        { id: 'media', label: '5. MEDIA CENTRE' }
      ]
    },
    { 
      id: 'focus', 
      label: 'OUR FOCUS AREAS',
      dropdownItems: [
        { id: 'women', label: '1. WOMEN EMPOWERMENT' },
        { id: 'child', label: '2. CHILD WELFARE' },
        { id: 'education', label: '3. EDUCATION' },
        { id: 'science', label: '4. SCIENCE & TECHNOLOGY' },
        { id: 'health', label: '5. HEALTH & NUTRITION' },
        { id: 'rural', label: '6. RURAL DEVELOPMENT' },
        { id: 'environment', label: '7. ENVIRONMENT' },
        { id: 'youth', label: '8. YOUTH WELFARE' }
      ]
    },
    { id: 'programmes', label: 'OUR PROGRAMMES' },
    { id: 'events', label: 'WORKSHOPS & EVENTS' },
    { id: 'contact', label: 'CONTACT US' }
  ];

  // Always show white text when not scrolled
  const getNavTextColor = () => {
    return scrolled 
      ? theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      : 'text-white';
  };

  const getNavHoverColor = () => {
    return scrolled 
      ? theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'
      : 'hover:text-blue-300';
  };

  const getActiveNavColor = () => {
    return scrolled 
      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
      : 'text-white';
  };

  const getActiveNavBg = () => {
    return scrolled 
      ? theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
      : 'bg-white/20';
  };

  const getLogoBg = () => {
    return scrolled 
      ? theme === 'dark' 
        ? 'bg-blue-500 hover:bg-blue-600' 
        : 'bg-blue-600 hover:bg-blue-700'
      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm';
  };

  const getDonateButtonStyle = () => {
    return scrolled
      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 hover:border-white/50';
  };

  const getHamburgerColor = () => {
    if (mobileMenuOpen) return 'bg-blue-500';
    return scrolled 
      ? theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'
      : 'bg-white';
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          visible 
            ? scrolled 
              ? (theme === 'dark' 
                  ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-700/50 py-2 translate-y-0' 
                  : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 py-2 translate-y-0')
              : 'bg-transparent py-3 translate-y-0'
            : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => scrollToSection('home')}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${getLogoBg()}`}>
                <i className="fas fa-hands-helping text-xl text-white"></i>
              </div>
              <div className="transition-all duration-300 group-hover:scale-105">
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  scrolled 
                    ? theme === 'dark' ? 'text-white' : 'text-gray-800'
                    : 'text-white'
                }`}>
                  Dr. Ambedkar Society
                </h1>
                <p className={`text-xs transition-colors duration-300 ${
                  scrolled 
                    ? theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    : 'text-white/80'
                }`}>
                  Serving Humanity Since 1995
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.dropdownItems ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        onMouseEnter={() => setDropdownOpen(prev => ({ ...prev, [item.id]: true }))}
                        onMouseLeave={() => setDropdownOpen(prev => ({ ...prev, [item.id]: false }))}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                          activeLink === item.id
                            ? `${getActiveNavBg()} ${getActiveNavColor()}`
                            : `${getNavTextColor()} ${getNavHoverColor()}`
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <i className={`fas fa-chevron-down ml-1 text-xs transition-transform duration-300 ${
                          dropdownOpen[item.id] ? 'rotate-180' : ''
                        }`}></i>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div
                        onMouseEnter={() => setDropdownOpen(prev => ({ ...prev, [item.id]: true }))}
                        onMouseLeave={() => setDropdownOpen(prev => ({ ...prev, [item.id]: false }))}
                        className={`absolute left-0 top-full mt-1 w-64 ${
                          theme === 'dark' 
                            ? 'bg-gray-800/95 backdrop-blur-md border-gray-700/50' 
                            : 'bg-white/95 backdrop-blur-md border-gray-200/50'
                        } shadow-xl rounded-xl py-2 z-40 border transition-all duration-300 transform origin-top ${
                          dropdownOpen[item.id] 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}
                      >
                        {item.dropdownItems.map((dropdownItem) => (
                          <button
                            key={dropdownItem.id}
                            onClick={() => scrollToSection(dropdownItem.id)}
                            className="block w-full text-left px-4 py-3 hover:bg-blue-500/10 transition-all duration-300 group"
                          >
                            <span className={`font-medium transition-colors duration-300 ${
                              theme === 'dark' 
                                ? 'text-gray-300 group-hover:text-blue-400' 
                                : 'text-gray-700 group-hover:text-blue-600'
                            }`}>
                              {dropdownItem.label}
                            </span>
                            <i className="fas fa-arrow-right ml-2 text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"></i>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group ${
                        activeLink === item.id
                          ? `${getActiveNavColor()}`
                          : `${getNavTextColor()} ${getNavHoverColor()}`
                      }`}
                    >
                      {item.label}
                      <span className={`absolute bottom-0 left-1/2 w-0 h-0.5 -translate-x-1/2 transition-all duration-300 ${
                        activeLink === item.id || scrolled
                          ? 'w-3/4 bg-blue-500' 
                          : 'group-hover:w-3/4 bg-white'
                      }`}></span>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <div className={scrolled ? '' : 'backdrop-blur-sm bg-white/10 rounded-lg p-1'}>
                <ThemeToggle />
              </div>
              
              {/* Donate Button - Desktop */}
              <button className={`hidden lg:flex items-center px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group ${getDonateButtonStyle()}`}>
                <i className="fas fa-hand-holding-heart mr-2 group-hover:animate-bounce"></i>
                DONATE NOW
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                  scrolled
                    ? theme === 'dark'
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-100'
                    : 'hover:bg-white/20'
                }`}
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-5">
                  <span className={`absolute left-0 w-6 h-0.5 transition-all duration-300 top-0 ${
                    mobileMenuOpen ? 'rotate-45' : ''
                  } ${getHamburgerColor()}`}></span>
                  <span className={`absolute left-0 top-2 w-6 h-0.5 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  } ${getHamburgerColor()}`}></span>
                  <span className={`absolute left-0 w-6 h-0.5 transition-all duration-300 top-4 ${
                    mobileMenuOpen ? '-rotate-45' : ''
                  } ${getHamburgerColor()}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
        mobileMenuOpen 
          ? 'opacity-100 visible' 
          : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Mobile Menu Panel */}
        <div className={`absolute top-0 left-0 h-full w-80 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        } shadow-2xl transform transition-all duration-500 ease-out ${
          mobileMenuOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}>
          {/* Mobile Menu Header */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                }`}>
                  <i className="fas fa-hands-helping text-xl text-white"></i>
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Dr. Ambedkar Society
                  </h1>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Serving Humanity Since 1995
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                <i className="fas fa-times text-xl text-gray-600 dark:text-gray-300"></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu Content */}
          <div className="h-[calc(100vh-140px)] overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.id} className="mb-2">
                  {item.dropdownItems ? (
                    <>
                      <button
                        onClick={() => setDropdownOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={`flex items-center justify-between w-full p-4 rounded-lg transition-all duration-300 ${
                          activeLink === item.id
                            ? theme === 'dark' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-blue-50 text-blue-600'
                            : theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <i className={`fas fa-chevron-down transition-transform duration-300 ${
                          dropdownOpen[item.id] ? 'rotate-180' : ''
                        }`}></i>
                      </button>
                      
                      {/* Mobile Dropdown Items */}
                      <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                        dropdownOpen[item.id] 
                          ? 'max-h-96 opacity-100' 
                          : 'max-h-0 opacity-0'
                      }`}>
                        {item.dropdownItems.map((dropdownItem) => (
                          <button
                            key={dropdownItem.id}
                            onClick={() => {
                              scrollToSection(dropdownItem.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`block w-full text-left p-3 rounded-lg transition-all duration-300 ${
                              theme === 'dark'
                                ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                            }`}
                          >
                            {dropdownItem.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        scrollToSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full p-4 rounded-lg transition-all duration-300 ${
                        activeLink === item.id
                          ? theme === 'dark'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                          : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Donate Button - Mobile */}
            <div className="mt-8 p-4">
              <button className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                <i className="fas fa-hand-holding-heart mr-2"></i>
                DONATE NOW
              </button>
            </div>

            {/* Contact Info - Mobile */}
            <div className={`mt-8 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
            }`}>
              <h3 className={`font-bold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Contact Info
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <i className="fas fa-phone mr-2"></i>
                03222-263902
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <i className="fas fa-envelope mr-2"></i>
                info@ambedkarsociety.in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
}