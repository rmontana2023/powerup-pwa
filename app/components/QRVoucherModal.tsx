"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";

interface QRVoucherModalProps {
  open: boolean;
  onClose: () => void;
  voucher: { code: string; amount: number; expiresAt: Date } | null;
  userName?: string;
  redeemTimer: number;
}

export default function QRVoucherModal({
  open,
  onClose,
  voucher,
  userName,
  redeemTimer,
}: QRVoucherModalProps) {
  console.log("🚀 ~ QRVoucherModal ~ userName:", userName);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open || !voucher) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-lg z-[60]">
      {/* Blurred QR background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-lg">
        <QRCodeSVG value={voucher.code} size={300} />
      </div>

      {/* Foreground Card */}
      <div
        ref={modalRef}
        className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-80 text-center border border-orange-100"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User name */}
        {/* {userName && <p className="text-lg font-semibold text-orange-600 mb-2">name: {userName}</p>} */}

        {/* QR */}
        <div
          id="voucherQRContainer"
          className="relative z-10 flex flex-col items-center justify-center mb-3 bg-white p-3 rounded-lg shadow"
        >
          <QRCodeSVG value={voucher.code} size={180} bgColor="#fff" fgColor="#000" />
          <p className="text-xs mt-2 font-medium text-gray-600">{voucher.code}</p>
        </div>

        {/* Voucher details */}
        <p className="text-xs text-gray-600 mb-1">Voucher Code: {voucher.code}</p>
        <p className="text-sm font-medium text-gray-700">
          Amount: ₱ {voucher.amount ? voucher.amount : "N/A"}
        </p>
        <p className="text-xs text-gray-500">
          Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
        </p>
        <p className="text-sm font-semibold text-orange-600 mt-2">Expires in: {redeemTimer}s</p>

        {/* Warning */}
        <p className="text-xs text-red-600 font-semibold mt-4 px-2">
          ⚠️ Screenshots will not be entertained by the cashier.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-5 z-10">
          <button
            onClick={async () => {
              const qrElement = document.getElementById("voucherQRContainer");
              if (!qrElement) return;

              try {
                const dataUrl = await htmlToImage.toPng(qrElement);
                const link = document.createElement("a");
                link.download = `${voucher.code}.png`;
                link.href = dataUrl;
                link.click();
              } catch (error) {
                console.error("Error downloading QR:", error);
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg shadow transition"
          >
            Download
          </button>

          <button
            onClick={async () => {
              try {
                const shareData = {
                  title: "PowerUp Voucher",
                  text: `Here’s my PowerUp voucher worth ₱${voucher.amount}. Code: ${voucher.code}`,
                  url: window.location.origin,
                };
                if (navigator.share) {
                  await navigator.share(shareData);
                } else {
                  alert("Sharing not supported on this device.");
                }
              } catch (err) {
                console.error("Share failed:", err);
              }
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg shadow transition"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
