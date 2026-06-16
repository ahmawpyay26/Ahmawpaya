import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1 text-[10px] px-2 h-6 font-medium"
    >
      <Globe className="h-3 w-3" />
      {language === "en" ? "မြန်မာ" : "EN"}
    </Button>
  );
}
