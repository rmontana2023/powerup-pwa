"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import logo from "@/public/assets/logo/powerup-new-logo.png";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Customers", path: "/admin/customer" },
    { name: "Points", path: "/admin/points" },
    { name: "Reports", path: "/admin/reports" },
  ];

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#111] border-r border-gray-800 p-5 transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="PowerUp Logo" width={32} height={32} />
            <span className="text-xl font-semibold">PowerUp</span>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-5 flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#111]">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="PowerUp Logo" width={28} height={28} />
          <span className="text-lg font-semibold">PowerUp Rewards</span>
        </div>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-0 mt-5 md:mt-0">{children}</main>
    </div>
  );
}
