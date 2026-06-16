import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function StaffInvoiceEdit() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: string }>>([
    { productName: "", quantity: 1, unitPrice: "0" },
  ]);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [note, setNote] = useState("");

  // Extract invoice ID from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/staff\/invoices\/(\d+)/);
    if (match) {
      setInvoiceId(parseInt(match[1], 10));
    }
  }, []);

  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery(
    { id: invoiceId || 0 },
    { enabled: !!invoiceId }
  );

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Invoice updated" : "ပြေစာ အဆင်ပြေ ပြင်ဆင်ပြီးပါပြီ");
      navigate("/staff/invoices");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Load invoice data
  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customerName || "");
      setCustomerPhone(invoice.customerPhone || "");
      setCustomerAddress(invoice.customerAddress || "");
      setDeliveryFee(invoice.deliveryFee?.toString() || "0");
      setDiscount(invoice.discount?.toString() || "0");
      setNote(invoice.note || "");
      
      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice?.toString() || "0",
          }))
        );
      }
    }
  }, [invoice]);

  const handleSave = () => {
    if (!invoiceId || !customerName.trim() || items.some(i => !i.productName.trim())) {
      toast.error(language === "en" ? "Please fill all fields" : "အားလုံး ဖြည့်ပါ");
      return;
    }

    updateMutation.mutate({
      id: invoiceId,
      customerName,
      customerPhone,
      customerAddress,
      items: items.map(i => ({ ...i, quantity: Number(i.quantity) })),
      deliveryFee,
      discount,
      note,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            {language === "en" ? "Invoice not found" : "ပြေစာ မတွေ့ရှိပါ"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.unitPrice || "0"), 0);
  const total = subtotal + parseFloat(deliveryFee || "0") - parseFloat(discount || "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/staff/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "en" ? "Edit Invoice" : "ပြေစာ ပြင်ဆင်ပါ"} #{invoice.invoiceNumber}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === "en" ? "Customer Details" : "ဆိုင်ခွင်း အသေးစိတ်"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{language === "en" ? "Customer Name" : "ဆိုင်ခွင်း အမည်"}</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <Label>{language === "en" ? "Phone" : "ဖုန်း"}</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>{language === "en" ? "Address" : "လိပ်စာ"}</Label>
            <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === "en" ? "Items" : "ပစ္စည်းများ"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems([...items, { productName: "", quantity: 1, unitPrice: "0" }])}
          >
            + {language === "en" ? "Add Item" : "ပစ္စည်း ထည့်ပါ"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === "en" ? "Charges & Discounts" : "အခကြေးခ & လျှော့ဈေး"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{language === "en" ? "Delivery Fee" : "ပို့ဆောင်ခ"}</Label>
              <Input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} type="number" />
            </div>
            <div>
              <Label>{language === "en" ? "Discount" : "လျှော့ဈေး"}</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} type="number" />
            </div>
            <div>
              <Label>{language === "en" ? "Total" : "စုစုပေါင်း"}</Label>
              <div className="p-2 bg-gray-100 rounded text-lg font-bold text-green-600">
                {Math.round(total).toLocaleString()} MMK
              </div>
            </div>
          </div>
          <div>
            <Label>{language === "en" ? "Notes" : "မှတ်ချက်များ"}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={language === "en" ? "Optional notes" : "ရွေးချယ်ခွင့် မှတ်ချက်"} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => navigate("/staff/invoices")} variant="outline">
          {language === "en" ? "Cancel" : "ပယ်ဖျက်ပါ"}
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "..." : (language === "en" ? "Save Changes" : "ပြင်ဆင်မှု သိမ်းဆည်းပါ")}
        </Button>
      </div>
    </div>
  );
}
