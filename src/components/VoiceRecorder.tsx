import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";

interface ParsedTransaction {
  amount: number;
  category_id: string | null;
  type: 'income' | 'expense';
  description: string;
}

interface VoiceRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoiceRecorder = ({ open, onOpenChange }: VoiceRecorderProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { toast } = useToast();
  const { profile } = useProfile();
  const currency = profile?.currency || 'USD';

  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'preview' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording, reset } = useVoiceRecording({
    onRecordingComplete: handleRecordingComplete,
    onError: (error) => {
      console.error('Recording error:', error);
      setStatus('error');
      setErrorMessage('Не удалось получить доступ к микрофону');
    }
  });

  // Автоматический старт записи при открытии
  const hasAutoStarted = useRef(false);
  
  useEffect(() => {
    if (open && status === 'idle' && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      // Небольшая задержка чтобы UI успел отрисоваться
      const timer = setTimeout(() => {
        handleStart();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, status]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
      reset(); // Принудительный сброс таймера и записи
      hasAutoStarted.current = false;
      setStatus('idle');
      setTranscript('');
      setParsedTransactions([]);
      setErrorMessage('');
    }
  }, [open, reset]);

  async function handleRecordingComplete(audioBlob: Blob, audioBase64: string) {
    if (!user) return;
    
    setStatus('processing');
    
    try {
      const { data, error } = await supabase.functions.invoke('process-voice', {
        body: { audio: audioBase64, userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        setTranscript(data.transcript);
        setParsedTransactions(data.transactions);
        setStatus('preview');
      } else {
        throw new Error(data.error || 'Failed to process audio');
      }
    } catch (error) {
      console.error('Error processing voice:', error);
      setStatus('error');
      setErrorMessage('Не удалось обработать запись. Попробуйте еще раз.');
    }
  }

  const handleStart = () => {
    setStatus('recording');
    setTranscript('');
    setParsedTransactions([]);
    setErrorMessage('');
    startRecording();
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleCancel = () => {
    cancelRecording();
    setStatus('idle');
    setTranscript('');
    setParsedTransactions([]);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!user) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      for (const tx of parsedTransactions) {
        await addTransaction({
          amount: tx.amount,
          category_id: tx.category_id,
          currency: currency,
          date: today,
          description: tx.description,
          type: tx.type,
        });
      }

      toast({
        title: "Успешно",
        description: `Добавлено ${parsedTransactions.length} транзакций`,
      });

      onOpenChange(false);
      setStatus('idle');
      setParsedTransactions([]);
    } catch (error) {
      console.error('Error saving transactions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить транзакции",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const RecorderContent = () => (
    <div className="space-y-6 py-4">
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Подготовка микрофона...
          </p>
        </div>
      )}

      {status === 'recording' && (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-75" />
            <Button
              onClick={handleStop}
              size="icon"
              variant="destructive"
              className="w-24 h-24 rounded-full shadow-2xl relative z-10"
            >
              <Square className="h-10 w-10 fill-current" />
            </Button>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold font-manrope tabular-nums">
              {formatTime(recordingTime)}
            </p>
            <p className="text-sm text-muted-foreground">Идет запись...</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            Отмена
          </Button>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Обрабатываю запись...
          </p>
        </div>
      )}

      {status === 'preview' && (() => {
        const missingCategories = parsedTransactions.filter(tx => 
          !tx.category_id || !categories.find(cat => cat.id === tx.category_id)
        );
        const hasMissingCategories = missingCategories.length > 0;

        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Распознано:</p>
              <Card className="p-4 bg-muted/50">
                <p className="text-sm">{transcript}</p>
              </Card>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Найдено транзакций: {parsedTransactions.length}
              </p>
              <div className="space-y-2">
                {parsedTransactions.map((tx, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{tx.description}</p>
                        <Badge variant={tx.type === 'expense' ? 'destructive' : 'default'}>
                          {tx.type === 'expense' ? 'Расход' : 'Доход'}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-lg font-bold font-manrope",
                        tx.type === 'expense' ? 'text-rose-600' : 'text-secondary'
                      )}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                      </p>
                    </div>
                    {!tx.category_id && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ Категория не найдена
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {hasMissingCategories ? (
              <div className="space-y-4 pt-4">
                <Card className="p-4 bg-destructive/10 border-destructive/20">
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-destructive">
                        Категория не найдена
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Для этой транзакции необходимо создать категорию
                      </p>
                    </div>
                  </div>
                </Card>
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/app/categories');
                  }} 
                  className="w-full"
                >
                  Создать категорию
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Подтвердить
                </Button>
              </div>
            )}
          </div>
        );
      })()}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <Button variant="outline" onClick={handleCancel}>
            Закрыть
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold font-manrope">
              Голосовой ввод
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <RecorderContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-manrope">
            Голосовой ввод
          </DialogTitle>
        </DialogHeader>
        <RecorderContent />
      </DialogContent>
    </Dialog>
  );
};
