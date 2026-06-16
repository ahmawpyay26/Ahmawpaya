import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { Droplets, ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface OrderItemInput {
  productId?: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  imageUrl?: string | null;
}

export default function PublicOrder() {
  const { t, language } = useLanguage();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: moqSetting } = trpc.settings.get.useQuery({ key: "min_order_quantity" });
  const createOrder = trpc.orders.create.useMutation();

  const minOrderQty = useMemo(() => {
    const val = moqSetting?.value;
    return val ? parseInt(val) : 1;
  }, [moqSetting]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; totalAmount: number } | null>(null);

  // Loyalty points redemption state
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [loyaltyChecked, setLoyaltyChecked] = useState(false);

  // Query loyalty balance when phone is entered and user wants to redeem
  const { data: loyaltyData } = trpc.loyalty.getByPhone.useQuery(
    { phone: customerPhone },
    { enabled: customerPhone.length >= 9 && loyaltyChecked }
  );

  // Get redemption rate setting
  const { data: redemptionRateSetting } = trpc.settings.get.useQuery(
    { key: "points_redemption_rate" },
    { enabled: usePoints }
  );
  const { data: loyaltyEnabledSetting } = trpc.settings.get.useQuery(
    { key: "loyalty_enabled" },
    { enabled: true }
  );

  const loyaltyEnabled = loyaltyEnabledSetting?.value === "true";
  const redemptionRate = parseFloat(redemptionRateSetting?.value || "100");
  const availablePoints = loyaltyData?.availablePoints || 0;
  const discountFromPoints = pointsToRedeem * redemptionRate;

  // Strict validation: customer info must be fully filled before allowing product selection
  const isCustomerInfoComplete = customerName.trim().length > 0 && customerPhone.trim().length >= 9 && customerAddress.trim().length > 0;

  const addItem = () => {
    setItems([...items, { productName: "", quantity: minOrderQty, unitPrice: "0" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const selectProduct = (index: number, productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        productId: product.id,
        productName: language === "mm" && product.nameMyanmar ? product.nameMyanmar : product.name,
        quantity: Math.max(newItems[index].quantity, minOrderQty),
        unitPrice: String(product.unitPrice),
        imageUrl: product.imageUrl,
      };
      setItems(newItems);
    }
  };

  const updateQuantity = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: Math.max(value, minOrderQty) };
    setItems(newItems);
  };

  const updateQuantityStr = (index: number, strValue: string) => {
    const newItems = [...items];
    const numValue = parseInt(strValue);
    newItems[index] = { ...newItems[index], quantity: isNaN(numValue) ? 0 : numValue };
    setItems(newItems);
  };

  const handleQuantityBlur = (index: number) => {
    const newItems = [...items];
    if (newItems[index].quantity < minOrderQty) {
      newItems[index] = { ...newItems[index], quantity: minOrderQty };
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unitPrice || "0"), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = Math.max(0, subtotal - (usePoints ? discountFromPoints : 0));

  const handleCheckLoyalty = () => {
    if (customerPhone.length >= 9) {
      setLoyaltyChecked(true);
    } else {
      toast.error(language === "en" ? "Please enter your phone number first" : "ဖုန်းနံပါတ်ကို အရင်ထည့်ပါ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress.trim()) {
      toast.error(language === "en" ? "Please fill Customer Name, Phone Number, and Full Address" : "ဝယ်ယူသူအမည်၊ ဖုန်းနံပါတ်၊ နေရပ်လိပ်စာ အပဤည့်အစုံ ဖဤည့်ပါ");
      return;
    }
    const validItems = items.filter(i => i.productId && i.quantity >= minOrderQty);
    if (validItems.length === 0) {
      toast.error(language === "en" ? "Please select at least one product" : "ထုတ်ကုန်အနည်းဆုံး တစ်ခု ရွေးချယ်ပါ");
      return;
    }
    // Check MOQ per item
    const belowMoq = validItems.find(i => i.quantity < minOrderQty);
    if (belowMoq) {
      toast.error(language === "en" 
        ? `Minimum order quantity is ${minOrderQty} per item` 
        : `အနည်းဆုံး မှာယူရမည့်အရေအတွက်မှာ ပစ္စည်းတစ်ခုလျှင် ${minOrderQty} ခု ဖြစ်ပါသည်`);
      return;
    }
    try {
      const result = await createOrder.mutateAsync({
        customerName,
        customerPhone,
        customerAddress,
        items: validItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        note,
        isPublicOrder: true,
        redeemPoints: usePoints && pointsToRedeem > 0 ? pointsToRedeem : undefined,
      });
      setOrderResult(result);
      toast.success(t("success"));
    } catch (err: any) {
      toast.error(err.message || t("error"));
    }
  };

  if (orderResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === "en" ? "Order Placed Successfully!" : "အော်ဒါ အောင်မြင်စွာ တင်ပြီးပါပြီ!"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "en" ? "Your order number is:" : "သင့်အော်ဒါနံပါတ်မှာ:"}
            </p>
            <div className="bg-primary/10 rounded-lg p-4 mb-4">
              <p className="text-xl font-mono font-bold text-primary">{orderResult.orderNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? `Total: ${orderResult.totalAmount.toLocaleString()} Ks` : `စုစုပေါင်း: ${orderResult.totalAmount.toLocaleString()} ကျပ်`}
            </p>
            {usePoints && pointsToRedeem > 0 && (
              <p className="text-sm text-green-600 mb-4">
                {language === "en" 
                  ? `${pointsToRedeem} points redeemed (−${discountFromPoints.toLocaleString()} Ks discount)` 
                  : `${pointsToRedeem} points အသုံးပြုပြီး (−${discountFromPoints.toLocaleString()} ကျပ် လျှော့စျေး)`}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Link href="/track">
                <Button variant="outline">{t("trackOrder")}</Button>
              </Link>
              <Link href="/">
                <Button>{t("home")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            </Link>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="container py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("placeOrder")}</h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Fill in your details and select products" : "သင့်အချက်အလက်များ ဖြည့်ပြီး ထုတ်ကုန်များ ရွေးချယ်ပါ"}
          </p>
          {/* MOQ Notice */}
          {minOrderQty > 1 && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                {language === "en" 
                  ? `Minimum order quantity: ${minOrderQty} per item` 
                  : `အနည်းဆုံး မှာယူရမည့်အရေအတွက်: ပစ္စည်းတစ်ခုလျှင် ${minOrderQty} ခု`}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === "en" ? "Customer Information" : "ဖောက်သည်အချက်အလက်"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("customerName")} *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === "en" ? "Enter your name" : "အမည်ထည့်ပါ"}
                  required
                />
              </div>
              <div>
                <Label>{t("phone")} *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setLoyaltyChecked(false);
                    setUsePoints(false);
                    setPointsToRedeem(0);
                  }}
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
              <div>
                <Label>{language === "en" ? "Full Address" : "နေရပ်လိပ်စာ အပဤည့်အစုံ"} *</Label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={language === "en" ? "Enter your full delivery address" : "ပို့ဆောင်ရမည့် လိပ်စာအပဤည့်အစုံ ထည့်ပါ"}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Selection - Card-based with images */}
          <Card className={!isCustomerInfoComplete ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{language === "en" ? "Select Products" : "ထုတ်ကုန်များ ရွေးချယ်ပါ"}</span>
                {!isCustomerInfoComplete && (
                  <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {language === "en" ? "Fill customer info first" : "ဖောက်သည်အချက်အလက် အရင်ဖဤည့်ပါ"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products?.map((product) => {
                    const existingIndex = items.findIndex(i => i.productId === product.id);
                    const isSelected = existingIndex >= 0;
                    const qty = isSelected ? items[existingIndex].quantity : 0;

                    return (
                      <div
                        key={product.id}
                        className={`border rounded-lg p-3 transition-all ${
                          isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Product Image & Info */}
                        <div className="flex items-center gap-3 mb-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Droplets className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {language === "mm" && product.nameMyanmar ? product.nameMyanmar : product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{product.type}</p>
                          </div>
                        </div>

                        {/* Fixed Price Display (READ-ONLY) */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground">
                            {language === "en" ? "Unit Price" : "တစ်ခုချင်းဈေး"}
                          </span>
                          <span className="font-bold text-primary text-lg">
                            {Number(product.unitPrice).toLocaleString()} Ks
                          </span>
                        </div>

                        {/* Quantity Control */}
                        {isSelected ? (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs flex-shrink-0">
                              {language === "en" ? "Qty:" : "အရေအတွက်:"}
                            </Label>
                            <div className="flex items-center gap-1 flex-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  if (qty <= minOrderQty) {
                                    removeItem(existingIndex);
                                  } else {
                                    updateQuantity(existingIndex, qty - 1);
                                  }
                                }}
                              >
                                {qty <= minOrderQty ? <Trash2 className="h-3 w-3 text-destructive" /> : "−"}
                              </Button>
                              <Input
                                type="number"
                                min={minOrderQty}
                                value={qty === 0 ? "" : qty}
                                onChange={(e) => updateQuantityStr(existingIndex, e.target.value)}
                                onBlur={() => handleQuantityBlur(existingIndex)}
                                className="h-8 text-center w-16"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(existingIndex, qty + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              = {(qty * Number(product.unitPrice)).toLocaleString()} Ks
                            </span>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-1"
                            disabled={!isCustomerInfoComplete}
                            onClick={() => {
                              if (!isCustomerInfoComplete) {
                                toast.error(language === "en" 
                                  ? "Please fill Customer Name, Phone Number, and Full Address first" 
                                  : "ဝယ်ယူသူအမည်၊ ဖုန်းနံပါတ်၊ နေရပ်လိပ်စာ အပဤည့်အစုံ ဖဤည့်ပါ");
                                return;
                              }
                              setItems([...items, {
                                productId: product.id,
                                productName: language === "mm" && product.nameMyanmar ? product.nameMyanmar : product.name,
                                quantity: minOrderQty,
                                unitPrice: String(product.unitPrice),
                                imageUrl: product.imageUrl,
                              }]);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {language === "en" ? "Add to Order" : "မှာယူမည်"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Summary */}
              {items.length > 0 && (
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{language === "en" ? "Items" : "ပစ္စည်းအရေအတွက်"}</span>
                    <span>{totalQuantity} {language === "en" ? "pcs" : "ခု"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{language === "en" ? "Subtotal" : "စုစုပေါင်း"}</span>
                    <span>{subtotal.toLocaleString()} Ks</span>
                  </div>
                  {usePoints && discountFromPoints > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{language === "en" ? "Points Discount" : "Points လျှော့စျေး"}</span>
                      <span>−{discountFromPoints.toLocaleString()} Ks</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">{t("total")}</span>
                    <span className="text-xl font-bold text-primary">{total.toLocaleString()} Ks</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loyalty Points Redemption */}
          {loyaltyEnabled && items.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  {language === "en" ? "Loyalty Points" : "Loyalty Points"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!loyaltyChecked ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {language === "en" 
                        ? "Check if you have loyalty points to redeem for a discount" 
                        : "လျှော့စျေးအတွက် loyalty points ရှိမရှိ စစ်ဆေးပါ"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCheckLoyalty}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      {language === "en" ? "Check My Points" : "ကျွန်ုပ်၏ Points စစ်ဆေးရန်"}
                    </Button>
                  </div>
                ) : loyaltyData && availablePoints > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                      <div>
                        <p className="text-sm font-medium">
                          {language === "en" ? "Available Points" : "ရရှိနိုင်သော Points"}
                        </p>
                        <p className="text-2xl font-bold text-amber-600">{availablePoints}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "en" 
                            ? `1 point = ${redemptionRate.toLocaleString()} Ks` 
                            : `1 point = ${redemptionRate.toLocaleString()} ကျပ်`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">
                          {language === "en" ? "Use Points" : "Points သုံးမည်"}
                        </Label>
                        <Switch
                          checked={usePoints}
                          onCheckedChange={(checked) => {
                            setUsePoints(checked);
                            if (!checked) setPointsToRedeem(0);
                          }}
                        />
                      </div>
                    </div>

                    {usePoints && (
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {language === "en" ? "Points to redeem:" : "အသုံးပြုမည့် Points:"}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={Math.min(availablePoints, Math.floor(subtotal / redemptionRate))}
                            value={pointsToRedeem}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const maxAllowed = Math.min(availablePoints, Math.floor(subtotal / redemptionRate));
                              setPointsToRedeem(Math.min(val, maxAllowed));
                            }}
                            className="w-24"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const maxAllowed = Math.min(availablePoints, Math.floor(subtotal / redemptionRate));
                              setPointsToRedeem(maxAllowed);
                            }}
                            className="text-amber-700 text-xs"
                          >
                            {language === "en" ? "Use Max" : "အများဆုံးသုံးမည်"}
                          </Button>
                        </div>
                        {pointsToRedeem > 0 && (
                          <p className="text-sm text-green-600 font-medium">
                            {language === "en" 
                              ? `Discount: −${discountFromPoints.toLocaleString()} Ks` 
                              : `လျှော့စျေး: −${discountFromPoints.toLocaleString()} ကျပ်`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? "No loyalty points available for this phone number. Points are earned after deliveries." 
                      : "ဤဖုန်းနံပါတ်အတွက် loyalty points မရှိပါ။ Delivery ပြီးပါက points ရရှိပါမည်။"}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Note */}
          <Card>
            <CardContent className="pt-6">
              <Label>{t("note")}</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={language === "en" ? "Any special instructions..." : "အထူးညွှန်ကြားချက်များ..."}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full water-gradient text-white border-0 hover:opacity-90"
            disabled={createOrder.isPending || items.length === 0 || !isCustomerInfoComplete}
          >
            {createOrder.isPending
              ? t("loading")
              : language === "en" ? "Confirm Order" : "အော်ဒါတင်ပါ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
