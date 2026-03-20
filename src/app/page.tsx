"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, ShieldAlert } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="mb-4 relative w-24 h-24">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
            alt="New Era University Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold font-headline text-primary">NEU EduConnect Hub</h1>
        <p className="text-muted-foreground">Empowering Campus Connectivity</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-headline">New Era University</CardTitle>
          <CardDescription>
            {showPassword 
              ? 'Administrator verification required' 
              : 'Sign in with your institutional Google account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPassword ? (
            <form onSubmit={handleInitialLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@neu.edu.ph" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base bg-primary" disabled={loading}>
                {loading ? 'Authenticating...' : 'Continue with Google'}
                {!loading && <LogIn className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Administrator Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setShowPassword(false)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-primary">
                  Verify Access
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col text-xs text-center text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-center gap-1 mb-2">
            <ShieldAlert className="h-3 w-3" />
            <span>Restricted access for NEU community members only.</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
