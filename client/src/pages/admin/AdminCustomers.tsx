import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export default function AdminCustomers() {
  return <AdminCustomersContent />;
}

function AdminCustomersContent() {
  const { t, language } = useLanguage();
  const { data: customers } = trpc.customers.list.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("customers")}</h1>
          <p className="text-muted-foreground">
            {language === "en" ? "View all registered and guest customers" : "စာရင်းသွင်းထားသော နှင့် ဧည့်သည်ဖောက်သည်များ ကြည့်ပါ"}
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("customerName")}</th>
                    <th className="text-left p-3 font-medium">{t("phone")}</th>
                    <th className="text-left p-3 font-medium">{t("address")}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Zone" : "ဇုန်"}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Orders" : "အော်ဒါ"}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Type" : "အမျိုးအစား"}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-medium">{customer.name}</td>
                        <td className="p-3">{customer.phone}</td>
                        <td className="p-3 max-w-[200px] truncate">{customer.address || "-"}</td>
                        <td className="p-3">{customer.zone || "-"}</td>
                        <td className="p-3">{customer.orderCount}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className={customer.isRegistered ? "bg-green-100 text-green-800" : ""}>
                            {customer.isRegistered ? (language === "en" ? "Registered" : "စာရင်းသွင်း") : (language === "en" ? "Guest" : "ဧည့်သည်")}
                          </Badge>
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
