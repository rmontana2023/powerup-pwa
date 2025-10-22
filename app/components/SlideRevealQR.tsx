"use client";
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideToRevealQRProps {
  name: string;
  qrValue: string;
  onClose: () => void;
}

export default function SlideToRevealQR({ name, qrValue, onClose }: SlideToRevealQRProps) {
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (revealed && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, revealed]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Blurred QR background */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div
            className={`transition-all duration-500 ${revealed ? "blur-0" : "blur-xl opacity-60"}`}
          >
            <QRCodeSVG value={qrValue} size={300} />
          </div>
        </div>

        {/* Overlay content */}
        <div className="relative flex flex-col items-center text-center space-y-6 z-10">
          {/* Header */}
          <div className="flex justify-between items-center w-full px-6">
            <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition">
              <X size={28} />
            </button>
          </div>

          {/* Timer */}
          {revealed ? (
            <div className="text-orange-500 text-6xl font-bold">{timeLeft}</div>
          ) : (
            <div className="text-orange-500 text-4xl font-semibold">Slide to Reveal</div>
          )}

          {/* Slide to Reveal Button */}
          {!revealed && (
            <motion.div
              className="w-72 bg-gray-200 rounded-full h-14 overflow-hidden cursor-pointer"
              whileTap={{ scale: 0.98 }}
              onClick={() => setRevealed(true)}
            >
              <motion.div
                className="h-full bg-orange-500 text-white font-bold flex items-center justify-center rounded-full"
                initial={{ width: "30%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              >
                Reveal QR
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
