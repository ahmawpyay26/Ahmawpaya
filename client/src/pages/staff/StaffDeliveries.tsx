import { useLanguage } from "@/contexts/LanguageContext";
import { StaffLayout } from "@/components/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";
import { MapPin, Phone } from "lucide-react";

export default function StaffDeliveries() {
  const { staff, isAuthenticated } = useStaffAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/staff-login");
  }, [isAuthenticated, setLocation]);

  if (!staff) return null;

  return <StaffDeliveriesContent staffId={staff.id} />;
}

function StaffDeliveriesContent({ staffId }: { staffId: number }) {
  const { t, language } = useLanguage();
  const { data: deliveries, refetch } = trpc.deliveries.myDeliveries.useQuery({ staffId });
  const updateStatus = trpc.deliveries.updateStatus.useMutation({
    onSuccess: () => { refetch(); toast.success(t("success")); },
  });

  const statusColors: Record<string, string> = {
    assigned: "bg-yellow-100 text-yellow-800",
    in_transit: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <StaffLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{t("deliveries")}</h1>

        {deliveries && deliveries.length > 0 ? (
          <div className="space-y-3">
            {deliveries.map((item) => (
              <Card key={item.delivery.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">Order #{item.order.orderNumber}</p>
                      <Badge variant="secondary" className={statusColors[item.delivery.status] || ""}>
                        {item.delivery.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.delivery.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.order.customerAddress && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{item.order.customerAddress}</span>
                    </div>
                  )}

                  {item.delivery.status !== "delivered" && item.delivery.status !== "failed" && (
                    <div className="flex gap-2 mt-3">
                      {item.delivery.status === "assigned" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ id: item.delivery.id, status: "in_transit" })}
                          disabled={updateStatus.isPending}
                        >
                          {language === "en" ? "Start Delivery" : "ပို့ဆောင်မှုစတင်"}
                        </Button>
                      )}
                      {item.delivery.status === "in_transit" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: item.delivery.id, status: "delivered" })}
                            disabled={updateStatus.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {language === "en" ? "Mark Delivered" : "ပို့ပြီးမှတ်ပါ"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus.mutate({ id: item.delivery.id, status: "failed" })}
                            disabled={updateStatus.isPending}
                          >
                            {language === "en" ? "Failed" : "မအောင်မြင်"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === "en" ? "No deliveries assigned yet" : "ပို့ဆောင်မှု မရှိသေးပါ"}
            </CardContent>
          </Card>
        )}
      </div>
    </StaffLayout>
  );
}
