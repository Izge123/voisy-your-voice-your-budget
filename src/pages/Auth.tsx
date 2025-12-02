import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AudioWaveform, Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Некорректный email адрес" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
});

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }).max(100),
  email: z.string().email({ message: "Некорректный email адрес" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ fullName: "", email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/app/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (!error) {
      navigate("/app/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(registerData);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(registerData.email, registerData.password, registerData.fullName);
    setIsLoading(false);

    if (!error) {
      navigate("/app/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = z.string().email();
    const result = emailValidation.safeParse(resetEmail);
    
    if (!result.success) {
      setErrors({ resetEmail: "Некорректный email адрес" });
      return;
    }

    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
    setResetDialogOpen(false);
    setResetEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <AudioWaveform className="h-10 w-10 text-primary" />
          <span className="text-3xl font-extrabold font-manrope text-primary">Voisy</span>
        </div>

        {/* Auth Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-inter">Вход</TabsTrigger>
              <TabsTrigger value="register" className="font-inter">Регистрация</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-inter">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 font-inter"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive font-inter">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-inter">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 font-inter"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive font-inter">{errors.password}</p>}
                </div>

                <div className="flex justify-end">
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline font-inter"
                      >
                        Забыли пароль?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-manrope">Восстановление пароля</DialogTitle>
                        <DialogDescription className="font-inter">
                          Введите ваш email, и мы отправим вам ссылку для сброса пароля
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="font-inter">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="your@email.com"
                            className="font-inter"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            disabled={isLoading}
                          />
                          {errors.resetEmail && <p className="text-sm text-destructive font-inter">{errors.resetEmail}</p>}
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full rounded-full font-inter"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить ссылку"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full font-inter"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Вход..." : "Войти"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-inter">или</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full font-inter"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Продолжить с Google
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="font-inter">Полное имя</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Иван Иванов"
                      className="pl-10 font-inter"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive font-inter">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="font-inter">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 font-inter"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive font-inter">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="font-inter">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 font-inter"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive font-inter">{errors.password}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full font-inter mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Регистрация..." : "Начать бесплатно"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-inter">или</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full font-inter"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Продолжить с Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground font-inter mt-6">
          Нажимая кнопку, вы принимаете наши условия использования
        </p>
      </div>
    </div>
  );
};

export default Auth;
