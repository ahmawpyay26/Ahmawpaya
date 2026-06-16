import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { trpc } from "@/lib/trpc";
import { Truck, Package, CheckCircle, FileText, DollarSign, User } from "lucide-react";

export default function StaffDashboard() {
  const { staff } = useStaffAuth();
  const { language } = useLanguage();

  if (!staff) return null;

  return <StaffDashboardContent staffId={staff.id} staffName={staff.fullName} phone={staff.phone} username={staff.username} />;
}

function StaffDashboardContent({ staffId, staffName, phone, username }: { staffId: number; staffName: string; phone?: string | null; username: string }) {
  const { language } = useLanguage();
  const { data: deliveries } = trpc.deliveries.myDeliveries.useQuery({ staffId });
  const { data: truckStock } = trpc.truckStockRouter.getByStaff.useQuery({ staffId });
  const { data: myInvoices } = trpc.invoices.list.useQuery();
  const { data: mySales } = trpc.reports.mySales.useQuery();

  const pendingDeliveries = deliveries?.filter(d => d.delivery.status === "assigned" || d.delivery.status === "in_transit").length || 0;
  const completedDeliveries = deliveries?.filter(d => d.delivery.status === "delivered").length || 0;
  const totalStock = truckStock?.reduce((sum, s) => sum + s.truckStock.quantity, 0) || 0;
  const totalInvoices = myInvoices?.length || 0;
  const totalSalesAmount = mySales?.reduce((sum, s) => sum + parseFloat(s.totalAmount?.toString() || "0"), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{staffName}</h2>
              <p className="text-cyan-100 text-sm">@{username}</p>
              {phone && <p className="text-cyan-100 text-sm">{phone}</p>}
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                {language === "en" ? "Staff Member" : "ဝန်ထမ်း"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 mx-auto text-cyan-600 mb-2" />
            <p className="text-2xl font-bold">{totalInvoices}</p>
            <p className="text-xs text-gray-500">
              {language === "en" ? "My Invoices" : "ပြေစာများ"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">{Math.round(totalSalesAmount).toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {language === "en" ? "Sales (MMK)" : "ရောင်းရငွေ"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-5 w-5 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{pendingDeliveries}</p>
            <p className="text-xs text-gray-500">
              {language === "en" ? "Pending" : "ကျန်ရှိ"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">{completedDeliveries}</p>
            <p className="text-xs text-gray-500">
              {language === "en" ? "Completed" : "ပြီးစီး"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{totalStock}</p>
            <p className="text-xs text-gray-500">
              {language === "en" ? "Truck Stock" : "ကားပေါ်ပစ္စည်း"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === "en" ? "My Recent Sales" : "ကျွန်ုပ်၏ မကြာသေးမီ ရောင်းချမှုများ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mySales && mySales.length > 0 ? (
            <div className="space-y-2">
              {mySales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <span className="text-sm font-medium">
                      {sale.quantity} {language === "en" ? "items" : "ခု"}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {parseFloat(sale.totalAmount?.toString() || "0").toLocaleString()} MMK
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              {language === "en" ? "No sales records yet" : "ရောင်းချမှု မှတ်တမ်း မရှိသေးပါ"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === "en" ? "Recent Deliveries" : "မကြာသေးမီ ပို့ဆောင်မှုများ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries && deliveries.length > 0 ? (
            <div className="space-y-2">
              {deliveries.slice(0, 5).map((item) => (
                <div key={item.delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">Order #{item.order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(item.delivery.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.delivery.status === "delivered" ? "bg-green-100 text-green-800" :
                    item.delivery.status === "in_transit" ? "bg-blue-100 text-blue-800" :
                    item.delivery.status === "failed" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {item.delivery.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              {language === "en" ? "No deliveries yet" : "ပို့ဆောင်မှု မရှိသေးပါ"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
