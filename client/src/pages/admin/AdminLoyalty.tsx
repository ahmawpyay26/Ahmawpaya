import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Award, Gift, History, Star, Users, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

const tierColors: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-purple-100 text-purple-800",
};

export default function AdminLoyalty() {
  const { language } = useLanguage();
  const { data: accounts, isLoading } = trpc.loyalty.getAll.useQuery();
  const { data: settings } = trpc.settings.getAll.useQuery();
  const utils = trpc.useUtils();

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const { data: history } = trpc.loyalty.getHistory.useQuery(
    { phone: selectedPhone || "" },
    { enabled: !!selectedPhone && historyDialogOpen }
  );

  const addBonusMutation = trpc.loyalty.addBonus.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Bonus points added!" : "Bonus points ထည့်ပြီးပါပြီ!");
      utils.loyalty.getAll.invalidate();
      setBonusDialogOpen(false);
      setBonusPoints("");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Setting updated!" : "Setting ပြင်ဆင်ပြီးပါပြီ!");
      utils.settings.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const pointsPerOrder = settings?.find((s: any) => s.settingKey === "points_per_order")?.settingValue || "10";
  const redemptionRate = settings?.find((s: any) => s.settingKey === "points_redemption_rate")?.settingValue || "100";
  const loyaltyEnabled = settings?.find((s: any) => s.settingKey === "loyalty_enabled")?.settingValue === "true";

  const [editPointsPerOrder, setEditPointsPerOrder] = useState(pointsPerOrder);
  const [editRedemptionRate, setEditRedemptionRate] = useState(redemptionRate);

  const totalMembers = accounts?.length || 0;
  const totalPointsIssued = accounts?.reduce((sum: number, a: any) => sum + a.totalPoints, 0) || 0;

  // Sync settings values when data loads
  useEffect(() => {
    if (settings) {
      const ppo = settings.find((s: any) => s.settingKey === "points_per_order");
      const rr = settings.find((s: any) => s.settingKey === "points_redemption_rate");
      if (ppo) setEditPointsPerOrder(ppo.settingValue);
      if (rr) setEditRedemptionRate(rr.settingValue);
    }
  }, [settings]);

  return (
    <AdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {language === "en" ? "Loyalty Points" : "Loyalty Points"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === "en" ? "Manage customer loyalty program and rewards" : "ဖောက်သည် loyalty program နှင့် rewards စီမံခန့်ခွဲရန်"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "en" ? "Total Members" : "အဖွဲ့ဝင်စုစုပေါင်း"}</p>
              <p className="text-xl font-bold">{totalMembers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "en" ? "Total Points Issued" : "ပေးအပ်ပြီး Points"}</p>
              <p className="text-xl font-bold">{totalPointsIssued}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "en" ? "Points Per Order" : "Order တစ်ခုလျှင် Points"}</p>
              <p className="text-xl font-bold">{pointsPerOrder}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "en" ? "Status" : "အခြေအနေ"}</p>
              <p className="text-xl font-bold">{loyaltyEnabled ? (language === "en" ? "Active" : "ဖွင့်ထား") : (language === "en" ? "Disabled" : "ပိတ်ထား")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === "en" ? "Loyalty Settings" : "Loyalty ဆက်တင်များ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === "en" ? "Points per delivered order" : "Deliver ပြီး order တစ်ခုလျှင် Points"}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={editPointsPerOrder}
                  onChange={(e) => setEditPointsPerOrder(e.target.value)}
                  min="1"
                />
                <Button
                  size="sm"
                  onClick={() => updateSettingMutation.mutate({ key: "points_per_order", value: editPointsPerOrder })}
                  disabled={updateSettingMutation.isPending}
                >
                  {language === "en" ? "Save" : "သိမ်း"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Points for 1000 MMK discount" : "1000 MMK discount အတွက် Points"}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={editRedemptionRate}
                  onChange={(e) => setEditRedemptionRate(e.target.value)}
                  min="1"
                />
                <Button
                  size="sm"
                  onClick={() => updateSettingMutation.mutate({ key: "points_redemption_rate", value: editRedemptionRate })}
                  disabled={updateSettingMutation.isPending}
                >
                  {language === "en" ? "Save" : "သိမ်း"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Loyalty System" : "Loyalty System"}</Label>
              <Button
                variant={loyaltyEnabled ? "default" : "outline"}
                className="w-full"
                onClick={() => updateSettingMutation.mutate({ key: "loyalty_enabled", value: loyaltyEnabled ? "false" : "true" })}
                disabled={updateSettingMutation.isPending}
              >
                {loyaltyEnabled ? (language === "en" ? "Enabled ✓" : "ဖွင့်ထား ✓") : (language === "en" ? "Disabled ✗" : "ပိတ်ထား ✗")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "en" ? "Loyalty Members" : "Loyalty အဖွဲ့ဝင်များ"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === "en" ? "No loyalty members yet" : "Loyalty အဖွဲ့ဝင် မရှိသေးပါ"}</p>
              <p className="text-xs mt-1">{language === "en" ? "Points are earned automatically when orders are delivered" : "Order deliver ပြီးတိုင်း points အလိုအလျောက် ရရှိပါမည်"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">{language === "en" ? "Customer" : "ဖောက်သည်"}</th>
                    <th className="text-left py-3 px-2">{language === "en" ? "Phone" : "ဖုန်း"}</th>
                    <th className="text-center py-3 px-2">{language === "en" ? "Tier" : "အဆင့်"}</th>
                    <th className="text-right py-3 px-2">{language === "en" ? "Total" : "စုစုပေါင်း"}</th>
                    <th className="text-right py-3 px-2">{language === "en" ? "Available" : "ကျန်ရှိ"}</th>
                    <th className="text-right py-3 px-2">{language === "en" ? "Redeemed" : "အသုံးပြု"}</th>
                    <th className="text-center py-3 px-2">{language === "en" ? "Actions" : "လုပ်ဆောင်"}</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account: any) => (
                    <tr key={account.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{account.customerName || "-"}</td>
                      <td className="py-3 px-2">{account.customerPhone}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={tierColors[account.tier] || "bg-gray-100"}>
                          {account.tier}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono">{account.totalPoints}</td>
                      <td className="py-3 px-2 text-right font-mono text-green-600">{account.availablePoints}</td>
                      <td className="py-3 px-2 text-right font-mono text-orange-600">{account.redeemedPoints}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPhone(account.customerPhone);
                              setHistoryDialogOpen(true);
                            }}
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPhone(account.customerPhone);
                              setBonusDialogOpen(true);
                            }}
                          >
                            <Gift className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bonus Points Dialog */}
      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "en" ? "Add Bonus Points" : "Bonus Points ထည့်ရန်"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === "en" ? "Phone" : "ဖုန်းနံပါတ်"}</Label>
              <Input value={selectedPhone || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Bonus Points" : "Bonus Points"}</Label>
              <Input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                placeholder="e.g. 50"
                min="1"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (selectedPhone && bonusPoints) {
                  addBonusMutation.mutate({ phone: selectedPhone, points: parseInt(bonusPoints) });
                }
              }}
              disabled={addBonusMutation.isPending || !bonusPoints}
            >
              {addBonusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {language === "en" ? "Add Bonus" : "Bonus ထည့်ရန်"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === "en" ? "Points History" : "Points မှတ်တမ်း"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {history && history.length > 0 ? (
              history.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-mono font-bold ${tx.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.points > 0 ? "+" : ""}{tx.points}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {language === "en" ? "No history yet" : "မှတ်တမ်း မရှိသေးပါ"}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}
