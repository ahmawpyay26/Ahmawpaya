import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { useRealtimeAuditLogs } from "@/hooks/useRealtimeAuditLogs";

export default function AdminAuditLogs() {
  const { language } = useLanguage();
  const { logs: auditLogs } = useRealtimeAuditLogs();

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
  };

  const actionIcons: Record<string, string> = {
    create: "➕",
    update: "✏️",
    delete: "🗑️",
  };

  const getDetailText = (log: any) => {
    if (log.action === "create" && log.newData) {
      const data = log.newData as Record<string, unknown>;
      return `${language === "en" ? "Created" : "ဖန်တီးခဲ့သည်"}: ${String(data.customerName || "")}`;
    }
    if (log.action === "update") {
      return language === "en" ? "Modified" : "ပြင်ဆင်ခဲ့သည်";
    }
    if (log.action === "delete" && log.oldData) {
      const data = log.oldData as Record<string, unknown>;
      return `${language === "en" ? "Deleted" : "ဖျက်ခဲ့သည်"}: ${String(data.customerName || "")}`;
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {language === "en" ? "Audit Logs" : "အခြေအနေ မှတ်တမ်းများ"}
        </h1>
        <p className="text-gray-600 text-sm">
          {language === "en"
            ? "Track all staff modifications to invoices"
            : "ဝန်ထမ်းများ ပြေစာများ ပြင်ဆင်မှု အားလုံး ခြေရာခံပါ"}
        </p>
      </div>

      {auditLogs && auditLogs.length > 0 ? (
        <div className="grid gap-4">
          {auditLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Staff" : "ဝန်ထမ်း"}
                    </p>
                    <p className="font-semibold text-sm">{log.staffName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Action" : "လုပ်ဆောင်ချက်"}
                    </p>
                    <Badge className={`${actionColors[log.action] || "bg-gray-100"} text-xs`}>
                      {actionIcons[log.action]} {log.action}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Entity" : "အကြောင်းအရာ"}
                    </p>
                    <p className="text-sm">
                      {log.entityType} #{log.entityLabel || log.entityId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Timestamp" : "အချိန်"}
                    </p>
                    <p className="text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {language === "en" ? "Details" : "အသေးစိတ်"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {getDetailText(log)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {language === "en" ? "No audit logs yet" : "အခြေအနေ မှတ်တမ်း မရှိသေးပါ"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
