import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Save, Loader2, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminSettings() {
  const { language } = useLanguage();
  const { data: settings, isLoading, refetch } = trpc.settings.getAll.useQuery();
  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Setting saved successfully" : "ဆက်တင်ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error saving setting");
    },
  });

  const [moq, setMoq] = useState("5");
  const [moqSaved, setMoqSaved] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const changePassword = trpc.adminPassword.change.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Password changed successfully!" : "Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message || (language === "en" ? "Failed to change password" : "Password ပြောင်းလဲမရပါ"));
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(language === "en" ? "Please fill all fields" : "အားလုံး ဖြည့်ပါ");
      return;
    }
    if (newPassword.length < 6) {
      toast.error(language === "en" ? "New password must be at least 6 characters" : "Password အသစ်မှာ အနည်းဆုံး ဆ လုံး ရှိရပါမည်");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(language === "en" ? "New passwords do not match" : "Password အသစ် မတူညီပါ");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  // Load current MOQ from settings
  useEffect(() => {
    if (settings) {
      const moqSetting = settings.find(s => s.settingKey === "min_order_quantity");
      if (moqSetting) {
        setMoq(moqSetting.settingValue);
      }
    }
  }, [settings]);

  const handleSaveMoq = () => {
    const value = parseInt(moq);
    if (isNaN(value) || value < 1) {
      toast.error(language === "en" ? "MOQ must be at least 1" : "MOQ သည် အနည်းဆုံး ၁ ဖြစ်ရပါမည်");
      return;
    }
    setMoqSaved(false);
    updateSetting.mutate({ key: "min_order_quantity", value: String(value) }, {
      onSuccess: () => {
        setMoqSaved(true);
        setTimeout(() => setMoqSaved(false), 3000);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            {language === "en" ? "System Settings" : "စနစ်ဆက်တင်များ"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en" 
              ? "Configure system-wide settings for your water delivery business" 
              : "သင့်ရေပို့ဆောင်ရေးလုပ်ငန်းအတွက် စနစ်ဆက်တင်များ ပြင်ဆင်ပါ"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Minimum Order Quantity (MOQ) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "en" ? "Minimum Order Quantity (MOQ)" : "အနည်းဆုံး မှာယူရမည့်အရေအတွက် (MOQ)"}
                </CardTitle>
                <CardDescription>
                  {language === "en" 
                    ? "Set the minimum number of items a customer must order per product. This applies to all products on the public ordering screen." 
                    : "ဖောက်သည်တစ်ဦးသည် ထုတ်ကုန်တစ်ခုလျှင် အနည်းဆုံးမှာယူရမည့် အရေအတွက်ကို သတ်မှတ်ပါ။ ၎င်းသည် public ordering screen ရှိ ထုတ်ကုန်အားလုံးတွင် သက်ရောက်ပါသည်။"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1 max-w-xs">
                    <Label htmlFor="moq" className="text-sm font-medium">
                      {language === "en" ? "Minimum Quantity per Item" : "ပစ္စည်းတစ်ခုလျှင် အနည်းဆုံးအရေအတွက်"}
                    </Label>
                    <div className="mt-1.5 relative">
                      <Input
                        id="moq"
                        type="number"
                        min="1"
                        max="1000"
                        value={moq}
                        onChange={(e) => setMoq(e.target.value)}
                        className="h-11 text-lg font-medium"
                        placeholder="5"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {language === "en" 
                        ? `Current: ${moq} bottles per item. Customers cannot order less than this.` 
                        : `လက်ရှိ: ပစ္စည်းတစ်ခုလျှင် ${moq} ဘူး။ ဖောက်သည်များ ဤအရေအတွက်ထက် နည်းပြီး မှာယူ၍ မရပါ။`}
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveMoq}
                    disabled={updateSetting.isPending}
                    className="h-11 gap-2"
                  >
                    {updateSetting.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : moqSaved ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {moqSaved 
                      ? (language === "en" ? "Saved!" : "သိမ်းပြီး!") 
                      : (language === "en" ? "Save" : "သိမ်းမည်")}
                  </Button>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">
                        {language === "en" ? "How it works:" : "အလုပ်လုပ်ပုံ:"}
                      </p>
                      <ul className="mt-1 space-y-1 list-disc list-inside text-xs">
                        <li>
                          {language === "en" 
                            ? `Customers must order at least ${moq} of each product they select` 
                            : `ဖောက်သည်များသည် ရွေးချယ်သော ထုတ်ကုန်တစ်ခုစီကို အနည်းဆုံး ${moq} ခု မှာယူရပါမည်`}
                        </li>
                        <li>
                          {language === "en" 
                            ? "The quantity field on the public order page will enforce this minimum" 
                            : "Public order page ရှိ quantity field သည် ဤ minimum ကို enforce လုပ်ပါမည်"}
                        </li>
                        <li>
                          {language === "en" 
                            ? "Changes take effect immediately on the public ordering screen" 
                            : "ပြောင်းလဲမှုများသည် public ordering screen တွင် ချက်ချင်း အကျိုးသက်ရောက်ပါမည်"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {language === "en" ? "Change Admin Password" : "Admin Password ပြောင်းလဲရန်"}
                </CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Update your admin login password. Minimum 6 characters required."
                    : "Admin login password ကို ပြောင်းလဲပါ။ အနည်းဆုံး စာလုံး ၆ လုံး လိုအပ်ပါသည်။"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Current Password" : "လက်ရှိ Password"}</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                      >
                        {showCurrentPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "New Password" : "Password အသစ်"}</Label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowNewPw(!showNewPw)}
                      >
                        {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Confirm New Password" : "Password အသစ် ထပ်ရိုက်ပါ"}</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="gap-2"
                  >
                    {changePassword.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {language === "en" ? "Change Password" : "Password ပြောင်းမည်"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Settings Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "en" ? "All Settings" : "ဆက်တင်အားလုံး"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          {language === "en" ? "Setting" : "ဆက်တင်"}
                        </th>
                        <th className="text-left p-3 font-medium">
                          {language === "en" ? "Value" : "တန်ဖိုး"}
                        </th>
                        <th className="text-left p-3 font-medium">
                          {language === "en" ? "Description" : "ရှင်းလင်းချက်"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings?.map((setting) => (
                        <tr key={setting.id} className="border-t">
                          <td className="p-3 font-mono text-xs">{setting.settingKey}</td>
                          <td className="p-3 font-medium">{setting.settingValue}</td>
                          <td className="p-3 text-muted-foreground text-xs">{setting.description || "-"}</td>
                        </tr>
                      ))}
                      {(!settings || settings.length === 0) && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-muted-foreground">
                            {language === "en" ? "No settings configured" : "ဆက်တင်များ မရှိသေးပါ"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
