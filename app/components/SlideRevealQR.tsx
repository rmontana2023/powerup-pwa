"use client";
import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface SlideToRevealQRProps {
  user: { name?: string; qrCode?: string; _id?: string };
}

export default function SlideToRevealQR({ user }: SlideToRevealQRProps) {
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

  return (
    <>
      {/* Floating QR Button */}
      <button
        onClick={() => {
          setShowSlide(true);
          setRevealed(false);
        }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 border-4 border-white"
      >
        <QRCodeSVG value={user?.qrCode || user?._id || "NO-QR"} size={32} />
      </button>

      {/* Slide-to-Reveal QR */}
      {showSlide && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-[60] bg-white overflow-hidden">
          {/* QR Background (blurred) */}
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none">
            <div
              className={`transition-all duration-700 ease-in-out ${
                revealed ? "blur-0 opacity-100" : "blur-2xl opacity-70"
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
          <h2 className="absolute top-8 text-2xl font-semibold text-gray-800 z-20">{user?.name}</h2>

          {/* Slide control */}
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
