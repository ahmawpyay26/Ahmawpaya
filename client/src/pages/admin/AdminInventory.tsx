import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Minus, AlertTriangle } from "lucide-react";

export default function AdminInventory() {
  return <AdminInventoryContent />;
}

function AdminInventoryContent() {
  const { t, language } = useLanguage();
  const { data: inventoryItems, refetch } = trpc.inventory.list.useQuery();
  const stockIn = trpc.inventory.stockIn.useMutation({ onSuccess: () => { refetch(); toast.success(t("success")); } });
  const stockOut = trpc.inventory.stockOut.useMutation({ onSuccess: () => { refetch(); toast.success(t("success")); } });

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [dialogType, setDialogType] = useState<"in" | "out">("in");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStockAction = () => {
    if (!selectedProduct || quantity <= 0) return;
    const mutation = dialogType === "in" ? stockIn : stockOut;
    mutation.mutate({ productId: selectedProduct, quantity, note }, {
      onSuccess: () => { setDialogOpen(false); setQuantity(1); setNote(""); }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("inventory")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Track stock levels for all products" : "ထုတ်ကုန်အားလုံး၏ ကုန်ပစ္စည်းပမာဏ ခြေရာခံပါ"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-1"
              onClick={() => { setDialogType("in"); setDialogOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              {t("stockIn")}
            </Button>
            <Button
              variant="outline"
              className="gap-1"
              onClick={() => { setDialogType("out"); setDialogOpen(true); }}
            >
              <Minus className="h-4 w-4" />
              {t("stockOut")}
            </Button>
          </div>
        </div>

        {/* Stock In/Out Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogType === "in" ? t("stockIn") : t("stockOut")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("products")}</Label>
                <Select onValueChange={(val) => setSelectedProduct(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select product" : "ထုတ်ကုန်ရွေးပါ"} />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems?.map((item) => (
                      <SelectItem key={item.product.id} value={String(item.product.id)}>
                        {item.product.name} ({item.product.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("quantity")}</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label>{t("note")}</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={language === "en" ? "Optional note" : "မှတ်ချက် (ရွေးချယ်ခွင့်)"} />
              </div>
              <Button onClick={handleStockAction} className="w-full" disabled={stockIn.isPending || stockOut.isPending}>
                {t("confirm")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("productName")}</th>
                    <th className="text-left p-3 font-medium">{t("bottleType")}</th>
                    <th className="text-left p-3 font-medium">{t("currentStock")}</th>
                    <th className="text-left p-3 font-medium">{t("minStockLevel")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems && inventoryItems.length > 0 ? (
                    inventoryItems.map((item) => {
                      const isLow = item.inventory.currentStock <= item.inventory.minStockLevel;
                      return (
                        <tr key={item.inventory.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 font-medium">{item.product.name}</td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {item.product.type === "20L" ? t("gallon20L") : `${item.product.type}`}
                            </Badge>
                          </td>
                          <td className="p-3 font-bold">{item.inventory.currentStock}</td>
                          <td className="p-3 text-muted-foreground">{item.inventory.minStockLevel}</td>
                          <td className="p-3">
                            {isLow ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {t("lowStock")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {language === "en" ? "In Stock" : "လုံလောက်"}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {language === "en" ? "No inventory items. Add products first." : "ကုန်ပစ္စည်းစာရင်း မရှိပါ။ ထုတ်ကုန်များ ဦးစွာထည့်ပါ။"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
