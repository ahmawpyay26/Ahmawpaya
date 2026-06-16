import { useLanguage } from "@/contexts/LanguageContext";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";
import { MapPin, Plus, Trash2, Users } from "lucide-react";
import { MapView } from "@/components/Map";

const ZONE_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AdminZones() {
  return <AdminZonesContent />;
}

function AdminZonesContent() {
  const { t, language } = useLanguage();
  const utils = trpc.useUtils();
  const { data: zones, isLoading } = trpc.zones.list.useQuery();
  const { data: staffList } = trpc.staff.list.useQuery();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", nameMyanmar: "", color: ZONE_COLORS[0], centerLat: "", centerLng: "", staffId: "" });

  const createZone = trpc.zones.create.useMutation({
    onSuccess: () => {
      utils.zones.list.invalidate();
      setDialogOpen(false);
      setNewZone({ name: "", nameMyanmar: "", color: ZONE_COLORS[0], centerLat: "", centerLng: "", staffId: "" });
      toast.success(language === "en" ? "Zone created" : "ဇုန်ဖန်တီးပြီးပါပြီ");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateZone = trpc.zones.update.useMutation({
    onSuccess: () => {
      utils.zones.list.invalidate();
      toast.success(language === "en" ? "Zone updated" : "ဇုန်ပြင်ဆင်ပြီးပါပြီ");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteZone = trpc.zones.delete.useMutation({
    onSuccess: () => {
      utils.zones.list.invalidate();
      toast.success(language === "en" ? "Zone deleted" : "ဇုန်ဖျက်ပြီးပါပြီ");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Markers will be updated when zones data loads
  }, []);

  // Update markers when zones change
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !zones) return;
    // Clear old markers
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];
    // Add new markers
    zones.forEach((zone) => {
      if (!zone.centerLat || !zone.centerLng) return;
      const markerEl = document.createElement("div");
      markerEl.innerHTML = `<div style="background:${zone.color};color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${zone.name.split(" - ")[0] || zone.name}</div>`;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: { lat: parseFloat(zone.centerLat), lng: parseFloat(zone.centerLng) },
        content: markerEl,
        title: zone.name,
      });
      markersRef.current.push(marker);
    });
  }, [zones]);

  // Call updateMarkers when zones data changes
  if (zones && mapRef.current) {
    setTimeout(updateMarkers, 100);
  }

  const handleCreate = () => {
    if (!newZone.name.trim()) {
      toast.error(language === "en" ? "Zone name is required" : "ဇုန်အမည်ထည့်ပါ");
      return;
    }
    const center = mapRef.current?.getCenter();
    const lat = newZone.centerLat || (center ? center.lat().toString() : "16.8661");
    const lng = newZone.centerLng || (center ? center.lng().toString() : "96.1951");
    createZone.mutate({
      name: newZone.name,
      nameMyanmar: newZone.nameMyanmar || undefined,
      color: newZone.color,
      centerLat: lat,
      centerLng: lng,
      assignedStaffId: newZone.staffId ? parseInt(newZone.staffId) : undefined,
    });
  };

  const handleAssignStaff = (zoneId: number, staffIdStr: string) => {
    const staffId = staffIdStr === "none" ? null : parseInt(staffIdStr);
    updateZone.mutate({ id: zoneId, assignedStaffId: staffId });
  };

  const handleDelete = (id: number) => {
    if (confirm(language === "en" ? "Delete this zone?" : "ဤဇုန်ကို ဖျက်မည်လား?")) {
      deleteZone.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {language === "en" ? "Delivery Zones" : "ပို့ဆောင်ရေး ဇုန်များ"}
            </h1>
            <p className="text-muted-foreground">
              {language === "en" ? "Manage delivery areas and assign staff to zones" : "ပို့ဆောင်ရေးနယ်မြေများ စီမံပြီး ဝန်ထမ်းများကို ဇုန်သတ်မှတ်ပါ"}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            {language === "en" ? "Add Zone" : "ဇုန်ထည့်ပါ"}
          </Button>
        </div>

        {/* Map */}
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <MapView
              className="h-[400px]"
              initialCenter={{ lat: 16.8661, lng: 96.1951 }}
              initialZoom={13}
              onMapReady={handleMapReady}
            />
          </CardContent>
        </Card>

        {/* Zone List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === "en" ? "Loading zones..." : "ဇုန်များ ဖတ်နေသည်..."}
          </div>
        ) : !zones || zones.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {language === "en" ? "No delivery zones yet. Create one to get started." : "ပို့ဆောင်ရေးဇုန် မရှိသေးပါ။ စတင်ရန် ဖန်တီးပါ။"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => {
              const assignedStaff = staffList?.find((s: any) => s.id === zone.assignedStaffId);
              return (
                <Card key={zone.id} className="overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: zone.color }} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                        <div>
                          <h3 className="font-semibold text-sm">
                            {language === "mm" && zone.nameMyanmar ? zone.nameMyanmar : zone.name}
                          </h3>
                          {zone.centerLat && zone.centerLng && (
                            <p className="text-xs text-muted-foreground">
                              📍 {parseFloat(zone.centerLat).toFixed(4)}, {parseFloat(zone.centerLng).toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(zone.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <Select
                        value={zone.assignedStaffId?.toString() || "none"}
                        onValueChange={(val) => handleAssignStaff(zone.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder={language === "en" ? "Assign staff..." : "ဝန်ထမ်းသတ်မှတ်ပါ..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{language === "en" ? "— Unassigned —" : "— မသတ်မှတ်ရသေး —"}</SelectItem>
                          {staffList?.map((s: any) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {assignedStaff && (
                      <Badge variant="secondary" className="text-xs mt-2 gap-1">
                        <Users className="h-3 w-3" />
                        {assignedStaff.fullName}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Zone Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === "en" ? "Add Delivery Zone" : "ပို့ဆောင်ရေးဇုန် ထည့်ပါ"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === "en" ? "Zone Name (English)" : "ဇုန်အမည် (English)"}</Label>
                <Input
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="e.g., Zone E - West"
                />
              </div>
              <div>
                <Label>{language === "en" ? "Zone Name (Myanmar)" : "ဇုန်အမည် (မြန်မာ)"}</Label>
                <Input
                  value={newZone.nameMyanmar}
                  onChange={(e) => setNewZone({ ...newZone, nameMyanmar: e.target.value })}
                  placeholder="e.g., ဇုန် E - အနောက်ဘက်"
                />
              </div>
              <div>
                <Label>{language === "en" ? "Color" : "အရောင်"}</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={newZone.color} onChange={(e) => setNewZone({ ...newZone, color: e.target.value })} className="h-9 w-12 rounded border cursor-pointer" />
                  <Input value={newZone.color} onChange={(e) => setNewZone({ ...newZone, color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{language === "en" ? "Latitude" : "လတ္တီကျုဒ်"}</Label>
                  <Input value={newZone.centerLat} onChange={(e) => setNewZone({ ...newZone, centerLat: e.target.value })} placeholder="16.8661" />
                </div>
                <div>
                  <Label>{language === "en" ? "Longitude" : "လောင်ဂျီကျုဒ်"}</Label>
                  <Input value={newZone.centerLng} onChange={(e) => setNewZone({ ...newZone, centerLng: e.target.value })} placeholder="96.1951" />
                </div>
              </div>
              <div>
                <Label>{language === "en" ? "Assign Staff" : "ဝန်ထမ်းသတ်မှတ်ပါ"}</Label>
                <Select value={newZone.staffId || "none"} onValueChange={(val) => setNewZone({ ...newZone, staffId: val === "none" ? "" : val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "en" ? "Select staff (optional)" : "ဝန်ထမ်းရွေးပါ (ရွေးချယ်ခွင့်)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === "en" ? "— None —" : "— မရွေးပါ —"}</SelectItem>
                    {staffList?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "en"
                  ? "If coordinates are empty, the current map center will be used."
                  : "ကိုဩဒိနိတ်များ ဗလာဖြစ်ပါက လက်ရှိ မြေပုံဗဟိုကို အသုံးပြုပါမည်။"}
              </p>
              <Button onClick={handleCreate} className="w-full" disabled={createZone.isPending}>
                {createZone.isPending ? (language === "en" ? "Creating..." : "ဖန်တီးနေသည်...") : (language === "en" ? "Create Zone" : "ဇုန်ဖန်တီးပါ")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
