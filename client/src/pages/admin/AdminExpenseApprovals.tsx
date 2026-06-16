import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export default function AdminExpenseApprovals() {
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: expenses, isLoading, refetch } = trpc.expenses.getMyExpenses.useQuery();
  const approveMutation = trpc.expenses.approve.useMutation();
  const rejectMutation = trpc.expenses.reject.useMutation();

  const handleApprove = async (id: number) => {
    await approveMutation.mutateAsync({ id });
    refetch();
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason) return;
    await rejectMutation.mutateAsync({ id: rejectId, reason: rejectReason });
    setRejectId(null);
    setRejectReason("");
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

  const pendingExpenses = expenses?.filter((e: any) => !e.isApproved) || [];
  const approvedExpenses = expenses?.filter((e: any) => e.isApproved) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">အခကြေး အတည်ပြုခြင်း | Expense Approvals</h1>
        <p className="text-gray-600 mt-1">Staff အခကြေးများ အတည်ပြုပါ</p>
      </div>

      {/* Pending Expenses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">အစောင့်ဆိုင်း | Pending ({pendingExpenses.length})</h2>
        <div className="grid gap-4">
          {pendingExpenses.map((exp: any) => (
            <Card key={exp.id} className="p-4 border-yellow-200 bg-yellow-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{exp.staffName}</p>
                      <p className="text-sm text-gray-600">{exp.date?.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm">{categoryLabels[exp.category as keyof typeof categoryLabels]}</p>
                    </div>
                    <div className="text-2xl font-bold text-teal-600">{exp.amount} MMK</div>
                  </div>
                  {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(exp.id)} className="bg-green-600">
                    အတည်ပြုပါ | Approve
                  </Button>
                  <Button onClick={() => setRejectId(exp.id)} variant="destructive">
                    ငြင်းပယ်ပါ | Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Reject Dialog */}
      {rejectId && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="space-y-3">
            <Label>ငြင်းပယ်ရန်ကြောင်း | Rejection Reason</Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ငြင်းပယ်ရန်ကြောင်းရေးပါ..."
            />
            <div className="flex gap-2">
              <Button onClick={handleReject} className="bg-red-600">ငြင်းပယ်ပါ | Reject</Button>
              <Button onClick={() => { setRejectId(null); setRejectReason(""); }} variant="outline">ပယ်ဖျက်ပါ | Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Approved Expenses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">အတည်ပြုပြီး | Approved ({approvedExpenses.length})</h2>
        <div className="grid gap-4">
          {approvedExpenses.map((exp: any) => (
            <Card key={exp.id} className="p-4 border-green-200 bg-green-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{exp.staffName}</p>
                      <p className="text-sm text-gray-600">{exp.date?.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm">{categoryLabels[exp.category as keyof typeof categoryLabels]}</p>
                    </div>
                    <div className="text-2xl font-bold text-teal-600">{exp.amount} MMK</div>
                  </div>
                  {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
                  <p className="mt-2 text-xs text-green-700">✓ Approved by {exp.approvedBy} on {exp.approvedDate?.toString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
