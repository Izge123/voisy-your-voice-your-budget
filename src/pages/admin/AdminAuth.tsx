import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

const codeSchema = z.string().min(1, "Введите код доступа");
const emailSchema = z.string().email("Введите корректный email");
const passwordSchema = z.string().min(6, "Минимум 6 символов");

const AdminAuth = () => {
  const navigate = useNavigate();
  const { isCodeVerified, isAdmin, user, verifyCode, signIn } = useAdminAuth();
  
  // Code verification state
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already authenticated as admin
  if (isCodeVerified && user && isAdmin) {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");

    const validation = codeSchema.safeParse(code);
    if (!validation.success) {
      setCodeError(validation.error.errors[0].message);
      return;
    }

    setIsVerifyingCode(true);
    const isValid = await verifyCode(code);
    setIsVerifyingCode(false);

    if (!isValid) {
      setCodeError("Неверный код доступа");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setLoginError(emailValidation.error.errors[0].message);
      return;
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      setLoginError(passwordValidation.error.errors[0].message);
      return;
    }

    setIsLoggingIn(true);
    const { error } = await signIn(email, password);
    setIsLoggingIn(false);

    if (error) {
      setLoginError("Неверный email или пароль");
      return;
    }

    // After successful login, the auth state change will update isAdmin
    // and the redirect check at the top will handle navigation
  };

  // Show "not admin" message if logged in but not admin
  if (isCodeVerified && user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle className="text-2xl text-white">Доступ запрещён</CardTitle>
            <CardDescription className="text-slate-400">
              У вашего аккаунта нет прав администратора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-2xl text-white">
            {isCodeVerified ? "Вход в админ-панель" : "Защищённая зона"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isCodeVerified 
              ? "Введите данные администратора" 
              : "Введите код доступа для продолжения"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCodeVerified ? (
            // Step 1: Code verification
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-300">Код доступа</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="code"
                    type="password"
                    placeholder="Введите секретный код"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    autoComplete="off"
                  />
                </div>
                {codeError && (
                  <p className="text-sm text-destructive">{codeError}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isVerifyingCode}
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  "Продолжить"
                )}
              </Button>
            </form>
          ) : (
            // Step 2: Login form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
