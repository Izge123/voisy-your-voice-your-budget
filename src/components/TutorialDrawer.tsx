import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

interface TutorialDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: TutorialStep[];
  onComplete: () => void;
}

const TutorialDrawer = ({ open, onOpenChange, steps, onComplete }: TutorialDrawerProps) => {
  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-xl">Быстрый старт 🚀</DrawerTitle>
          <DrawerDescription>
            4 шага к управлению финансами голосом
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-3 overflow-y-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border"
            >
              <div className="text-3xl shrink-0">{step.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">
                  {index + 1}. {step.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={handleComplete} className="w-full gap-2">
            <Check className="h-4 w-4" />
            Понятно, начинаем!
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TutorialDrawer;
