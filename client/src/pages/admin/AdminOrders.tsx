import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  return <AdminOrdersContent />;
}

function AdminOrdersContent() {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const { data: orders, refetch } = trpc.orders.list.useQuery(
    statusFilter !== "all" ? { status: statusFilter as any } : {}
  );
  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { refetch(); toast.success(t("success")); },
  });
  const deleteOrder = trpc.orders.delete.useMutation({
    onSuccess: () => { refetch(); toast.success(language === "en" ? "Order deleted" : "အော်ဒါ ဖျက်ပြီးပါပြီ"); setDeleteId(null); },
  });
  const deleteAllOrders = trpc.orders.deleteAll.useMutation({
    onSuccess: () => { refetch(); toast.success(language === "en" ? "All orders deleted" : "အော်ဒါအားလုံး ဖျက်ပြီးပါပြီ"); setDeleteAllOpen(false); },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("orders")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Manage all customer orders" : "ဖောက်သည်အော်ဒါအားလုံး စီမံပါ"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="processing">{t("processing")}</SelectItem>
                <SelectItem value="delivered">{t("delivered")}</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            {orders && orders.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteAllOpen(true)} className="gap-1">
                <Trash2 className="h-3.5 w-3.5" />
                {language === "en" ? "Delete All" : "အားလုံးဖျက်"}
              </Button>
            )}
          </div>
        </div>

        {/* Delete Single Order Confirmation */}
        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{language === "en" ? "Delete Order" : "အော်ဒါ ဖျက်မည်"}</AlertDialogTitle>
              <AlertDialogDescription>
                {language === "en"
                  ? "Are you sure you want to permanently delete this order? This action cannot be undone."
                  : "ဤအော်ဒါကို အပြီးအပိုင် ဖျက်မည်မှာ သေချာပါသလား? ပြန်ယူ၍ မရနိုင်ပါ။"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{language === "en" ? "Cancel" : "မလုပ်ပါ"}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteOrder.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {language === "en" ? "Delete" : "ဖျက်ပါ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete All Orders Confirmation */}
        <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {language === "en" ? "Delete ALL Orders" : "အော်ဒါ အားလုံး ဖျက်မည်"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === "en"
                  ? "WARNING: This will permanently delete ALL orders, order items, and related delivery records. This action CANNOT be undone. Are you absolutely sure?"
                  : "သတိပေးချက်: အော်ဒါအားလုံး၊ အော်ဒါပစ္စည်းများနှင့် ပို့ဆောင်မှုမှတ်တမ်းများ အပြီးအပိုင် ပျက်ပါမည်။ ပြန်ယူ၍ မရနိုင်ပါ။ သေချာပါသလား?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{language === "en" ? "Cancel" : "မလုပ်ပါ"}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteAllOrders.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {language === "en" ? "Yes, Delete All" : "ဟုတ်ကဲ့ အားလုံးဖျက်ပါ"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("orderNumber")}</th>
                    <th className="text-left p-3 font-medium">{t("customerName")}</th>
                    <th className="text-left p-3 font-medium">{t("phone")}</th>
                    <th className="text-left p-3 font-medium">{t("total")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                    <th className="text-left p-3 font-medium">{t("date")}</th>
                    <th className="text-left p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{order.orderNumber}</td>
                        <td className="p-3">{order.customerName}</td>
                        <td className="p-3">{order.customerPhone}</td>
                        <td className="p-3 font-medium">{Number(order.totalAmount).toLocaleString()} Ks</td>
                        <td className="p-3">
                          <Badge variant="secondary" className={statusColors[order.status]}>
                            {t(order.status as any)}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Select
                              value={order.status}
                              onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val as any })}
                            >
                              <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t("pending")}</SelectItem>
                                <SelectItem value="processing">{t("processing")}</SelectItem>
                                <SelectItem value="delivered">{t("delivered")}</SelectItem>
                                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(order.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">{t("noData")}</td>
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
