import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function StaffLogin() {
  const { t, language } = useLanguage();
  const { login, staff } = useStaffAuth();
  const [, setLocation] = useLocation();
  const staffLoginMutation = trpc.auth.staffLogin.useMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already logged in as staff, redirect
  if (staff) {
    setLocation("/staff");
    return null;
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError(language === "en" ? "Please enter username and password" : "Username နှင့် Password ထည့်ပါ");
      return;
    }
    try {
      const result = await staffLoginMutation.mutateAsync({ username, password });
      login(result);
      setLocation("/staff");
      toast.success(language === "en" ? "Login successful" : "အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ");
    } catch (err: any) {
      setError(err.message || (language === "en" ? "Invalid username or password" : "အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက် မှားနေပါသည်"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex flex-col">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {language === "en" ? "Back" : "နောက်သို့"}
            </Button>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center">
            <img
              src="/manus-storage/amaw_pyay_logo_938ce02a.png"
              alt="အမောပြေ"
              className="w-16 h-16 mx-auto rounded-lg mb-3"
            />
            <h1 className="text-2xl font-bold text-cyan-800">
              {language === "en" ? "Staff Login" : "ဝန်ထမ်း Login"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {language === "en" ? "Login with your staff account" : "ဝန်ထမ်းအကောင့်ဖြင့် ဝင်ရောက်ပါ"}
            </p>
          </div>

          {/* Staff Login Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                {language === "en" ? "Staff Authentication" : "ဝန်ထမ်း အတည်ပြုခြင်း"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Username" : "အသုံးပြုသူအမည်"}</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={language === "en" ? "Enter staff username" : "ဝန်ထမ်း username ထည့်ပါ"}
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Password" : "စကားဝှက်"}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === "en" ? "Enter password" : "စကားဝှက် ထည့်ပါ"}
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={staffLoginMutation.isPending}
                >
                  {staffLoginMutation.isPending
                    ? (language === "en" ? "Logging in..." : "ဝင်ရောက်နေသည်...")
                    : (language === "en" ? "Login" : "ဝင်ရောက်ပါ")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500">
            {language === "en"
              ? "This login is for staff accounts only. Admin uses a separate login."
              : "ဤ Login သည် ဝန်ထမ်းအကောင့်များအတွက်သာ ဖြစ်ပါသည်။"}
          </p>
        </div>
      </div>
    </div>
  );
}
