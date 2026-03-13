// app/admin/layout.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "@/app/context/ThemeContext";
import clsx from "clsx";

// Navigation configuration
const adminNavItems = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/dropdowns", icon: "bars", label: "Dropdown Menus" },
  { href: "/admin/pages", icon: "bars", label: "Pages" },
  { href: "/admin/users", icon: "users", label: "Users" },
  { href: "/admin/settings", icon: "cog", label: "Settings" },
  { href: "/admin/analytics", icon: "chart-line", label: "Analytics" },
  { href: "/admin/content", icon: "file-alt", label: "Content" },
];

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400 text-lg">
      Loading admin panel...
    </p>
  </div>
);

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");
  const [authError, setAuthError] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  const publicPaths = [
    "/admin/login",
    "/admin/register",
    "/admin/forgot-password",
  ];
  const isPublicPath = publicPaths.includes(pathname);

  // Keyboard navigation for mobile menu
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        // Check if we're on a public path
        if (isPublicPath) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Get auth data from localStorage
        const adminAuth = localStorage.getItem("adminAuthenticated");
        const adminUser = localStorage.getItem("adminUser");

        console.log("Auth check:", { adminAuth, adminUser }); // Debug log

        // Validate stored data
        if (adminAuth === "true") {
          try {
            // If there's user data, parse it
            if (adminUser) {
              const userData = JSON.parse(adminUser);
              if (userData && userData.name) {
                setUserName(userData.name);
              }
            }

            // Set authenticated state
            setIsAuthenticated(true);
            console.log("User is authenticated"); // Debug log
          } catch (parseError) {
            console.error("Invalid user data in localStorage");
            // Clear invalid data but keep authenticated
            localStorage.removeItem("adminUser");
            setIsAuthenticated(true);
          }
        } else {
          console.log("User is not authenticated, redirecting to login"); // Debug log
          // Redirect to login if not authenticated
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthError("Authentication failed. Please log in again.");
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [pathname, isPublicPath, router]);

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear all auth-related items
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminPreferences");

      // Update state
      setIsAuthenticated(false);

      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if localStorage clear fails
      router.push("/admin/login");
    }
  };

  // Show loading skeleton while checking auth
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show auth error if any
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // For public paths (login, register, etc.), render without admin layout
  if (isPublicPath) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </ThemeProvider>
    );
  }

  // If not authenticated on protected route, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render full admin layout
  console.log("Rendering admin layout for:", pathname); // Debug log

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* ================= HEADER ================= */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-40 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar"
            >
              <i
                className="fas fa-bars text-xl text-gray-600 dark:text-gray-300"
                aria-hidden="true"
              ></i>
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <i
                className={`fas fa-chevron-${sidebarOpen ? "left" : "right"} text-gray-600 dark:text-gray-300`}
                aria-hidden="true"
              ></i>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-crown text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Admin Panel
              </h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <i className="fas fa-bell text-gray-600 dark:text-gray-300 text-lg"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Welcome, {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ================= MOBILE OVERLAY ================= */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ================= SIDEBAR ================= */}
        <aside
          id="admin-sidebar"
          aria-label="Admin navigation"
          className={clsx(
            "fixed top-16 left-0 h-[calc(100vh-4rem)]",
            "bg-white dark:bg-gray-800 shadow-xl z-40",
            "transition-all duration-300 ease-in-out",
            "overflow-y-auto overflow-x-hidden",
            {
              "w-64": sidebarOpen,
              "w-20": !sidebarOpen,
              "translate-x-0": mobileOpen,
              "-translate-x-full lg:translate-x-0": !mobileOpen,
            },
          )}
        >
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => (
              <AdminNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                sidebarOpen={sidebarOpen}
                onClick={() => setMobileOpen(false)}
              />
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            {/* Additional Menu Items */}
            <AdminNavItem
              href="/admin/help"
              icon="question-circle"
              label="Help & Support"
              sidebarOpen={sidebarOpen}
              onClick={() => setMobileOpen(false)}
            />

            <AdminNavItem
              href="/admin/logs"
              icon="history"
              label="Activity Logs"
              sidebarOpen={sidebarOpen}
              onClick={() => setMobileOpen(false)}
            />
            <AdminNavItem
              href="/admin/pages"
              icon="pages"
              label="pages"
              sidebarOpen={sidebarOpen}
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar Footer - Only show when expanded */}
            {sidebarOpen && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-shield-alt text-blue-500"></i>
                  <span>v2.0.0</span>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main
          className={clsx("pt-16 transition-all duration-300 min-h-screen", {
            "lg:ml-64": sidebarOpen,
            "lg:ml-20": !sidebarOpen,
          })}
        >
          <div className="p-4 md:p-6">
            {/* Breadcrumb (optional) */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">
                {pathname.split("/").pop() || "dashboard"}
              </span>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

/* ================= NAV ITEM COMPONENT ================= */
function AdminNavItem({ href, icon, label, sidebarOpen, onClick }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center p-3 rounded-lg transition-all duration-200 group",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        {
          "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400":
            isActive,
          "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300":
            !isActive,
        },
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <i
          className={`fas fa-${icon} w-6 text-lg transition-transform group-hover:scale-110`}
          aria-hidden="true"
        ></i>
        {isActive && (
          <span className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </div>

      {sidebarOpen && (
        <>
          <span className="ml-3 text-sm font-medium flex-1">{label}</span>
          {isActive && (
            <i className="fas fa-chevron-right text-xs text-blue-500"></i>
          )}
        </>
      )}
    </Link>
  );
}
