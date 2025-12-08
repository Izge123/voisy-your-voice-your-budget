import { useState, useRef, useEffect } from "react";
import { Trash2, Send, Sparkles, Lock, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = "https://xnkbciknqvnmienxiwdg.supabase.co/functions/v1/ai-chat";

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { subscription, canPerformAction } = useSubscription();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const suggestedQuestions = [
    "Как мне сэкономить?",
    "Проанализируй мои траты за месяц",
    "Сколько я могу тратить в день?"
  ];

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
    if (!inputValue.trim() || isTyping) return;
    
    if (!canPerformAction) {
      setShowPaywall(true);
      return;
    }

    if (!user) {
      toast.error("Необходимо авторизоваться");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Prepare messages for API (without id and timestamp)
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user.id
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Слишком много запросов. Попробуйте позже.");
          setIsTyping(false);
          return;
        }
        if (response.status === 402) {
          toast.error("Недостаточно средств. Пополните баланс Lovable AI.");
          setIsTyping(false);
          return;
        }
        throw new Error("Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      // Create initial assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              // Update the last assistant message
              setMessages(prev => 
                prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Ошибка при отправке сообщения");
      // Remove the empty assistant message if error occurred
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setIsTyping(false);
    }
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
                Kapitallo Assistant
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
                Kapitallo Assistant
              </h1>
              <div className="flex items-center gap-2">
                {isTyping ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-xs text-primary font-inter">Печатает...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-xs text-muted-foreground font-inter">Online</span>
                  </>
                )}
              </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleClearChat}
          disabled={messages.length === 0}
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
                Привет{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </h2>
              <p className="text-muted-foreground font-inter max-w-md">
                Я ваш персональный финансовый помощник. Могу проанализировать ваши траты, дать советы по экономии и ответить на вопросы о бюджете.
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
                    {message.content || (message.role === "assistant" && isTyping ? "..." : "")}
                  </p>
                  {message.content && (
                    <span
                      className={cn(
                        "text-xs mt-2 block",
                        message.role === "user" ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* INPUT AREA */}
      <div className="p-4 md:p-6 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="pr-12 h-12 rounded-2xl bg-background border-2 focus-visible:ring-0 focus-visible:border-primary"
              disabled={isTyping}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="shrink-0 rounded-full w-12 h-12"
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
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
