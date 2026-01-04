'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { href: "#about", text: "About Our History" },
    { href: "#governing-body", text: "Governing Body" },
    { href: "#annual-reports", text: "Annual Reports" },
    { href: "#media", text: "Media Centre" },
    { href: "#programmes", text: "Our Programmes" },
    { href: "#events", text: "Workshops & Events" },
    { href: "#get-involved", text: "Get Involved" }
  ];

  const emailContacts = [
    { type: "All General Queries:", emails: ["info@ambedkarsociety.in", "contactambedkarsociety@gmail.com"] },
    { type: "Donation Related Queries:", emails: ["ambedkarsocietydonation@gmail.com"] },
    { type: "Blog Related Queries:", emails: ["ambedkarsocietyblog@gmail.com"] }
  ];

  const socialLinks = [
    { platform: "Facebook", icon: "fa-facebook-f", bg: "bg-blue-700 hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-700", href: "#" },
    { platform: "Twitter", icon: "fa-twitter", bg: "bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500", href: "#" },
    { platform: "Instagram", icon: "fa-instagram", bg: "bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600", href: "#" },
    { platform: "YouTube", icon: "fa-youtube", bg: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600", href: "#" }
  ];

  return (
    <>
      <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Us</h3>
              
              <div className="mb-6">
                <h4 className="font-bold text-blue-300 mb-3">Registered Office</h4>
                <p className="text-gray-300">AT- Nabinabagh, Mirbazar, Midnapore, West Medinipur, West Bengal, India, 721101</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-blue-300 mb-3">City Office</h4>
                <p className="text-gray-300">Satabdi Apartment, Post Box No- 07, 3rd Floor, Flat No07, 1520, Natabad, PS- Purba Jadavpur, Kolkata- 700099</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-blue-300 mb-3">Office Phone</h4>
                <p className="text-gray-300">03222-263902, +91 9434 9434 18</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-300">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Email Contacts</h3>
              <div className="space-y-4">
                {emailContacts.map((contact, index) => (
                  <div key={index}>
                    <p className="text-blue-300 font-medium">{contact.type}</p>
                    {contact.emails.map((email, emailIndex) => (
                      <p key={emailIndex} className="text-gray-300">{email}</p>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index}
                      href={social.href}
                      className={`${social.bg} w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300`}
                      aria-label={`Follow us on ${social.platform}`}
                    >
                      <i className={`fab ${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Dr. Ambedkar Society. All rights reserved.</p>
            <p className="mt-2">Designed with modern UI and Tailwind CSS</p>
          </div>
        </div>
      </footer>
      
      <button
        id="backToTop"
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 ${showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  );
}