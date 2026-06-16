import { useOfflineState } from "@/hooks/useOfflineState";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const { isOnline, lastSyncTime } = useOfflineState();
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Hide after 3 seconds when coming back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  const lastSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString()
    : "Never";

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 rounded-lg shadow-lg p-4 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 ${
        isOnline
          ? "bg-green-50 border border-green-200"
          : "bg-amber-50 border border-amber-200"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900">
              {language === "en" ? "Back Online" : "အွန်လိုင်းပြန်လည်ဆက်သွယ်ပြီး"}
            </p>
            <p className="text-xs text-green-700">
              {language === "en"
                ? `Last synced: ${lastSync}`
                : `နောက်ဆုံးအဆင့်မြှင့်တင်မှု: ${lastSync}`}
            </p>
          </div>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">
              {language === "en"
                ? "You are offline"
                : "သင်သည် အွန်လိုင်းမဟုတ်ပါ"}
            </p>
            <p className="text-xs text-amber-700">
              {language === "en"
                ? "Some features may be limited"
                : "အချို့လုပ်ဆောင်ချက်များ ကန့်သတ်ထားနိုင်သည်"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
