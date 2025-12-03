import { useState, useRef, useEffect } from "react";
import { Trash2, Mic, Send, Sparkles, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { subscription, canPerformAction } = useSubscription();
  const navigate = useNavigate();

  const suggestedQuestions = [
    "Как мне сэкономить?",
    "Проанализируй мои траты за неделю",
    "Сколько я могу тратить в день?"
  ];

  // Mock AI responses
  const getAIResponse = (userMessage: string): string => {
    const responses: { [key: string]: string } = {
      "как мне сэкономить": "На основе ваших трат вижу, что больше всего уходит на кафе и доставку еды. Попробуйте готовить дома чаще — это может сэкономить до $320 в месяц. Также рекомендую установить лимит в $15 на день для развлечений.",
      "проанализируй": "За последнюю неделю вы потратили $1,240. Основные категории: Продукты (35%), Транспорт (28%), Кафе (22%). Это на 15% больше, чем в прошлую неделю. Рекомендую сократить походы в кафе.",
      "сколько могу тратить": "Исходя из вашего бюджета $12,450 и средних расходов $2,450/месяц, вы можете тратить примерно $80 в день. Сейчас вы тратите в среднем $45/день, так что у вас есть запас!",
    };

    const lowercaseMessage = userMessage.toLowerCase();
    for (const key in responses) {
      if (lowercaseMessage.includes(key)) {
        return responses[key];
      }
    }

    return "Спасибо за вопрос! Я проанализирую ваши данные и подготовлю ответ. Могу помочь вам с анализом расходов, советами по экономии и планированием бюджета.";
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!canPerformAction) {
      setShowPaywall(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show locked state for expired subscription
  if (!canPerformAction && subscription?.status === 'expired') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-background">
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 md:h-12 md:w-12">
              <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white">
                <Sparkles className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-manrope text-foreground">
                Voisy Assistant
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground font-inter">Заблокирован</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-xl font-bold font-manrope">AI чат заблокирован</h2>
            <p className="text-muted-foreground text-sm">
              Ваш пробный период закончился. Оформите подписку PRO, чтобы продолжить использовать AI консультанта.
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={() => navigate('/app/settings/subscription')}
          >
            <Crown className="h-4 w-4 mr-2" />
            Оформить подписку
          </Button>
        </div>
        
        <SubscriptionPaywall 
          open={showPaywall} 
          onOpenChange={setShowPaywall}
          daysRemaining={subscription?.daysRemaining}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-background">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white">
              <Sparkles className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg md:text-xl font-bold font-manrope text-foreground">
              Voisy Assistant
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs text-muted-foreground font-inter">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleClearChat}
        >
          <Trash2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      {/* CHAT AREA */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-manrope text-foreground">
                Привет! Я ваш финансовый помощник
              </h2>
              <p className="text-muted-foreground font-inter max-w-md">
                Могу помочь проанализировать траты, дать советы по экономии и ответить на вопросы о вашем бюджете.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-3 w-full max-w-md">
              <p className="text-sm text-muted-foreground font-inter text-center">
                Попробуйте спросить:
              </p>
              <div className="flex flex-col gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <span className="font-inter text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl",
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}
                >
                  <p className="text-sm font-inter leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span
                    className={cn(
                      "text-xs mt-2 block",
                      message.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      А
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* INPUT AREA */}
      <div className="p-4 md:p-6 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <Mic className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="pr-12 h-12 rounded-2xl bg-background border-2 focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="shrink-0 rounded-full w-12 h-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <SubscriptionPaywall 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        daysRemaining={subscription?.daysRemaining}
      />
    </div>
  );
};

export default AIChat;
