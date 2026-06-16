import { useLanguage } from "@/contexts/LanguageContext";
import { StaffLayout } from "@/components/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Package, Plus, Minus } from "lucide-react";

export default function StaffTruckStock() {
  const { staff, isAuthenticated } = useStaffAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/staff-login");
  }, [isAuthenticated, setLocation]);

  if (!staff) return null;

  return <StaffTruckStockContent staffId={staff.id} />;
}

function StaffTruckStockContent({ staffId }: { staffId: number }) {
  const { t, language } = useLanguage();
  const { data: truckStock, refetch } = trpc.truckStockRouter.getByStaff.useQuery({ staffId });
  const { data: products } = trpc.products.list.useQuery();
  const updateStock = trpc.truckStockRouter.update.useMutation({
    onSuccess: () => { refetch(); toast.success(t("success")); },
  });

  const handleUpdate = (productId: number, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    updateStock.mutate({ staffId, productId, quantity: newQty });
  };

  return (
    <StaffLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{t("truckStock")}</h1>
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "Manage the stock on your delivery truck" : "သင့်ပို့ဆောင်ရေးကားပေါ်ရှိ ကုန်ပစ္စည်းများ စီမံပါ"}
        </p>

        {products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => {
              const stockItem = truckStock?.find(s => s.truckStock.productId === product.id);
              const qty = stockItem?.truckStock.quantity || 0;
              return (
                <Card key={product.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdate(product.id, qty, -1)}
                          disabled={qty <= 0 || updateStock.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center font-bold text-lg">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdate(product.id, qty, 1)}
                          disabled={updateStock.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("noData")}
            </CardContent>
          </Card>
        )}
      </div>
    </StaffLayout>
  );
}
