import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export default function StaffExpenses() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "fuel",
    amount: "",
    description: "",
    receiptUrl: "",
  });

  const { data: expenses, isLoading, refetch } = trpc.expenses.getMyExpenses.useQuery();
  const createMutation = trpc.expenses.create.useMutation();
  const deleteMutation = trpc.expenses.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.amount) return;
    await createMutation.mutateAsync({ ...formData, category: formData.category as any });
    setFormData({ date: new Date().toISOString().split("T")[0], category: "fuel", amount: "", description: "", receiptUrl: "" });
    setIsCreateOpen(false);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    setDeleteId(null);
    refetch();
  };

  const categoryLabels: Record<string, string> = {
    fuel: "ဆီ",
    meals: "အစားအသောက်",
    transport: "သယ်ယူပို့ဆောင်ခြင်း",
    maintenance: "ပြုပြင်ထိန်းသိမ်းခြင်း",
    supplies: "ပစ္စည်းများ",
    other: "အခြား",
  };

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">အခကြေးများ | Expenses</h1>
          <p className="text-gray-600 mt-1">နေ့စဉ်အခကြေးများ မှတ်တမ်းတင်ပါ</p>
        </div>
        <Button onClick={() => setIsCreateOpen(!isCreateOpen)}>
          အခကြေး ထည့်သွင်းပါ | Add Expense
        </Button>
      </div>

      {isCreateOpen && (
        <Card className="p-6 bg-blue-50">
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
              <Button onClick={handleCreate} className="flex-1">သိမ်းဆည်းပါ | Save</Button>
              <Button onClick={() => setIsCreateOpen(false)} variant="outline" className="flex-1">ပယ်ဖျက်ပါ | Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {expenses?.map((exp) => (
          <Card key={exp.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">{categoryLabels[exp.category as keyof typeof categoryLabels]}</p>
                    <p className="text-sm text-gray-600">{exp.date?.toString()}</p>
                  </div>
                  <div className="text-2xl font-bold text-teal-600">{exp.amount} MMK</div>
                </div>
                {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
                <div className="mt-2 flex items-center gap-2">
                  {exp.isApproved ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Approved</span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⏳ Pending</span>
                  )}
                </div>
              </div>
              {!exp.isApproved && (
                <Button variant="destructive" size="sm" onClick={() => setDeleteId(exp.id)}>
                  ဖျက်ပါ
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {deleteId && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="mb-3">အခကြေး ဖျက်ပါ? ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြုလုပ်၍မရပါ။</p>
          <div className="flex gap-2">
            <Button onClick={() => handleDelete(deleteId)} className="bg-red-600">ဖျက်ပါ | Delete</Button>
            <Button onClick={() => setDeleteId(null)} variant="outline">ပယ်ဖျက်ပါ | Cancel</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
