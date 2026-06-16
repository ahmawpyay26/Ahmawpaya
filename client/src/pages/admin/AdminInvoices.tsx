import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Plus, FileText, Download, Trash2 } from "lucide-react";

export default function AdminInvoices() {
  return <AdminInvoicesContent />;
}

function AdminInvoicesContent() {
  const { t, language } = useLanguage();
  const { data: invoices, refetch } = trpc.invoices.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const createInvoice = trpc.invoices.create.useMutation({ onSuccess: () => { refetch(); toast.success(t("success")); setDialogOpen(false); } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<number | null>(null);
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerAddress: "",
    deliveryFee: "0", discount: "0", taxRate: "0", note: "",
  });
  const [items, setItems] = useState([{ productName: "", quantity: 1, quantityStr: "1", unitPrice: "0", productId: undefined as number | undefined }]);

  const addItem = () => setItems([...items, { productName: "", quantity: 1, quantityStr: "1", unitPrice: "0", productId: undefined }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const selectProduct = (index: number, productId: number) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = { productId: product.id, productName: product.name, quantity: newItems[index].quantity, quantityStr: String(newItems[index].quantity), unitPrice: String(product.unitPrice) };
      setItems(newItems);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unitPrice || "0"), 0);
  const taxAmount = (subtotal - parseFloat(form.discount || "0")) * (parseFloat(form.taxRate || "0") / 100);
  const total = subtotal + parseFloat(form.deliveryFee || "0") - parseFloat(form.discount || "0") + taxAmount;

  const handleCreate = () => {
    if (!form.customerName) { toast.error("Customer name required"); return; }
    createInvoice.mutate({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      items: items.filter(i => i.productName && i.quantity > 0),
      deliveryFee: form.deliveryFee,
      discount: form.discount,
      taxRate: form.taxRate,
      note: form.note,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("invoices")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Generate and manage invoices" : "ပြေစာများ ဖန်တီးပြီး စီမံပါ"}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            {t("generateInvoice")}
          </Button>
        </div>

        {/* Create Invoice Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("generateInvoice")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("customerName")}</Label>
                  <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                </div>
                <div>
                  <Label>{t("phone")}</Label>
                  <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>{t("address")}</Label>
                <Input value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={item.productId || ""}
                        onChange={(e) => selectProduct(i, Number(e.target.value))}
                      >
                        <option value="">Select</option>
                        {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <Input className="w-16" type="number" min="1" value={item.quantityStr} onChange={(e) => { const n = [...items]; n[i].quantityStr = e.target.value; n[i].quantity = parseInt(e.target.value) || 0; setItems(n); }} onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) { const n = [...items]; n[i].quantity = 1; n[i].quantityStr = "1"; setItems(n); } }} />
                    <Input className="w-24" value={item.unitPrice} readOnly />
                    {items.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{t("deliveryFee")}</Label>
                  <Input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{t("discount")}</Label>
                  <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{t("tax")} %</Label>
                  <Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>{t("subtotal")}</span><span>{subtotal.toLocaleString()} Ks</span></div>
                <div className="flex justify-between"><span>{t("deliveryFee")}</span><span>{parseFloat(form.deliveryFee || "0").toLocaleString()} Ks</span></div>
                <div className="flex justify-between"><span>{t("discount")}</span><span>-{parseFloat(form.discount || "0").toLocaleString()} Ks</span></div>
                <div className="flex justify-between"><span>{t("tax")}</span><span>{taxAmount.toLocaleString()} Ks</span></div>
                <div className="flex justify-between font-bold border-t pt-1"><span>{t("total")}</span><span>{total.toLocaleString()} Ks</span></div>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? t("loading") : t("generateInvoice")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("invoiceNumber")}</th>
                    <th className="text-left p-3 font-medium">{t("customerName")}</th>
                    <th className="text-left p-3 font-medium">{t("total")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                    <th className="text-left p-3 font-medium">{t("date")}</th>
                    <th className="text-left p-3 font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices && invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{inv.invoiceNumber}</td>
                        <td className="p-3">{inv.customerName}</td>
                        <td className="p-3 font-medium">{Number(inv.totalAmount).toLocaleString()} Ks</td>
                        <td className="p-3">
                          <Badge variant="secondary">{inv.status}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" onClick={() => setViewInvoice(inv.id)}>
                            <FileText className="h-4 w-4" />
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

        {/* Invoice View Dialog */}
        {viewInvoice && <InvoiceViewDialog invoiceId={viewInvoice} onClose={() => setViewInvoice(null)} />}
      </div>
    </AdminLayout>
  );
}

function InvoiceViewDialog({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) {
  const { t, language } = useLanguage();
  const { data: invoice } = trpc.invoices.getById.useQuery({ id: invoiceId });
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}.total{font-weight:bold;font-size:1.2em}</style></head><body>${invoiceRef.current.innerHTML}</body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{invoice.invoiceNumber}</span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
              <Download className="h-3.5 w-3.5" />
              {t("exportPDF")}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div ref={invoiceRef} className="space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">အမောပြေ</h2>
            <p className="text-sm text-muted-foreground">Pure Water Delivery</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">{t("customerName")}: {invoice.customerName}</p>
              <p>{t("phone")}: {invoice.customerPhone || "-"}</p>
              <p>{t("address")}: {invoice.customerAddress || "-"}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{invoice.invoiceNumber}</p>
              <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">{language === "en" ? "Item" : "ပစ္စည်း"}</th>
                <th className="text-right py-2">{t("quantity")}</th>
                <th className="text-right py-2">{t("unitPrice")}</th>
                <th className="text-right py-2">{t("subtotal")}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.productName}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{Number(item.unitPrice).toLocaleString()}</td>
                  <td className="text-right py-2">{Number(item.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{Number(invoice.subtotal).toLocaleString()} Ks</span></div>
            <div className="flex justify-between"><span>{t("deliveryFee")}</span><span>{Number(invoice.deliveryFee).toLocaleString()} Ks</span></div>
            <div className="flex justify-between"><span>{t("discount")}</span><span>-{Number(invoice.discount).toLocaleString()} Ks</span></div>
            <div className="flex justify-between"><span>{t("tax")}</span><span>{Number(invoice.taxAmount).toLocaleString()} Ks</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>{t("total")}</span><span>{Number(invoice.totalAmount).toLocaleString()} Ks</span></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
