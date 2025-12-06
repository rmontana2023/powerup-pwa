"use client";
import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Gift, Home, List, User, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import SlideToRevealQR from "./SlideRevealQR";

const sidebarMenu = [
  {
    title: "MEMBER PROFILE",
    subItems: [
      { title: "Personal Details", href: "/profile/personal" },
      { title: "Additional Information", href: "/profile/additional" },
    ],
  },
  {
    title: "HELP CENTER",
    subItems: [
      {
        title: "How to generate my Rewards and Redeem Points History?",
        href: "/help/rewards-history",
      },
      { title: "About Us", href: "/help/about-us" },
      { title: "Terms and Conditions", href: "/help/terms" },
      { title: "Policy", href: "/help/policy" },
    ],
  },
  {
    title: "SETTINGS",
    subItems: [
      { title: "Change Mobile Number", href: "/settings/change-mobile" },
      { title: "Change Email Address", href: "/settings/change-email" },
      { title: "Change Password", href: "/settings/change-password" },
    ],
  },
];

export default function LayoutWithNav({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: any;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [showSlide, setShowSlide] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [redeemTimer, setRedeemTimer] = useState(0);
  const [sliderProgress, setSliderProgress] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Timer countdown for reveal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (revealed && redeemTimer > 0) {
      timer = setInterval(() => setRedeemTimer((t) => t - 1), 1000);
    }
    if (redeemTimer === 0 && revealed) {
      setShowSlide(false);
      setRevealed(false);
    }
    return () => clearInterval(timer);
  }, [revealed, redeemTimer]);

  const handleStart = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX;
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!dragging || !sliderRef.current) return;
    const diff = e.clientX - startX.current;
    const width = sliderRef.current.offsetWidth;
    const progress = Math.min(100, Math.max(0, (diff / width) * 100));
    setSliderProgress(progress);
  };

  const handleEnd = () => {
    setDragging(false);
    if (sliderProgress > 80) {
      setRevealed(true);
      setRedeemTimer(30);
    }
    setSliderProgress(0);
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };
  return (
    <>
      {/* Page content */}
      <main className="min-h-screen pb-20 bg-[#0a0a0a] text-[#ededed]">{children}</main>

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-[#111] text-[#ededed] border-l border-[#222] z-50 shadow-lg transition-transform duration-300 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222]">
              <p className="font-semibold text-powerup-500">ACCOUNT</p>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-powerup-500"
              >
                ✖️
              </button>
            </div>

            {/* ⭐ NEW — Customer Info Section */}
            {user && (
              <div
                className="p-4 border-b border-[#222] flex items-center gap-3 hover:bg-[#1a1a1a] transition cursor-pointer"
                onClick={() => {
                  router.push("/profile/personal");
                  setSidebarOpen(false);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-powerup-500 font-bold text-lg">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#fafafa]">
                    {user.name || `${user.firstName} ${user.lastName}` || "Guest User"}
                  </span>
                  <span className="text-xs text-gray-400">{user?.phone || "No number"}</span>
                  {/* QR Code Icon + Code */}
                  {user?.qrCode && (
                    <div className="flex items-center gap-2">
                      {/* QR Code String */}
                      <span className="text-xs text-gray-400 break-all">{user.qrCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="p-4 flex flex-col gap-3">
              {sidebarMenu.map((item) => (
                <div key={item.title}>
                  <button
                    className="w-full flex justify-between items-center px-2 py-2 text-left font-semibold text-gray-300 hover:text-powerup-400 hover:bg-[#1a1a1a] rounded transition"
                    onClick={() => toggleMenu(item.title)}
                  >
                    {item.title}
                    {item.subItems && (
                      <span>
                        {openMenus[item.title] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </span>
                    )}
                  </button>

                  {item.subItems && openMenus[item.title] && (
                    <div className="mt-1 ml-4 flex flex-col gap-1">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.title}
                          onClick={() => {
                            router.push(sub.href);
                            setSidebarOpen(false);
                          }}
                          className="px-2 py-1 text-gray-400 hover:text-powerup-400 hover:bg-[#1a1a1a] rounded text-sm text-left transition"
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("customerId");
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-black font-semibold px-6 py-2 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating QR Button */}
      <button
        onClick={() => {
          setShowSlide(true);
          setRevealed(false);
        }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-powerup-500 hover:bg-powerup-600 text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 border-4 border-[#0a0a0a] transition-all"
      >
        <QrCode className="w-8 h-8" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#222] shadow-lg z-40">
        <div className="flex justify-around items-center h-16">
          <NavItem
            label="Home"
            icon={<Home className="w-6 h-6" />}
            onClick={() => router.push("/dashboard")}
          />
          <NavItem
            label="Transactions"
            icon={<List className="w-6 h-6" />}
            onClick={() => router.push("/transactions")}
          />
          <NavItem
            label="Rewards"
            icon={<Gift className="w-6 h-6" />}
            onClick={() => router.push("/rewards")}
          />
          <NavItem
            label="Account"
            icon={<User className="w-6 h-6" />}
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </nav>

      {/* Slide-to-Reveal QR */}
      {user && <SlideToRevealQR user={user} />}
    </>
  );
}

function NavItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-gray-400 hover:text-powerup-400 transition"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
