import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminAnalytics() {
  return <AdminAnalyticsContent />;
}

function AdminAnalyticsContent() {
  const { t, language } = useLanguage();
  const { data: revenueData } = trpc.dashboard.revenueChart.useQuery({ days: 30 });
  const { data: topCustomers } = trpc.dashboard.topCustomers.useQuery({ limit: 10 });
  const { data: bottleBreakdown } = trpc.dashboard.bottleBreakdown.useQuery();
  const { data: deliveryPerf } = trpc.dashboard.deliveryPerformance.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("analytics")}</h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Business performance insights and trends" : "စီးပွားရေးစွမ်းဆောင်ရည် ထိုးထွင်းသိမြင်မှုများ"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("revenueChart")}</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} dot={false} name={language === "en" ? "Revenue" : "ဝင်ငွေ"} />
                    <Line type="monotone" dataKey="orderCount" stroke="#00C49F" strokeWidth={2} dot={false} name={language === "en" ? "Orders" : "အော်ဒါ"} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {language === "en" ? "No data yet. Revenue trends will appear here." : "ဒေတာမရှိသေးပါ။ ဝင်ငွေလမ်းကြောင်းများ ဤနေရာတွင် ပေါ်လာပါမည်။"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>{t("topCustomers")}</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers && topCustomers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCustomers.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="customerName" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="totalSpent" fill="#0088FE" name={language === "en" ? "Total Spent" : "စုစုပေါင်းသုံးစွဲ"} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {t("noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottle Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bottleBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              {bottleBreakdown && bottleBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bottleBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ productType, percent }) => `${productType} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalQuantity"
                      nameKey="productType"
                    >
                      {bottleBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {t("noData")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("deliveryPerformance")}</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveryPerf ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{deliveryPerf.totalDeliveries}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Total" : "စုစုပေါင်း"}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-700">{deliveryPerf.delivered}</p>
                  <p className="text-xs text-muted-foreground">{t("delivered")}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-700">{deliveryPerf.inTransit}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "In Transit" : "လမ်းတွင်"}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50">
                  <p className="text-2xl font-bold text-yellow-700">{deliveryPerf.assigned}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Assigned" : "တာဝန်ပေး"}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-700">{deliveryPerf.failed}</p>
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Failed" : "မအောင်မြင်"}</p>
                </div>
                <div className="col-span-2 md:col-span-5 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{language === "en" ? "Success Rate" : "အောင်မြင်မှုနှုန်း"}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${deliveryPerf.successRate}%` }} />
                    </div>
                    <span className="text-sm font-bold">{deliveryPerf.successRate}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t("noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
