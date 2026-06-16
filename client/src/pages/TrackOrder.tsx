import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Search, Package, Truck, CheckCircle, XCircle, Clock, Bell, MessageSquare, Award, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  processing: { icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

export default function TrackOrder() {
  const { t, language } = useLanguage();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchNumber, setSearchNumber] = useState("");

  const { data: order, isLoading, error } = trpc.orders.trackByNumber.useQuery(
    { orderNumber: searchNumber },
    { enabled: !!searchNumber }
  );

  // Get notifications for this order
  const { data: notifications } = trpc.notifications.getByOrder.useQuery(
    { orderId: order?.id || 0 },
    { enabled: !!order?.id }
  );

  // Get loyalty points for the customer
  const { data: loyaltyData } = trpc.loyalty.getByPhone.useQuery(
    { phone: order?.customerPhone || "" },
    { enabled: !!order?.customerPhone }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchNumber(orderNumber.trim());
    }
  };

  const steps = ["pending", "processing", "delivered"] as const;
  const currentStepIndex = order ? steps.indexOf(order.status as any) : -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="container py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("trackOrder")}</h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Enter your order number to check status" : "အခြေအနေစစ်ဆေးရန် အော်ဒါနံပါတ်ထည့်ပါ"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={language === "en" ? "Enter order number (e.g., ORD-...)" : "အော်ဒါနံပါတ်ထည့်ပါ"}
            className="flex-1"
          />
          <Button type="submit" className="gap-1">
            <Search className="h-4 w-4" />
            {t("search")}
          </Button>
        </form>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
        )}

        {error && searchNumber && (
          <Card>
            <CardContent className="py-8 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <p className="font-medium">
                {language === "en" ? "Order not found" : "အော်ဒါ ရှာမတွေ့ပါ"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "en" ? "Please check the order number and try again" : "အော်ဒါနံပါတ်ကို ပြန်စစ်ဆေးပြီး ထပ်ကြိုးစားပါ"}
              </p>
            </CardContent>
          </Card>
        )}

        {order && (
          <>
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">{t("orderNumber")}</p>
                  <p className="font-mono font-bold text-lg">{order.orderNumber}</p>
                  <p className="text-sm mt-1">{order.customerName}</p>
                </div>

                {/* Status progress */}
                {order.status !== "cancelled" ? (
                  <div className="flex items-center justify-between mb-6 px-4">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const config = statusConfig[step];
                      const Icon = config.icon;
                      return (
                        <div key={step} className="flex flex-col items-center gap-1 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                            {t(step)}
                          </span>
                          {index < steps.length - 1 && (
                            <div className={`absolute top-5 left-full w-12 sm:w-16 h-0.5 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                    <p className="font-medium text-destructive">{t("cancelled")}</p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("total")}</span>
                    <span className="font-medium">{Number(order.totalAmount).toLocaleString()} Ks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("date")}</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points Card */}
            {loyaltyData && (
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "Your Loyalty Points" : "သင့် Loyalty Points"}
                    </h3>
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800 text-xs">
                      {loyaltyData.tier}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-primary">{loyaltyData.availablePoints}</p>
                      <p className="text-xs text-muted-foreground">{language === "en" ? "Available" : "ကျန်ရှိ"}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">{loyaltyData.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">{language === "en" ? "Total Earned" : "စုစုပေါင်း"}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">{loyaltyData.redeemedPoints}</p>
                      <p className="text-xs text-muted-foreground">{language === "en" ? "Redeemed" : "အသုံးပြု"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    <Star className="h-3 w-3 inline mr-1" />
                    {language === "en" ? "Earn points with every delivered order!" : "Order deliver ပြီးတိုင်း points ရရှိပါမည်!"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notification History */}
            {notifications && notifications.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "Notifications" : "အကြောင်းကြားချက်များ"}
                    </h3>
                    <Badge variant="secondary" className="text-xs">{notifications.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="mt-0.5">
                          <MessageSquare className="h-4 w-4 text-primary/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
