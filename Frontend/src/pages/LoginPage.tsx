import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldAlert,
  WifiOff, Clock, Terminal, ChevronRight, Activity, Zap
} from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export default function LoginPage() {
  const { loginByCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Lockout state
  const [attempts, setAttempts] = useState(() => {
    return parseInt(localStorage.getItem("login_attempts") || "0");
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return parseInt(localStorage.getItem("login_lockout_until") || "0");
  });
  const [timeLeft, setTimeLeft] = useState(0);

  // Sync lockout timer
  useEffect(() => {
    if (lockoutUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          setLockoutUntil(0);
          setAttempts(0);
          localStorage.removeItem("login_attempts");
          localStorage.removeItem("login_lockout_until");
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsLock(e.getModifierState("CapsLock"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockoutUntil > Date.now()) {
      setError(`Too many attempts. Locked until ${new Date(lockoutUntil).toLocaleTimeString()}`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Credentials required.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginByCredentials(email.trim(), password);
      if (result.success) {
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("login_lockout_until");
        toast.success("Welcome back!");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem("login_attempts", newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_DURATION_MS;
          setLockoutUntil(until);
          localStorage.setItem("login_lockout_until", until.toString());
          setError(`Maximum attempts reached. Locked for 2 minutes.`);
        } else {
          setError(result.error || "Invalid credentials.");
          toast.error(`Invalid login (${newAttempts}/${MAX_ATTEMPTS})`);
        }
      }
    } catch (err) {
      setError("System unreachable. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutUntil > Date.now();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* ── Left Side: Branded Stats & Marketing ── */}
      <div className="hidden lg:flex w-7/12 relative bg-[#0a0a0b] p-12 flex-col justify-between overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b82f633,transparent_60%)]" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[140px] animate-pulse delay-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">RAL CMS</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-0.5">
            April 24 Release · v3.0
          </Badge>
          <h2 className="text-5xl font-extrabold text-white leading-[1.1] mb-6">
            Intelligent <span className="text-primary">Revenue</span> & <br />Collection Oversight.
          </h2>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
            Empowering RAL teams with real-time billing lifecycles, role-aware collection controls, and premium financial auditing.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Activity className="h-4 w-4" />} label="Real-time Verification" val="100%" />
            <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Security Protocol" val="Military" />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>© 2026 Red Apple Learning. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Authentication Form ── */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 lg:p-20 justify-center relative bg-background">
        {isOffline && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-destructive text-destructive-foreground text-center text-xs font-bold animate-in slide-in-from-top duration-300 flex items-center justify-center gap-2 z-50">
            <WifiOff className="h-3.5 w-3.5" /> YOU ARE OFFLINE. LOGIN ATTEMPTS WILL FAIL.
          </div>
        )}

        <div className="max-w-[400px] w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold tracking-tight">Portal Access</h3>
            <p className="text-muted-foreground font-medium">Enter credentials to enter the workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@redapple.com"
                  className="pl-10 h-12 bg-muted/30 border-slate-200/60 focus:bg-background transition-all"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={isLocked || loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                  Password
                </Label>
                {isCapsLock && (
                  <span className="text-[10px] text-warning font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> CAPS LOCK ON
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-muted/30 border-slate-200/60 focus:bg-background transition-all"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={checkCapsLock}
                  disabled={isLocked || loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-destructive/5 border border-destructive/10 p-4 text-sm text-destructive animate-in shake duration-500">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Access Denied</p>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20 relative overflow-hidden group" 
              disabled={loading || isLocked}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Authenticating...
                </div>
              ) : isLocked ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Locked ({timeLeft}s)
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Enter Workspace <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* ── Demo Credentials Section (Collapsible in Premium) ── */}
          <div className="pt-8 border-t border-slate-100">
            <details className="group">
              <summary className="flex items-center justify-between text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-600 uppercase tracking-widest list-none">
                <span className="flex items-center gap-2"><Terminal className="h-3 w-3" /> System Access Keys</span>
                <span className="transition-transform group-open:rotate-180">↓</span>
              </summary>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <CredentialRow role="Owner" user="rajesh@redapple.com" pass="owner123" />
                <CredentialRow role="Admin" user="amit@redapple.com" pass="admin123" />
                <CredentialRow role="Accounts Mgr" user="neha@redapple.com" pass="accounts123" />
                <CredentialRow role="Counselor" user="manjari@redapple.com" pass="counselor123" />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{val}</div>
    </div>
  );
}

function CredentialRow({ role, user, pass }: { role: string; user: string; pass: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[10px] font-mono group hover:bg-primary/5 transition-colors">
      <span className="text-slate-400 group-hover:text-primary font-bold">{role}</span>
      <span className="text-slate-600">{user} / {pass}</span>
    </div>
  );
}
