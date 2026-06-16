import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Download, Calendar } from "lucide-react";

export default function AdminReports() {
  return <AdminReportsContent />;
}

function AdminReportsContent() {
  const { t, language } = useLanguage();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const queryInput = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [startDate, endDate]);

  const { data: salesRecords } = trpc.reports.sales.useQuery(queryInput);

  const totalRevenue = salesRecords?.reduce((sum, r) => sum + Number(r.totalAmount), 0) || 0;
  const totalQuantity = salesRecords?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;

  const exportCSV = () => {
    if (!salesRecords || salesRecords.length === 0) return;
    const headers = ["Date", "Invoice", "Customer", "Quantity", "Amount"];
    const rows = salesRecords.map(r => [
      new Date(r.createdAt).toLocaleDateString(),
      r.invoiceId || "-",
      r.customerId || "-",
      r.quantity,
      r.totalAmount,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_${startDate || "all"}_${endDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("reports")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Sales records and reporting" : "အရောင်းမှတ်တမ်းများနှင့် အစီရင်ခံစာ"}
            </p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-1" disabled={!salesRecords?.length}>
            <Download className="h-4 w-4" />
            {t("exportCSV")}
          </Button>
        </div>

        {/* Date Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="text-xs">{language === "en" ? "Start Date" : "စတင်ရက်"}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
              </div>
              <div>
                <Label className="text-xs">{language === "en" ? "End Date" : "ပြီးဆုံးရက်"}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>
                {language === "en" ? "Clear" : "ရှင်းပါ"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{t("totalRevenue")}</p>
              <p className="text-2xl font-bold text-primary">{totalRevenue.toLocaleString()} Ks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{t("totalOrders")}</p>
              <p className="text-2xl font-bold">{salesRecords?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{t("quantity")}</p>
              <p className="text-2xl font-bold">{totalQuantity}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "en" ? "Sales Records" : "အရောင်းမှတ်တမ်းများ"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("date")}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Invoice" : "ပြေစာ"}</th>
                    <th className="text-left p-3 font-medium">{t("quantity")}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Amount" : "ပမာဏ"}</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRecords && salesRecords.length > 0 ? (
                    salesRecords.map((record) => (
                      <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3">{new Date(record.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">{record.invoiceId || "-"}</td>
                        <td className="p-3">{record.quantity}</td>
                        <td className="p-3 font-medium">{Number(record.totalAmount).toLocaleString()} Ks</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">{t("noData")}</td>
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
