import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Droplets, ShoppingCart, Truck, Shield, Phone, MapPin, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

function WaterQualityCard({ language }: { language: string }) {
  const { data: latest, isLoading, error } = trpc.waterQuality.latest.useQuery();
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Droplets className="h-12 w-12 mx-auto text-cyan-600 mb-3 animate-pulse" />
        <p className="text-muted-foreground">
          {language === "en" ? "Loading water quality data..." : "ရေအရည်အသွေး အချက်အလက် ဖွင့်နေပါသည်..."}
        </p>
      </div>
    );
  }
  
  if (error || !latest) {
    return (
      <div className="text-center py-8">
        <Droplets className="h-12 w-12 mx-auto text-cyan-600 mb-3" />
        <p className="text-muted-foreground text-sm">
          {language === "en" ? "Water quality data not available yet" : "ရေအရည်အသွေး အချက်အလက် သေးငယ်သေးပါ"}
        </p>
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden border-cyan-200 bg-white/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Droplets className="h-6 w-6 text-cyan-600" />
              {language === "en" ? "Water Quality Status" : "ရေအရည်အသွေး အခြေအနေ"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "en" ? "Latest inspection" : "နောက်ဆုံး စစ်ဆေးချက်"}: {new Date(latest.inspectionDate).toLocaleDateString()}
            </p>
          </div>
          <Shield className="h-8 w-8 text-green-600" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-cyan-50">
            <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "pH Level" : "pH"}</p>
            <p className="text-2xl font-bold text-cyan-600">{latest.pH}</p>
            <p className="text-xs text-green-600 mt-1">✓ {language === "en" ? "Normal" : "သာမန်"}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Turbidity" : "အရှင်းအရုံး"}</p>
            <p className="text-2xl font-bold text-blue-600">{latest.turbidity}</p>
            <p className="text-xs text-green-600 mt-1">✓ {language === "en" ? "Clear" : "ရှင်းလင်း"}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-teal-50">
            <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Chlorine" : "ကလိုရင်း"}</p>
            <p className="text-2xl font-bold text-teal-600">{latest.chlorineLevel}</p>
            <p className="text-xs text-green-600 mt-1">✓ {language === "en" ? "Safe" : "လုံခြုံ"}</p>
          </div>
        </div>
        
        {latest.notes && (
          <p className="text-sm text-muted-foreground mt-4 p-3 bg-gray-50 rounded">
            {language === "en" ? "Notes" : "မှတ်ချက်များ"}: {latest.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { t, language } = useLanguage() as any;
  const { data: products } = trpc.products.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile-first stacked layout */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-3 py-2 w-full max-w-full overflow-hidden">
          {/* Row 1: Logo + Name centered */}
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <img src="/manus-storage/amaw_pyay_logo_938ce02a.png" alt="အမောပြေ" className="w-6 h-6 object-contain flex-shrink-0" />
            <span className="font-bold text-sm">{t("appName")}</span>
          </div>
          {/* Row 2: All buttons in a centered row with wrapping */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <LanguageToggle />
            <Link href="/admin-login">
              <Button variant="outline" size="sm" className="text-[10px] px-2 h-6 whitespace-nowrap">
                Admin
              </Button>
            </Link>
            <Link href="/staff-login">
              <Button variant="outline" size="sm" className="text-[10px] px-2 h-6 whitespace-nowrap">
                {language === "en" ? "Staff" : "ဝန်ထမ်း"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 water-gradient-light opacity-50" />
        <div className="container relative py-8 sm:py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <img src="/manus-storage/amaw_pyay_logo_938ce02a.png" alt="အမောပြေ" className="w-20 h-20 sm:w-28 sm:h-28 object-contain mb-2 sm:mb-3" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Droplets className="h-4 w-4" />
                {language === "en" ? "Pure Water Delivery Service" : "သန့်ရှင်းသောရေ ပို့ဆောင်ရေးဝန်ဆောင်မှု"}
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
              {language === "en" ? (
                <>Fresh, Pure Water <br /><span className="text-primary">Delivered to Your Door</span></>
              ) : (
                <>သန့်ရှင်းသောရေ <br /><span className="text-primary">သင့်တံခါးဝအထိ ပို့ဆောင်ပေးပါသည်</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg mb-4 sm:mb-8">
              {language === "en"
                ? "Order premium purified water for your home or business. Fast delivery, competitive prices, and reliable service."
                : "သင့်အိမ် သို့မဟုတ် စီးပွားရေးအတွက် အရည်အသွေးမြင့် သန့်စင်ရေကို မှာယူပါ။ မြန်ဆန်သော ပို့ဆောင်မှု၊ ယှဉ်ပြိုင်နိုင်သော ဈေးနှုန်းများ။"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/order">
                <Button size="lg" className="gap-2 water-gradient text-white border-0 hover:opacity-90 w-full sm:w-auto">
                  <ShoppingCart className="h-5 w-5" />
                  {t("placeOrder")}
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Truck className="h-5 w-5" />
                  {t("trackOrder")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">{t("products")}</h2>
            <p className="text-muted-foreground">
              {language === "en" ? "Choose from our range of purified water products" : "ကျွန်ုပ်တို့၏ သန့်စင်ရေ ထုတ်ကုန်များမှ ရွေးချယ်ပါ"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-36 sm:h-40 bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-28 sm:h-32 w-auto max-w-full object-contain" />
                    ) : (
                      <Droplets className="h-12 w-12 text-primary/60" />
                    )}
                  </div>
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-semibold mb-0.5 text-xs sm:text-base line-clamp-1">
                      {language === "mm" && product.nameMyanmar ? product.nameMyanmar : product.name}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2 line-clamp-1">
                      {product.type === "20L" ? t("gallon20L") : `${product.type} ${t("smallBottle")}`}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm sm:text-lg font-bold text-primary">
                        {Number(product.unitPrice).toLocaleString()} Ks
                      </span>
                      <Link href="/order">
                        <Button size="sm" variant="outline" className="text-[10px] sm:text-xs h-6 sm:h-8 px-2 w-full sm:w-auto">{t("orderProduct")}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{language === "en" ? "Products will be available soon" : "ထုတ်ကုန်များ မကြာမီ ရရှိနိုင်ပါမည်"}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Water Quality Status */}
      <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container">
          <WaterQualityCard language={language} />
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === "en" ? "Fast Delivery" : "မြန်ဆန်သော ပို့ဆောင်မှု"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Same-day delivery for orders placed before noon" : "မွန်းတည့်မတိုင်မီ မှာယူပါက ထိုနေ့တွင်ပင် ပို့ဆောင်ပေးပါသည်"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === "en" ? "Quality Guaranteed" : "အရည်အသွေး အာမခံ"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Multi-stage purification for the cleanest water" : "အသန့်ရှင်းဆုံးရေအတွက် အဆင့်များစွာ သန့်စင်ခြင်း"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === "en" ? "Easy Ordering" : "လွယ်ကူသော မှာယူမှု"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Order online or call us directly" : "အွန်လိုင်းမှ မှာယူပါ သို့မဟုတ် တိုက်ရိုက်ဖုန်းခေါ်ပါ"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {t("appName")} - {t("appTagline")}</p>
        </div>
      </footer>
    </div>
  );
}
