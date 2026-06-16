import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Plus, Pencil, Check, X, Save, DollarSign, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminProducts() {
  return <AdminProductsContent />;
}

function AdminProductsContent() {
  const { t, language } = useLanguage();
  const { data: products, refetch } = trpc.products.listAdmin.useQuery();
  const createProduct = trpc.products.create.useMutation({ onSuccess: () => { refetch(); toast.success(t("success")); setDialogOpen(false); } });
  const updatePrice = trpc.products.updatePrice.useMutation({ onSuccess: () => { refetch(); toast.success(language === "en" ? "Price updated!" : "ဈေးနှုန်း ပြောင်းလဲပြီးပါပြီ!"); setEditingId(null); } });
  const bulkUpdatePrices = trpc.products.bulkUpdatePrices.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === "en" ? "All prices saved! Instantly reflected on public & staff screens." : "ဈေးနှုန်းအားလုံး သိမ်းဆည်းပြီးပါပြီ! Public နှင့် Staff screen များတွင် ချက်ချင်း ပြသပါမည်။");
      setPriceChanged(false);
    },
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === "en" ? "Product deleted!" : "ထုတ်ကုန် ဖျက်ပြီးပါပြီ!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success(language === "en" ? "Product updated!" : "ထုတ်ကုန် ပြင်ဆင်ပြီးပါပြီ!");
      setEditDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const initInventory = trpc.inventory.initProduct.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", nameMyanmar: "", type: "20L" as any, unitPrice: "",
    shellPrice: "", waterPrice: "", description: "", initialStock: "0",
  });
  const [editForm, setEditForm] = useState({
    name: "", nameMyanmar: "", type: "20L" as any, unitPrice: "",
    shellPrice: "", waterPrice: "", description: "",
  });

  // Price Management state
  const [priceMap, setPriceMap] = useState<Record<number, string>>({});
  const [priceChanged, setPriceChanged] = useState(false);

  // Initialize price map when products load
  useEffect(() => {
    if (products && Object.keys(priceMap).length === 0) {
      const map: Record<number, string> = {};
      products.forEach(p => { map[p.id] = String(p.unitPrice); });
      setPriceMap(map);
    }
  }, [products]);

  // Sync price map when products refetch (after save)
  useEffect(() => {
    if (products && !priceChanged) {
      const map: Record<number, string> = {};
      products.forEach(p => { map[p.id] = String(p.unitPrice); });
      setPriceMap(map);
    }
  }, [products, priceChanged]);

  const handlePriceChange = (productId: number, value: string) => {
    setPriceMap(prev => ({ ...prev, [productId]: value }));
    setPriceChanged(true);
  };

  const handleSaveAllPrices = () => {
    if (!products) return;
    const prices = products
      .filter(p => priceMap[p.id] && priceMap[p.id] !== String(p.unitPrice))
      .map(p => ({ id: p.id, unitPrice: priceMap[p.id] }));
    
    if (prices.length === 0) {
      toast.info(language === "en" ? "No price changes to save" : "ပြောင်းလဲမှု မရှိပါ");
      return;
    }

    // Validate all prices
    for (const item of prices) {
      if (!item.unitPrice || isNaN(Number(item.unitPrice)) || Number(item.unitPrice) <= 0) {
        toast.error(language === "en" ? "All prices must be valid positive numbers" : "ဈေးနှုန်းအားလုံး မှန်ကန်သော ကိန်းဂဏန်းများ ဖြစ်ရပါမည်");
        return;
      }
    }

    bulkUpdatePrices.mutate({ prices });
  };

  const handleCreate = async () => {
    if (!form.name || !form.unitPrice) {
      toast.error(language === "en" ? "Name and price are required" : "အမည်နှင့် ဈေးနှုန်း လိုအပ်ပါသည်");
      return;
    }
    await createProduct.mutateAsync({
      name: form.name,
      nameMyanmar: form.nameMyanmar || undefined,
      type: form.type,
      unitPrice: form.unitPrice,
      shellPrice: form.shellPrice || undefined,
      waterPrice: form.waterPrice || undefined,
      description: form.description || undefined,
    });
    const updatedProducts = await refetch();
    const newProduct = updatedProducts.data?.find(p => p.name === form.name);
    if (newProduct) {
      await initInventory.mutateAsync({ productId: newProduct.id, stock: parseInt(form.initialStock) || 0 });
    }
    setForm({ name: "", nameMyanmar: "", type: "20L", unitPrice: "", shellPrice: "", waterPrice: "", description: "", initialStock: "0" });
  };

  const handleEditProduct = () => {
    if (!editingProduct || !editForm.name || !editForm.unitPrice) {
      toast.error(language === "en" ? "Name and price are required" : "အမည်နှင့် ဈေးနှုန်း လိုအပ်ပါသည်");
      return;
    }
    updateProductMutation.mutate({
      id: editingProduct.id,
      name: editForm.name,
      nameMyanmar: editForm.nameMyanmar || undefined,
      type: editForm.type,
      unitPrice: editForm.unitPrice,
      shellPrice: editForm.shellPrice || undefined,
      waterPrice: editForm.waterPrice || undefined,
      description: editForm.description || undefined,
    });
  };

  const startEditPrice = (product: any) => {
    setEditingId(product.id);
    setEditPrice(product.unitPrice);
  };

  const savePrice = (productId: number) => {
    if (!editPrice || isNaN(Number(editPrice)) || Number(editPrice) <= 0) {
      toast.error(language === "en" ? "Please enter a valid price" : "ဈေးနှုန်း မှန်ကန်စွာ ထည့်ပါ");
      return;
    }
    updatePrice.mutate({ id: productId, unitPrice: editPrice });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("products")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Manage products & dynamically change prices (reflects instantly on public screen)" : "ထုတ်ကုန်များနှင့် ဈေးနှုန်းများ စီမံပါ (Public screen တွင် ချက်ချင်း ပြောင်းလဲပါမည်)"}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            {language === "en" ? "Add Product" : "ထုတ်ကုန်ထည့်ပါ"}
          </Button>
        </div>

        {/* ===== PRODUCT & PRICE SETTINGS SECTION ===== */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              {language === "en" ? "Product & Price Settings" : "ထုတ်ကုန်နှင့် ဈေးနှုန်း သတ်မှတ်ချက်များ"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === "en" 
                ? "Edit prices below and click \"Save Prices\" to update all screens instantly." 
                : "အောက်တွင် ဈေးနှုန်းများ ပြင်ဆင်ပြီး \"ဈေးနှုန်းများသိမ်းဆည်းရန်\" ခလုတ်ကို နှိပ်ပါ။"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-background rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {language === "mm" && product.nameMyanmar ? product.nameMyanmar : product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{product.type}</Badge>
                        {" "}
                        {language === "en" ? "Current:" : "လက်ရှိ:"}{" "}
                        <span className="font-medium">{Number(product.unitPrice).toLocaleString()} Ks</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        {language === "en" ? "Price (Ks)" : "ဈေးနှုန်း (ကျပ်)"}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={priceMap[product.id] || ""}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        className="h-9 w-32 text-right font-medium"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">{t("noData")}</p>
              )}
            </div>

            {/* Save All Prices Button */}
            {products && products.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                {priceChanged && (
                  <p className="text-xs text-amber-600">
                    {language === "en" ? "⚠ You have unsaved price changes" : "⚠ သိမ်းဆည်းမထားသော ဈေးနှုန်းပြောင်းလဲမှုများ ရှိနေပါသည်"}
                  </p>
                )}
                <Button
                  onClick={handleSaveAllPrices}
                  disabled={!priceChanged || bulkUpdatePrices.isPending}
                  className="gap-2 ml-auto"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  {bulkUpdatePrices.isPending
                    ? (language === "en" ? "Saving..." : "သိမ်းဆည်းနေသည်...")
                    : (language === "en" ? "Save Prices" : "ဈေးနှုန်းများသိမ်းဆည်းရန်")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === "en" ? "Add New Product" : "ထုတ်ကုန်အသစ်ထည့်ပါ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{language === "en" ? "Name (English)" : "အမည် (English)"}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>{language === "en" ? "Name (Myanmar)" : "အမည် (မြန်မာ)"}</Label>
                <Input value={form.nameMyanmar} onChange={(e) => setForm({ ...form, nameMyanmar: e.target.value })} />
              </div>
              <div>
                <Label>{t("bottleType")}</Label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20L">20L Gallon</SelectItem>
                    <SelectItem value="1L">1L Bottle</SelectItem>
                    <SelectItem value="0.5L">0.5L Bottle</SelectItem>
                    <SelectItem value="0.35L">0.35L Bottle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("unitPrice")} (Ks)</Label>
                <Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              </div>
              {form.type === "20L" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{language === "en" ? "Shell Price" : "ဗူးခွန်"}</Label>
                    <Input type="number" value={form.shellPrice} onChange={(e) => setForm({ ...form, shellPrice: e.target.value })} />
                  </div>
                  <div>
                    <Label>{language === "en" ? "Water Price" : "ရေဈေး"}</Label>
                    <Input type="number" value={form.waterPrice} onChange={(e) => setForm({ ...form, waterPrice: e.target.value })} />
                  </div>
                </div>
              )}
              <div>
                <Label>{language === "en" ? "Initial Stock" : "ကနဦးပမာဏ"}</Label>
                <Input type="number" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createProduct.isPending}>
                {createProduct.isPending ? t("loading") : t("create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === "en" ? "Edit Product" : "ထုတ်ကုန် ပြင်ဆင်ပါ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{language === "en" ? "Name (English)" : "အမည် (English)"}</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <Label>{language === "en" ? "Name (Myanmar)" : "အမည် (မြန်မာ)"}</Label>
                <Input value={editForm.nameMyanmar} onChange={(e) => setEditForm({ ...editForm, nameMyanmar: e.target.value })} />
              </div>
              <div>
                <Label>{t("bottleType")}</Label>
                <Select value={editForm.type} onValueChange={(val) => setEditForm({ ...editForm, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20L">20L Gallon</SelectItem>
                    <SelectItem value="1L">1L Bottle</SelectItem>
                    <SelectItem value="0.5L">0.5L Bottle</SelectItem>
                    <SelectItem value="0.35L">0.35L Bottle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("unitPrice")} (Ks)</Label>
                <Input type="number" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })} />
              </div>
              {editForm.type === "20L" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>{language === "en" ? "Shell Price" : "ဗူးခွန်"}</Label>
                    <Input type="number" value={editForm.shellPrice} onChange={(e) => setEditForm({ ...editForm, shellPrice: e.target.value })} />
                  </div>
                  <div>
                    <Label>{language === "en" ? "Water Price" : "ရေဈေး"}</Label>
                    <Input type="number" value={editForm.waterPrice} onChange={(e) => setEditForm({ ...editForm, waterPrice: e.target.value })} />
                  </div>
                </div>
              )}
              <div>
                <Label>{language === "en" ? "Description" : "အချက်အလက်"}</Label>
                <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditDialogOpen(false)} variant="outline" className="flex-1">
                  {language === "en" ? "Cancel" : "ပယ်ဖျက်ပါ"}
                </Button>
                <Button onClick={handleEditProduct} className="flex-1" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "..." : (language === "en" ? "Save" : "သိမ်းဆည်းပါ")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {language === "en" ? "All Products" : "ထုတ်ကုန်အားလုံး"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("productName")}</th>
                    <th className="text-left p-3 font-medium">{language === "mm" ? "မြန်မာအမည်" : "Myanmar Name"}</th>
                    <th className="text-left p-3 font-medium">{t("bottleType")}</th>
                    <th className="text-left p-3 font-medium">{t("unitPrice")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Actions" : "လုပ်ဆောင်ချက်"}</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3">{product.nameMyanmar || "-"}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{product.type}</Badge>
                        </td>
                        <td className="p-3">
                          {editingId === product.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="h-8 w-24"
                                autoFocus
                              />
                              <span className="text-xs text-muted-foreground">Ks</span>
                              <Button variant="ghost" size="sm" onClick={() => savePrice(product.id)} className="h-7 w-7 p-0 text-green-600">
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-7 w-7 p-0 text-red-600">
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium">{Number(product.unitPrice).toLocaleString()} Ks</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {product.isActive ? (language === "en" ? "Active" : "အသုံးပြုနေ") : (language === "en" ? "Inactive" : "ရပ်ဆိုင်း")}
                          </Badge>
                        </td>
                        <td className="p-3 flex gap-1 flex-wrap">
                          <Button variant="ghost" size="sm" onClick={() => startEditPrice(product)} className="h-8 gap-1 text-xs">
                            <Pencil className="h-3 w-3" />
                            {language === "en" ? "Price" : "ဈေး"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setEditForm({
                                name: product.name,
                                nameMyanmar: product.nameMyanmar || "",
                                type: product.type,
                                unitPrice: product.unitPrice,
                                shellPrice: product.shellPrice || "",
                                waterPrice: product.waterPrice || "",
                                description: product.description || "",
                              });
                              setEditDialogOpen(true);
                            }}
                            className="h-8 gap-1 text-xs"
                          >
                            <Pencil className="h-3 w-3" />
                            {language === "en" ? "Edit" : "ပြင်ဆင်"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(language === "en" ? "Delete this product?" : "ဤထုတ်ကုန် ဖျက်မည်လား?")) {
                                deleteProduct.mutate({ id: product.id });
                              }
                            }}
                            className="h-8 gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            {language === "en" ? "Delete" : "ဖျက်"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">{t("noData")}</td>
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
