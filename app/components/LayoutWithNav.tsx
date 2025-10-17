"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Gift, Home, List, User, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface LayoutWithNavProps {
  children: React.ReactNode;
  openNavQR?: () => void; // 👈 optional callback prop
}

interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
  displayCode?: string;
  expiresAt?: Date | string;
}
export default function LayoutWithNav({ children, openNavQR }: LayoutWithNavProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // QR modal states
  const [qrOpen, setQrOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [redeemTimer, setRedeemTimer] = useState(0);

  // ⏱️ QR countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrOpen && redeemTimer > 0) {
      timer = setInterval(() => setRedeemTimer((t) => t - 1), 1000);
    }
    if (redeemTimer === 0 && qrOpen) {
      setQrOpen(false);
    }
    return () => clearInterval(timer);
  }, [qrOpen, redeemTimer]);

  // 🔹 Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Invalid user data in localStorage:", err);
        }
      }
    }
  }, []);

  // 🧩 Open QR Modal using user’s QR Code
  //   const handleOpenNavQR = () => {
  //     if (!user) {
  //       alert("No user data found. Please log in again.");
  //       router.push("/login");
  //       return;
  //     }

  //     // You can customize what data to show in QR:
  //     const qrValue = user.qrCode || user._id || user.email || "NO-QR";

  //     setQrOpen(true);
  //     setRedeemTimer(30);

  //     // Save QR info to state (for display details)
  //     setUser((prev: any) => ({
  //       ...prev,
  //       displayCode: qrValue,
  //       expiresAt: new Date(Date.now() + 1000 * 30),
  //     }));
  //   };

  return (
    <>
      <main className="min-h-screen pb-20">{children}</main>

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-semibold text-gray-800">Settings</p>
              <button onClick={() => setSidebarOpen(false)}>✖️</button>
            </div>
            <div className="p-4">
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* QR Modal */}
      {qrOpen && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center relative">
            <button
              onClick={() => setQrOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My PowerUp QR</h3>
            <div className="flex justify-center mb-3">
              <QRCodeSVG
                value={user.qrCode || user._id || "NO-QR"}
                size={160}
                bgColor="#fff"
                fgColor="#000"
              />
            </div>
            <p className="text-xs text-gray-600 mb-1">Voucher Code: {user.qrCode}</p>
            <p className="text-xs text-gray-500">
              Expires:{" "}
              {user.expiresAt ? new Date(user.expiresAt).toLocaleTimeString() : "30 seconds"}
            </p>
            <p className="text-sm font-medium text-gray-700 mt-2">Expires in: {redeemTimer} sec</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center relative h-16">
          <div className="flex space-x-6">
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
          </div>

          {/* Floating QR Button */}
          <button
            onClick={openNavQR}
            className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-orange-600 transition"
          >
            <QrCode className="w-7 h-7" />
          </button>

          <div className="flex space-x-6">
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
        </div>
      </nav>
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
