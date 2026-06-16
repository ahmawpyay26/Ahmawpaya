import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Truck,
  Boxes,
  LogOut,
  ClipboardList,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/staff", icon: LayoutDashboard, labelEn: "Dashboard", labelMm: "ပင်မ" },
  { path: "/staff/orders", icon: ClipboardList, labelEn: "Orders", labelMm: "အော်ဒါများ" },
  { path: "/staff/invoices", icon: FileText, labelEn: "Invoices", labelMm: "ပြေစာများ" },
  { path: "/staff/expenses", icon: FileText, labelEn: "Expenses", labelMm: "အခကြေးများ" },
  { path: "/staff/deliveries", icon: Truck, labelEn: "Deliveries", labelMm: "ပို့ဆောင်မှု" },
  { path: "/staff/truck-stock", icon: Boxes, labelEn: "Truck Stock", labelMm: "ကားပေါ်ပစ္စည်း" },
];

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { staff, logout, loading: isLoading } = useStaffAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !staff) {
      navigate("/staff-login");
    }
  }, [isLoading, staff, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <img
              src="/manus-storage/amaw_pyay_logo_938ce02a.png"
              alt="Logo"
              className="w-8 h-8 rounded"
            />
            <span className="font-semibold text-cyan-800 text-sm truncate max-w-[120px]">
              {staff.fullName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">
                {language === "en" ? "Logout" : "ထွက်ရန်"}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-white px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {language === "en" ? item.labelEn : item.labelMm}
                  </button>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r bg-white min-h-[calc(100vh-3.5rem)]">
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {language === "en" ? item.labelEn : item.labelMm}
                  </button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
