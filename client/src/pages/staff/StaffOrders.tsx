import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function StaffOrders() {
  const { language } = useLanguage();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {language === "en" ? "Orders" : "အော်ဒါများ"}
        </h1>
        <p className="text-gray-600 text-sm">
          {language === "en" ? "View all orders (read-only)" : "အော်ဒါများ ကြည့်ရှုပါ (ပြင်ဆင်ခွင့်မရှိ)"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Order Number" : "အော်ဒါ နံပါတ်"}
                    </p>
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Customer" : "ဆိုင်ခွင်း"}
                    </p>
                    <p className="font-semibold text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-600">{order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Total Amount" : "စုစုပေါင်း"}
                    </p>
                    <p className="font-semibold text-sm text-green-600">
                      {parseFloat(order.totalAmount?.toString() || "0").toLocaleString()} MMK
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {language === "en" ? "Status" : "အခြေအနေ"}
                      </p>
                      <Badge className={`${statusColors[order.status] || "bg-gray-100 text-gray-800"} text-xs`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {language === "en" ? "No orders found" : "အော်ဒါ မရှိပါ"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
