import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export default function StaffExpenseEdit() {
  const [, params] = useRoute("/staff/expenses/:id/edit");
  const [, navigate] = useLocation();
  const expenseId = params?.id ? parseInt(params.id) : 0;

  const [formData, setFormData] = useState({
    date: "",
    category: "fuel",
    amount: "",
    description: "",
    receiptUrl: "",
  });

  const { data: expenses, isLoading } = trpc.expenses.getMyExpenses.useQuery();
  const updateMutation = trpc.expenses.update.useMutation();

  const expense = expenses?.find((e) => e.id === expenseId);

  useEffect(() => {
    if (expense && !expense.isApproved) {
      setFormData({
        date: expense.date?.toString().split("T")[0] || "",
        category: expense.category || "fuel",
        amount: expense.amount?.toString() || "",
        description: expense.description || "",
        receiptUrl: expense.receiptUrl || "",
      });
    }
  }, [expense]);

  const handleSave = async () => {
    if (!formData.amount) return;
    await updateMutation.mutateAsync({
      id: expenseId,
      ...formData,
      category: formData.category as any,
    });
    navigate("/staff/expenses");
  };

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (!expense) return <div className="p-4 text-red-600">အခကြေး မတွေ့ရှိပါ</div>;
  if (expense.isApproved) return <div className="p-4 text-red-600">အတည်ပြုပြီးသော အခကြေးများ ပြင်ဆင်၍မရပါ</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">အခကြေး ပြင်ဆင်ပါ | Edit Expense</h1>
        <p className="text-gray-600 mt-1">အခကြေးအသေးစိတ် ပြင်ဆင်ပါ</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>နေ့စွဲ | Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <Label>အမျိုးအစား | Category</Label>
              <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">ဆီ</SelectItem>
                  <SelectItem value="meals">အစားအသောက်</SelectItem>
                  <SelectItem value="transport">သယ်ယူပို့ဆောင်ခြင်း</SelectItem>
                  <SelectItem value="maintenance">ပြုပြင်ထိန်းသိမ်းခြင်း</SelectItem>
                  <SelectItem value="supplies">ပစ္စည်းများ</SelectItem>
                  <SelectItem value="other">အခြား</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>ပမာဏ (MMK) | Amount</Label>
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div>
            <Label>ဖော်ပြချက် | Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <Label>ငွေတောင်းခံလွှာ URL | Receipt URL</Label>
            <Input value={formData.receiptUrl} onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">သိမ်းဆည်းပါ | Save</Button>
            <Button onClick={() => navigate("/staff/expenses")} variant="outline" className="flex-1">ပယ်ဖျက်ပါ | Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
