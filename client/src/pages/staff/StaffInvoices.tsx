import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, FileText, Trash2, Edit2, Download, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function StaffInvoices() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const { data: invoices, refetch } = trpc.invoices.list.useQuery();
  const [openCreate, setOpenCreate] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: string }>>([
    { productName: "", quantity: 1, unitPrice: "0" },
  ]);

  const exportPDFMutation = trpc.invoices.exportPDF.useMutation();
  const sendEmailMutation = trpc.invoices.sendEmail.useMutation();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailInvoiceId, setEmailInvoiceId] = useState<number | null>(null);
  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Invoice created" : "ပြေစာ ဖန်တီးပြီးပါပြီ");
      setOpenCreate(false);
      setCustomerName("");
      setCustomerPhone("");
      setItems([{ productName: "", quantity: 1, unitPrice: "0" }]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Invoice deleted" : "ပြေစာ ဖျက်ပြီးပါပြီ");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCreateInvoice = () => {
    if (!customerName.trim() || items.some(i => !i.productName.trim())) {
      toast.error(language === "en" ? "Please fill all fields" : "အားလုံး ဖြည့်ပါ");
      return;
    }
    createMutation.mutate({
      customerName,
      customerPhone,
      items: items.map(i => ({ ...i, quantity: Number(i.quantity) })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {language === "en" ? "Invoices" : "ပြေစာများ"}
          </h1>
          <p className="text-gray-600 text-sm">
            {language === "en" ? "Manage your invoices" : "သင့်ပြေစာများ စီမံခန့်ခွဲပါ"}
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2">
              <Plus className="h-4 w-4" />
              {language === "en" ? "New Invoice" : "ပြေစာ အသစ်"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {language === "en" ? "Create Invoice" : "ပြေစာ ဖန်တီးပါ"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "en" ? "Customer Name" : "ဆိုင်ခွင်း အမည်"}</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === "en" ? "Enter name" : "အမည် ထည့်ပါ"}
                  />
                </div>
                <div>
                  <Label>{language === "en" ? "Phone" : "ဖုန်း"}</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09xxxxxxxxx"
                  />
                </div>
              </div>
              <div>
                <Label>{language === "en" ? "Items" : "ပစ္စည်းများ"}</Label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder={language === "en" ? "Product name" : "ပစ္စည်း အမည်"}
                        value={item.productName}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].productName = e.target.value;
                          setItems(newItems);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder={language === "en" ? "Qty" : "အရေအတွက်"}
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = Number(e.target.value) || 1;
                          setItems(newItems);
                        }}
                      />
                      <Input
                        placeholder={language === "en" ? "Price" : "စျေး"}
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].unitPrice = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItems([...items, { productName: "", quantity: 1, unitPrice: "0" }])}
                  className="mt-2"
                >
                  + {language === "en" ? "Add Item" : "ပစ္စည်း ထည့်ပါ"}
                </Button>
              </div>
              <Button
                onClick={handleCreateInvoice}
                disabled={createMutation.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {createMutation.isPending ? "..." : (language === "en" ? "Create" : "ဖန်တီးပါ")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Invoice #" : "ပြေစာ #"}
                    </p>
                    <p className="font-semibold text-sm">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Customer" : "ဆိုင်ခွင်း"}
                    </p>
                    <p className="font-semibold text-sm">{invoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Total" : "စုစုပေါင်း"}
                    </p>
                    <p className="font-semibold text-sm text-green-600">
                      {parseFloat(invoice.totalAmount?.toString() || "0").toLocaleString()} MMK
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Date" : "နေ့စွဲ"}
                    </p>
                    <p className="text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/staff/invoices/${invoice.id}/edit`)}
                      className="gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      {language === "en" ? "Edit" : "ပြင်ဆင်ပါ"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await exportPDFMutation.mutateAsync({ invoiceId: invoice.id });
                          if (result.success) {
                            const link = document.createElement("a");
                            link.href = `data:application/octet-stream;base64,${result.pdfBuffer}`;
                            link.download = result.fileName;
                            link.click();
                            toast.success(language === "en" ? "PDF downloaded" : "PDF အုပ်စုတင်ပြီးပါပြီ");
                          }
                        } catch (err) {
                          toast.error(language === "en" ? "Failed to export PDF" : "PDF အုပ်စုတင်ခြင်း ပရာဂျယ်ပါပြီ");
                        }
                      }}
                      disabled={exportPDFMutation.isPending}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {exportPDFMutation.isPending ? "..." : (language === "en" ? "PDF" : "PDF")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmailInvoiceId(invoice.id);
                        setEmailInput("");
                        setEmailDialogOpen(true);
                      }}
                      className="gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {language === "en" ? "Email" : "အီမေးလ်"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(language === "en" ? "Delete this invoice?" : "ဤပြေစာ ဖျက်မည်လား?")) {
                          deleteMutation.mutate({ id: invoice.id });
                        }
                      }}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      {language === "en" ? "Delete" : "ဖျက်ပါ"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">
              {language === "en" ? "No invoices yet" : "ပြေစာ မရှိသေးပါ"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "en" ? "Send Invoice by Email" : "ပြေစာ အီမေးလ်ပို့ပါ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === "en" ? "Customer Email" : "ဆိုင်ခွင်း အီမေးလ်"}</Label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <Button
              onClick={async () => {
                if (!emailInput.trim() || !emailInvoiceId) {
                  toast.error(language === "en" ? "Please enter email" : "အီမေးလ် ထည့်သွင်းပါ");
                  return;
                }
                try {
                  await sendEmailMutation.mutateAsync({
                    invoiceId: emailInvoiceId,
                    customerEmail: emailInput,
                  });
                  toast.success(language === "en" ? "Email sent" : "အီမေးလ် ပို့ပြီးပါပြီ");
                  setEmailDialogOpen(false);
                  setEmailInput("");
                  setEmailInvoiceId(null);
                } catch (err) {
                  toast.error(language === "en" ? "Failed to send email" : "အီမေးလ် ပို့ခြင်း ပရာဂျယ်ပါပြီ");
                }
              }}
              disabled={sendEmailMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {sendEmailMutation.isPending ? "..." : (language === "en" ? "Send" : "ပို့ပါ")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
