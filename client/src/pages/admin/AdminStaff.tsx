import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { UserPlus, Pencil, Trash2, Shield } from "lucide-react";

export default function AdminStaff() {
  return <AdminStaffContent />;
}

function AdminStaffContent() {
  const { t, language } = useLanguage();
  const { data: staffList, refetch } = trpc.staff.list.useQuery();
  const createStaff = trpc.staff.create.useMutation({ onSuccess: () => { refetch(); toast.success(language === "en" ? "Staff created" : "ဝန်ထမ်း ဖန်တီးပြီးပါပြီ"); setCreateOpen(false); resetForm(); } });
  const updateStaff = trpc.staff.update.useMutation({ onSuccess: () => { refetch(); toast.success(language === "en" ? "Staff updated" : "ဝန်ထမ်း ပြင်ဆင်ပြီးပါပြီ"); setEditOpen(false); } });
  const deleteStaff = trpc.staff.delete.useMutation({ onSuccess: () => { refetch(); toast.success(language === "en" ? "Staff deleted" : "ဝန်ထမ်း ဖျက်ပြီးပါပြီ"); setDeleteOpen(false); }, onError: (err) => toast.error(err.message) });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", phone: "" });
  const [editForm, setEditForm] = useState({ id: 0, username: "", fullName: "", phone: "", password: "", isActive: true });

  const resetForm = () => setForm({ username: "", password: "", fullName: "", phone: "" });

  const handleCreate = () => {
    if (!form.username || !form.password || !form.fullName) {
      toast.error(language === "en" ? "All fields required" : "အချက်အလက်အားလုံး ဖြည့်ပါ");
      return;
    }
    createStaff.mutate({ username: form.username, password: form.password, fullName: form.fullName, phone: form.phone || undefined });
  };

  const handleEdit = (staff: any) => {
    setEditForm({ id: staff.id, username: staff.username, fullName: staff.fullName, phone: staff.phone || "", password: "", isActive: staff.isActive });
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editForm.fullName || !editForm.username) {
      toast.error(language === "en" ? "Name and username required" : "အမည်နှင့် username ဖြည့်ပါ");
      return;
    }
    const updateData: any = { id: editForm.id, username: editForm.username, fullName: editForm.fullName, phone: editForm.phone || undefined, isActive: editForm.isActive };
    if (editForm.password) updateData.password = editForm.password;
    updateStaff.mutate(updateData);
  };

  const handleDeleteConfirm = () => {
    if (selectedStaff) deleteStaff.mutate({ id: selectedStaff.id });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("staff")}</h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Manage delivery staff accounts (Create, Edit, Delete)" : "ပို့ဆောင်ရေးဝန်ထမ်း အကောင့်များ စီမံပါ (ဖန်တီး၊ ပြင်ဆင်၊ ဖျက်)"}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1">
            <UserPlus className="h-4 w-4" />
            {language === "en" ? "Add Staff" : "ဝန်ထမ်းထည့်ပါ"}
          </Button>
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "en" ? "Create Staff Account" : "ဝန်ထမ်းအကောင့် ဖန်တီးပါ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "en" ? "Full Name" : "အမည်အပြည့်အစုံ"}</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Aung Kyaw" />
              </div>
              <div>
                <Label>{t("username")}</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. staff1" />
              </div>
              <div>
                <Label>{t("password")}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 4 characters" />
              </div>
              <div>
                <Label>{t("phone")}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxxx" />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createStaff.isPending}>
                {createStaff.isPending ? t("loading") : (language === "en" ? "Create Account" : "အကောင့်ဖန်တီးပါ")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === "en" ? "Edit Staff Account" : "ဝန်ထမ်းအကောင့် ပြင်ဆင်ပါ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "en" ? "Full Name" : "အမည်အပြည့်အစုံ"}</Label>
                <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div>
                <Label>{t("username")}</Label>
                <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
              </div>
              <div>
                <Label>{language === "en" ? "New Password (leave blank to keep current)" : "Password အသစ် (မပြောင်းလိုပါက ဗလာထားပါ)"}</Label>
                <Input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave blank to keep current" />
              </div>
              <div>
                <Label>{t("phone")}</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="h-4 w-4" />
                <Label htmlFor="isActive">{language === "en" ? "Active" : "လုပ်ဆောင်နေ"}</Label>
              </div>
              <Button onClick={handleUpdate} className="w-full" disabled={updateStaff.isPending}>
                {updateStaff.isPending ? t("loading") : (language === "en" ? "Save Changes" : "ပြောင်းလဲမှုများ သိမ်းပါ")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{language === "en" ? "Delete Staff Account" : "ဝန်ထမ်းအကောင့် ဖျက်မည်"}</AlertDialogTitle>
              <AlertDialogDescription>
                {language === "en"
                  ? `Are you sure you want to permanently delete "${selectedStaff?.fullName}"? This action cannot be undone.`
                  : `"${selectedStaff?.fullName}" ကို အပြီးအပိုင် ဖျက်မည်မှာ သေချာပါသလား?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{language === "en" ? "Cancel" : "မလုပ်ပါ"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {language === "en" ? "Delete" : "ဖျက်ပါ"}
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
                    <th className="text-left p-3 font-medium">{language === "en" ? "Full Name" : "အမည်"}</th>
                    <th className="text-left p-3 font-medium">{t("username")}</th>
                    <th className="text-left p-3 font-medium">{t("phone")}</th>
                    <th className="text-left p-3 font-medium">{t("status")}</th>
                    <th className="text-left p-3 font-medium">{language === "en" ? "Actions" : "လုပ်ဆောင်ချက်"}</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList && staffList.length > 0 ? (
                    staffList.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-medium flex items-center gap-2">
                          {s.username === "admin" && <Shield className="h-4 w-4 text-amber-500" />}
                          {s.fullName}
                        </td>
                        <td className="p-3">{s.username}</td>
                        <td className="p-3">{s.phone || "-"}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className={s.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {s.isActive ? (language === "en" ? "Active" : "လုပ်ဆောင်နေ") : (language === "en" ? "Inactive" : "ရပ်ဆိုင်း")}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(s)} className="h-8 w-8 p-0">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {s.username !== "admin" && (
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedStaff(s); setDeleteOpen(true); }} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">{t("noData")}</td>
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
