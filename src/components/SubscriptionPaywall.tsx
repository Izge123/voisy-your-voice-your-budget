import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysRemaining?: number;
}

export const SubscriptionPaywall = ({ open, onOpenChange, daysRemaining }: SubscriptionPaywallProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const content = (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">
          {daysRemaining !== undefined && daysRemaining > 0 
            ? `Триал заканчивается через ${daysRemaining} дн.`
            : "Ваш триал закончился"
          }
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          Чтобы продолжить использовать все функции Kapitallo, оформите подписку PRO
        </p>
        
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold">Kapitallo PRO — $4.99/мес</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-secondary">✓</span> Безлимитный голосовой ввод
            </li>
            <li className="flex items-center gap-2">
              <span className="text-secondary">✓</span> Умный сплит транзакций
            </li>
            <li className="flex items-center gap-2">
              <span className="text-secondary">✓</span> AI финансовый консультант
            </li>
            <li className="flex items-center gap-2">
              <span className="text-secondary">✓</span> Кастомные категории
            </li>
          </ul>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={() => {
            onOpenChange(false);
            navigate('/app/settings/subscription');
          }}
        >
          <Crown className="h-4 w-4 mr-2" />
          Оформить подписку
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Позже
        </Button>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-8">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};