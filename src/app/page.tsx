"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, ShieldCheck, User, ArrowLeft, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user: authUser, isUserLoading } = useUser();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'initial' | 'role-selection' | 'admin-password'>('initial');

  // Authorization check: Check if user is admin
  const adminDocRef = useMemoFirebase(() => 
    authUser ? doc(firestore, 'roles_admin', authUser.uid) : null
  , [firestore, authUser]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  useEffect(() => {
    // Automatic redirection for existing sessions
    if (!isUserLoading && !isAdminChecking && !loading && authUser) {
      if (adminData) {
        router.push('/admin/dashboard');
      } else if (adminData === null && !isAdminChecking) {
        router.push('/visitor/check-in');
      }
    }
  }, [authUser, isUserLoading, isAdminChecking, adminData, router, loading]);

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
      setView('role-selection');
    } else {
      handleVisitorAccess();
    }
  };

  const handleVisitorAccess = async () => {
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      const fullName = email.split('@')[0];
      
      const userRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().isBlocked) {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'Your account has been blocked.' });
        setLoading(false);
        return;
      }

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: uid,
          email: email,
          fullName: fullName,
          role: 'visitor',
          isBlocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Session status is now handled automatically by FirebaseProvider
      router.push('/visitor/check-in');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Auth Error', description: error.message });
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email === 'jcesperanza@neu.edu.ph' && password === 'admin123') {
         const userCredential = await signInAnonymously(auth);
         const uid = userCredential.user.uid;
         
         await setDoc(doc(firestore, 'users', uid), {
            id: uid,
            email: email,
            fullName: 'JC Esperanza',
            role: 'admin',
            isBlocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
         });
         
         await setDoc(doc(firestore, 'roles_admin', uid), { 
           isAdmin: true,
           updatedAt: new Date().toISOString()
         });
         
         toast({ title: 'Welcome, Admin', description: 'Access verified for Institutional Hub.' });
         router.push('/admin/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Access Denied', description: error.message || 'Verification failed.' });
      setLoading(false);
    }
  };

  if (isUserLoading || (authUser && isAdminChecking)) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin text-primary">
          <Activity className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col overflow-hidden">
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
      </nav>

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

        <div className="w-full max-w-md z-10 transition-all duration-500 transform hover:scale-[1.02]">
          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {view === 'initial' && 'Welcome Back'}
                  {view === 'role-selection' && 'Select Role'}
                  {view === 'admin-password' && 'Admin Verification'}
                </h2>
                <p className="text-sm text-white/50">
                  {view === 'initial' && 'Sign in with your @neu.edu.ph institutional account.'}
                  {view === 'role-selection' && 'Choose how you want to access the Hub today.'}
                  {view === 'admin-password' && 'Please enter your administrator credentials.'}
                </p>
              </div>

              {view === 'initial' && (
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
              )}

              {view === 'role-selection' && (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 group"
                    onClick={() => setView('admin-password')}
                  >
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="p-2 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Enter as Administrator</p>
                        <p className="text-[10px] text-white/40 font-normal">Access dashboard and management tools</p>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 group"
                    onClick={handleVisitorAccess}
                    disabled={loading}
                  >
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="p-2 rounded-xl bg-white/5 text-white/60 group-hover:scale-110 transition-transform">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{loading ? 'Logging in...' : 'Enter as Visitor'}</p>
                        <p className="text-[10px] text-white/40 font-normal">Standard campus check-in process</p>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-white/40 hover:text-white"
                    onClick={() => setView('initial')}
                  >
                    <ArrowLeft className="h-3 w-3 mr-2" />
                    Back to email entry
                  </Button>
                </div>
              )}

              {view === 'admin-password' && (
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
                    <Button variant="secondary" className="flex-1 h-12 rounded-xl" onClick={() => setView('role-selection')} type="button" disabled={loading}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-12 rounded-xl font-bold" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Access'}
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

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
    </div>
  );
}