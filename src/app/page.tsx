"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Menu } from 'lucide-react';
import { store } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInitialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized Domain',
        description: 'Please use your institutional email (@neu.edu.ph).',
      });
      return;
    }

    if (email === 'jcesperanza@neu.edu.ph') {
      setShowPassword(true);
    } else {
      setLoading(true);
      setTimeout(() => {
        const user = store.login(email, 'visitor');
        if (user.isBlocked) {
          toast({ variant: 'destructive', title: 'Access Denied', description: 'Your account has been blocked.' });
          setLoading(false);
          return;
        }
        router.push('/visitor/check-in');
      }, 800);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      store.login(email, 'admin');
      router.push('/admin/dashboard');
    } else {
      toast({ variant: 'destructive', title: 'Invalid Credentials', description: 'Incorrect password for administrator access.' });
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <nav className="w-full px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-white rounded-full p-1.5 shadow-xl">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-bold text-xl tracking-tight">NEU HUB</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#" className="hover:text-white transition-colors">Campus</a>
          <a href="#" className="hover:text-white transition-colors">Academics</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 gap-12 py-12">
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-primary-foreground border border-white/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            VIRTUAL CAMPUS CONNECT
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tighter text-gradient">
            CAMPUS VISITOR <br /> 
            <span className="text-primary">MANAGEMENT</span> <br />
            SYSTEM
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Welcome to the New Era University digital gateway. Streamline your check-in process and access institutional analytics with our integrated Hub.
          </p>
        </div>

        {/* Login Section */}
        <div id="login-section" className="w-full max-w-md z-10 transition-all duration-500 transform hover:scale-[1.02]">
          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {showPassword ? 'Admin Verification' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-white/50">
                  {showPassword 
                    ? 'Please enter your administrator credentials.' 
                    : 'Sign in with your @neu.edu.ph institutional account.'}
                </p>
              </div>

              {!showPassword ? (
                <form onSubmit={handleInitialLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70">Institutional Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@neu.edu.ph" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign in with Google'}
                    {!loading && <LogIn className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/70">Secure Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1 h-12 rounded-xl" onClick={() => setShowPassword(false)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-12 rounded-xl font-bold">
                      Verify Access
                    </Button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Restricted Institutional Access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
    </div>
  );
}