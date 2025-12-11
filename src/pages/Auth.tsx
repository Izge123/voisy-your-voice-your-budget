import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
const loginSchema = z.object({
  email: z.string().email({
    message: "Некорректный email адрес"
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов"
  })
});
const registerSchema = z.object({
  fullName: z.string().min(2, {
    message: "Имя должно содержать минимум 2 символа"
  }).max(100),
  email: z.string().email({
    message: "Некорректный email адрес"
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов"
  })
});
const Auth = () => {
  const [searchParams] = useSearchParams();
  const isRecovery = searchParams.get("type") === "recovery";
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [promoCode, setPromoCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  useEffect(() => {
    if (user && !isRecovery) {
      navigate("/app/dashboard");
    }
  }, [user, navigate, isRecovery]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: {
        [key: string]: string;
      } = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await signIn(loginData.email, loginData.password);
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
      const fieldErrors: {
        [key: string]: string;
      } = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(
      registerData.email, 
      registerData.password, 
      registerData.fullName,
      promoCode.trim() || undefined
    );
    
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
      setErrors({
        resetEmail: "Некорректный email адрес"
      });
      return;
    }
    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
    setResetDialogOpen(false);
    setResetEmail("");
  };
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (newPassword.length < 6) {
      setErrors({
        newPassword: "Пароль должен содержать минимум 6 символов"
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({
        confirmPassword: "Пароли не совпадают"
      });
      return;
    }
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password: newPassword
    });
    setIsLoading(false);
    if (!error) {
      navigate("/app/dashboard");
    }
  };

  // Recovery mode - show password update form
  if (isRecovery) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
            <img src="/kapitallo-logo.svg" alt="Kapitallo" className="h-10 w-10" />
            <span className="text-3xl font-extrabold font-manrope text-primary">Kapitallo</span>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 animate-fade-in" style={{
          animationDelay: '100ms'
        }}>
            <h2 className="text-2xl font-bold font-manrope mb-2">Новый пароль</h2>
            <p className="text-muted-foreground mb-6 font-inter">Введите новый пароль для вашего аккаунта</p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="font-inter">Новый пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input id="new-password" type={showNewPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 font-inter" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLoading} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-sm text-destructive font-inter">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-inter">Подтвердите пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input id="confirm-password" type="password" placeholder="••••••••" className="pl-10 font-inter" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive font-inter">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full rounded-full font-inter" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? "Сохранение..." : "Сохранить пароль"}
              </Button>
            </form>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <img src="/kapitallo-logo.svg" alt="Kapitallo" className="h-10 w-10" />
          
        </div>

        {/* Auth Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 animate-fade-in" style={{
        animationDelay: '100ms'
      }}>
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
                    <Input id="login-email" type="email" placeholder="your@email.com" className="pl-10 font-inter" value={loginData.email} onChange={e => setLoginData({
                    ...loginData,
                    email: e.target.value
                  })} disabled={isLoading} />
                  </div>
                  {errors.email && <p className="text-sm text-destructive font-inter">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-inter">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 font-inter" value={loginData.password} onChange={e => setLoginData({
                    ...loginData,
                    password: e.target.value
                  })} disabled={isLoading} />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive font-inter">{errors.password}</p>}
                </div>

                <div className="flex justify-end">
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <button type="button" className="text-sm text-primary hover:underline font-inter">
                        Забыли пароль?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-manrope text-xl">Восстановление пароля</DialogTitle>
                        <DialogDescription className="font-inter text-sm">
                          Введите ваш email, и мы отправим вам ссылку для сброса пароля
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="font-inter">Email</Label>
                          <Input 
                            id="reset-email" 
                            type="email" 
                            placeholder="your@email.com" 
                            className="font-inter h-12" 
                            value={resetEmail} 
                            onChange={e => setResetEmail(e.target.value)} 
                            disabled={isLoading} 
                          />
                          {errors.resetEmail && <p className="text-sm text-destructive font-inter">{errors.resetEmail}</p>}
                        </div>
                        <Button type="submit" className="w-full rounded-full font-inter h-12" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить ссылку"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button type="submit" className="w-full rounded-full font-inter" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Вход..." : "Войти"}
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
                    <Input id="register-name" type="text" placeholder="Иван Иванов" className="pl-10 font-inter" value={registerData.fullName} onChange={e => setRegisterData({
                    ...registerData,
                    fullName: e.target.value
                  })} disabled={isLoading} />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive font-inter">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="font-inter">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="register-email" type="email" placeholder="your@email.com" className="pl-10 font-inter" value={registerData.email} onChange={e => setRegisterData({
                    ...registerData,
                    email: e.target.value
                  })} disabled={isLoading} />
                  </div>
                  {errors.email && <p className="text-sm text-destructive font-inter">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="font-inter">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="register-password" type={showRegisterPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 font-inter" value={registerData.password} onChange={e => setRegisterData({
                    ...registerData,
                    password: e.target.value
                  })} disabled={isLoading} />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive font-inter">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-promo" className="font-inter">Промокод (если есть)</Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="register-promo" 
                      type="text" 
                      placeholder="PROMO2024" 
                      className="pl-10 font-inter uppercase" 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value.toUpperCase())} 
                      disabled={isLoading} 
                    />
                  </div>
                  {errors.promoCode && <p className="text-sm text-destructive font-inter">{errors.promoCode}</p>}
                </div>

                <Button type="submit" className="w-full rounded-full font-inter mt-6" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Регистрация..." : "Начать бесплатно"}
                </Button>

                

                
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground font-inter mt-6">
          Нажимая кнопку, вы принимаете{" "}
          <Link to="/offer" className="text-primary hover:underline">
            условия использования
          </Link>{" "}
          и{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            политику конфиденциальности
          </Link>
        </p>
      </div>
    </div>;
};
export default Auth;