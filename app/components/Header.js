"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/app/context/ThemeContext";
import { usePathname } from "next/navigation";

export default function Header() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [menus, setMenus] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const headerRef = useRef(null);

  // ===== Fetch menus =====
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/menus/header");
      const data = await res.json();
      if (data.success) setMenus(data.data);
    };
    load();
  }, []);

  const razorpayRefDesktop = useRef(null);
  const razorpayRefMobile = useRef(null);
  useEffect(() => {
    const loadButton = (ref) => {
      if (!ref?.current) return;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", "pl_SI4B7My9DUoabM");
      script.async = true;

      ref.current.innerHTML = "";
      ref.current.appendChild(script);
    };

    loadButton(razorpayRefDesktop);
    loadButton(razorpayRefMobile);
  }, []);

  // ===== Admin check =====
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === "admin" || pathname?.includes("/admin"));
  }, [pathname]);

  // ===== Close on outside click =====
  useEffect(() => {
    const close = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setDropdownOpen({});
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ⭐ SINGLE ACTIVE DROPDOWN
  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => (prev[id] ? {} : { [id]: true }));
  };

  // ===== Check if menu item is active =====
  const isActivePath = (path) => {
    if (!path) return false;

    // Exact match
    if (pathname === path) return true;

    // For home page
    if (path === "/" && pathname === "/") return true;

    // For nested routes (e.g., /about/history should highlight /about)
    if (path !== "/" && pathname?.startsWith(path + "/")) return true;

    // For admin section
    if (path.includes("/admin") && pathname?.includes("/admin")) return true;

    return false;
  };

  // ===== Check if any child is active =====
  const hasActiveChild = (children) => {
    if (!children) return false;
    return children.some((child) => isActivePath(child.path));
  };

  const homeItem = { _id: "home", label: "Home", path: "/" };
  const allMenus = [homeItem, ...menus];

  const adminMenu = {
    _id: "admin",
    label: "Admin",
    path: "/admin",
    children: [
      { _id: "d1", label: "Dropdown Management", path: "/admin/dropdowns" },
      { _id: "d2", label: "Users", path: "/admin/users" },
      { _id: "d3", label: "Settings", path: "/admin/settings" },
    ],
  };

  // ===== Desktop Menu Item =====
  const MenuItem = (item) => {
    const hasChildren = item.children?.length > 0;
    const isActive = isActivePath(item.path);
    const childActive = hasActiveChild(item.children);
    const isOpen = dropdownOpen[item._id];

    // Active state classes
    const activeClasses =
      isActive || childActive
        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold"
        : "hover:bg-blue-500/10 hover:text-blue-500";

    return (
      <div key={item._id} className="relative">
        {hasChildren ? (
          <>
            <button
              onClick={(e) => toggleDropdown(item._id, e)}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 ${activeClasses}`}
            >
              {item.label}
              <span
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {/* Dropdown */}
            <div
              className={`absolute left-0 mt-2 w-64
              backdrop-blur-xl bg-white/90 dark:bg-gray-900/90
              shadow-2xl rounded-2xl border
              border-white/20 dark:border-gray-700
              transition-all duration-300 z-50
              ${
                isOpen
                  ? "opacity-100 visible scale-100"
                  : "opacity-0 invisible scale-95"
              }`}
            >
              {item.children.map((c) => {
                const childActive = isActivePath(c.path);
                return (
                  <Link
                    key={c._id}
                    href={c.path}
                    onClick={() => setDropdownOpen({})}
                    className={`block px-5 py-3 rounded-xl transition ${
                      childActive
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium"
                        : "hover:bg-blue-500/10"
                    }`}
                  >
                    {c.label}
                    {childActive && <span className="ml-2 text-xs">✓</span>}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <Link
            href={item.path}
            className={`px-4 py-2 rounded-xl font-medium transition ${activeClasses}`}
          >
            {item.label}
            {isActive && (
              <span className="ml-2 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
        )}
      </div>
    );
  };

  // ===== Mobile Menu Item =====
  const MobileItem = (item) => {
    const hasChildren = item.children?.length > 0;
    const isActive = isActivePath(item.path);
    const childActive = hasActiveChild(item.children);
    const isOpen = dropdownOpen[item._id];

    const activeClasses =
      isActive || childActive
        ? "text-blue-600 dark:text-blue-400 font-semibold"
        : "";

    return (
      <div key={item._id}>
        {hasChildren ? (
          <>
            <button
              onClick={() =>
                setDropdownOpen((prev) =>
                  prev[item._id] ? {} : { [item._id]: true },
                )
              }
              className={`w-full text-left py-3 font-medium flex items-center justify-between ${activeClasses}`}
            >
              <span>{item.label}</span>
              <span
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-500/30 pl-3">
                {item.children.map((c) => {
                  const childActive = isActivePath(c.path);
                  return (
                    <Link
                      key={c._id}
                      href={c.path}
                      className={`block py-2 text-sm transition ${
                        childActive
                          ? "text-blue-600 dark:text-blue-400 font-medium"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      onClick={() => {
                        setMobileOpen(false);
                        setDropdownOpen({});
                      }}
                    >
                      {c.label}
                      {childActive && <span className="ml-2 text-xs">✓</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.path}
            className={`block py-3 font-medium transition ${activeClasses}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
            {isActive && <span className="ml-2 text-blue-500">●</span>}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header
        ref={headerRef}
        className="fixed top-0 w-full z-50
        backdrop-blur-xl bg-white/70 dark:bg-gray-900/70
        border-b border-white/20 dark:border-gray-800"
      >
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-lg hover:text-blue-500 transition"
          >
            Ambedkar Society
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {allMenus.map(MenuItem)}
            {isAdmin && MenuItem(adminMenu)}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form ref={razorpayRefDesktop}></form>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-2xl p-2 hover:bg-blue-500/10 rounded-xl transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile Panel ===== */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-40
        bg-white dark:bg-gray-900 shadow-2xl
        transition-transform duration-500 lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 mt-20 space-y-3">
          {allMenus.map(MobileItem)}
          {isAdmin && MobileItem(adminMenu)}
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
