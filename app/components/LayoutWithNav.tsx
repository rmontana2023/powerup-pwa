"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Gift, Home, List, User, X, ChevronUp, ChevronDown } from "lucide-react";
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
      {
        title: "Account Security (Change Password and Mobile No)",
        href: "/settings/account-security",
      },
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

  // Timer countdown
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

  // Slide handling
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
      <main className="min-h-screen pb-20">{children}</main>
      {/* Sidebar Drawer */}{" "}
      {sidebarOpen && (
        <>
          {" "}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />{" "}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300 overflow-y-auto">
            {" "}
            <div className="flex items-center justify-between p-4 border-b">
              {" "}
              <p className="font-semibold text-gray-800">ACCOUNT</p>{" "}
              <button onClick={() => setSidebarOpen(false)}>✖️</button>{" "}
            </div>{" "}
            <div className="p-4 flex flex-col gap-3">
              {" "}
              {sidebarMenu.map((item) => (
                <div key={item.title}>
                  {" "}
                  <button
                    className="w-full flex justify-between items-center px-2 py-2 text-left font-semibold text-gray-700 hover:bg-gray-200 rounded"
                    onClick={() => toggleMenu(item.title)}
                  >
                    {" "}
                    {item.title}{" "}
                    {item.subItems && (
                      <span>
                        {" "}
                        {openMenus[item.title] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}{" "}
                      </span>
                    )}{" "}
                  </button>{" "}
                  {item.subItems && openMenus[item.title] && (
                    <div className="mt-1 ml-4 flex flex-col gap-1">
                      {" "}
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.title}
                          onClick={() => {
                            router.push(sub.href);
                            setSidebarOpen(false);
                          }}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm text-left"
                        >
                          {" "}
                          {sub.title}{" "}
                        </button>
                      ))}{" "}
                    </div>
                  )}{" "}
                </div>
              ))}{" "}
              {/* Logout */}{" "}
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                {" "}
                Logout{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </>
      )}
      {/* Floating QR Button */}
      {/* QR Button — positioned just above nav */}
      <button
        onClick={() => {
          setShowSlide(true);
          setRevealed(false);
        }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 border-4 border-white"
      >
        <QrCode className="w-8 h-8" />
      </button>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
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
      {showSlide && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white overflow-hidden">
          {/* QR Background — slightly blurred until reveal */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none`}
          >
            <div
              className={`transition-all duration-700 ease-in-out ${
                revealed ? "blur-0 opacity-100" : "blur-2xl opacity-80"
              }`}
            >
              <QRCodeSVG
                value={user?.qrCode || user?._id || "NO-QR"}
                size={400}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* Close Button */}
          <button
            className="absolute top-5 right-5 text-gray-600 hover:text-gray-900 transition z-20"
            onClick={() => {
              setShowSlide(false);
              setRevealed(false);
              setRedeemTimer(0);
            }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Customer Name */}
          <h2 className="absolute top-8 text-2xl font-semibold text-gray-800 z-20">
            {user?.name || "Customer"}
          </h2>

          {/* Slide control — only before reveal */}
          {!revealed && (
            <div className="absolute bottom-32 w-80 text-center z-20">
              <p className="text-gray-700 font-medium mb-3 text-lg">Slide to Reveal QR</p>
              <div
                ref={sliderRef}
                className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden touch-none select-none cursor-pointer"
                onPointerDown={handleStart}
                onPointerMove={handleMove}
                onPointerUp={handleEnd}
                onPointerLeave={handleEnd}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${sliderProgress}%` }}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700 font-semibold">
                  Slide →
                </span>
              </div>
            </div>
          )}

          {/* Timer when revealed */}
          {revealed && (
            <div className="absolute bottom-16 text-center z-20">
              <p className="text-5xl font-bold text-orange-500 drop-shadow-sm">{redeemTimer}s</p>
              <p className="text-sm text-gray-600">QR will close automatically</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function NavItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-500 transition"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
