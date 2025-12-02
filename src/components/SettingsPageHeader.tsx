import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsPageHeaderProps {
  title: string;
}

const SettingsPageHeader = ({ title }: SettingsPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/app/settings")}
        className="h-10 w-10 rounded-xl"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold text-foreground font-manrope">{title}</h1>
    </div>
  );
};

export default SettingsPageHeader;
