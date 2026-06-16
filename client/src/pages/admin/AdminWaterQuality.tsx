import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Droplets, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminWaterQuality() {
  const { language } = useLanguage();
  const [openCreate, setOpenCreate] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);
  const [pH, setPH] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [chlorineLevel, setChlorineLevel] = useState("");
  const [notes, setNotes] = useState("");

  const { data: inspections, refetch } = trpc.waterQuality.list.useQuery();
  const createMutation = trpc.waterQuality.create.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Inspection recorded" : "စစ်ဆေးချက် မှတ်တမ်းတင်ပြီးပါပြီ");
      setOpenCreate(false);
      setPH("");
      setTurbidity("");
      setChlorineLevel("");
      setNotes("");
      refetch();
    },
  });

  const deleteMutation = trpc.waterQuality.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Inspection deleted" : "စစ်ဆေးချက် ဖျက်ပြီးပါပြီ");
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Droplets className="h-8 w-8 text-cyan-600" />
          {language === "en" ? "Water Quality Inspection" : "ရေအရည်အသွေး စစ်ဆေးချက်"}
        </h1>
        <Button
          onClick={() => setOpenCreate(true)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {language === "en" ? "New Inspection" : "အသစ် စစ်ဆေးချက်"}
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "en" ? "Record Water Quality Inspection" : "ရေအရည်အသွေး စစ်ဆေးချက် မှတ်တမ်းတင်ပါ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === "en" ? "Inspection Date" : "စစ်ဆေးချက်နေ့"}</Label>
              <Input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </div>
            <div>
              <Label>pH Level</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 7.5"
                value={pH}
                onChange={(e) => setPH(e.target.value)}
              />
            </div>
            <div>
              <Label>{language === "en" ? "Turbidity (NTU)" : "ရေ၏ အရှင်းအရုံး (NTU)"}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 0.5"
                value={turbidity}
                onChange={(e) => setTurbidity(e.target.value)}
              />
            </div>
            <div>
              <Label>{language === "en" ? "Chlorine Level (mg/L)" : "ကလိုရင်း ပမာဏ (mg/L)"}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 0.2"
                value={chlorineLevel}
                onChange={(e) => setChlorineLevel(e.target.value)}
              />
            </div>
            <div>
              <Label>{language === "en" ? "Notes" : "မှတ်ချက်များ"}</Label>
              <Textarea
                placeholder={language === "en" ? "Optional notes..." : "မှတ်ချက်များ (ရွေးချယ်ခွင့်)..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                if (!pH || !turbidity || !chlorineLevel) {
                  toast.error(language === "en" ? "Please fill all required fields" : "လိုအပ်သော အင်္ဂတွေ ဖြည့်ပါ");
                  return;
                }
                createMutation.mutate({
                  inspectionDate,
                  pH: parseFloat(pH),
                  turbidity: parseFloat(turbidity),
                  chlorineLevel: parseFloat(chlorineLevel),
                  notes: notes || undefined,
                });
              }}
              disabled={createMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {createMutation.isPending ? "..." : (language === "en" ? "Record" : "မှတ်တမ်းတင်ပါ")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspections List */}
      <div className="grid gap-4">
        {inspections && inspections.length > 0 ? (
          inspections.map((inspection: any) => (
            <Card key={inspection.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-start">
                  <div>
                    <p className="text-sm text-gray-500">{language === "en" ? "Date" : "နေ့"}</p>
                    <p className="font-semibold">{new Date(inspection.inspectionDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">pH</p>
                    <p className="font-semibold">{inspection.pH}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{language === "en" ? "Turbidity" : "အရှင်းအရုံး"}</p>
                    <p className="font-semibold">{inspection.turbidity} NTU</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{language === "en" ? "Chlorine" : "ကလိုရင်း"}</p>
                    <p className="font-semibold">{inspection.chlorineLevel} mg/L</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: inspection.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {inspection.notes && (
                  <p className="text-sm text-gray-600 mt-2">{inspection.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Droplets className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                {language === "en" ? "No inspections recorded yet" : "စစ်ဆေးချက် မှတ်တမ်းမရှိသေးပါ"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
