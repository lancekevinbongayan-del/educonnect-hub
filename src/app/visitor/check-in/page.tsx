"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, LogOut, MapPin, ClipboardList, UserCircle } from 'lucide-react';
import { store } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const DESTINATIONS = [
  'Library',
  'Dean\'s Office'
];

const CLASSIFICATIONS = [
  'Student',
  'Staff'
];

const REASONS = [
  'Consultation',
  'Research',
  'Study',
  'Administrative Transaction',
  'Submission of Documents',
  'Inquiry'
];

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [classification, setClassification] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (!currentUser || currentUser.role !== 'visitor') {
      router.push('/');
    } else {
      setUser(currentUser);
      // Pre-set classification if user already has one, but allow override
      if (currentUser.classification) {
        setClassification(currentUser.classification);
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !reason || !classification) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please complete all fields before checking in.',
      });
      return;
    }

    store.addVisit({
      userEmail: user.email,
      userName: user.name,
      department: destination,
      reason,
      classification: classification
    });

    setSubmitted(true);
    toast({
      title: 'Check-in Successful',
      description: 'Your visit has been recorded.',
    });
  };

  const handleLogout = () => {
    store.logout();
    router.push('/');
  };

  if (!user) return null;

  if (submitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center p-12 glass-card border-none">
          <div className="flex justify-center mb-8">
            <div className="bg-primary/20 p-6 rounded-full ring-4 ring-primary/10">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Check-in Confirmed</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Thank you for checking in, <span className="text-white font-medium">{user.name}</span>. Your visit to the <span className="text-white font-medium">{destination}</span> as <span className="text-white font-medium">{classification}</span> is now logged.
          </p>
          <Button onClick={handleLogout} className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="px-6 py-6 lg:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-white rounded-full p-1 shadow-lg">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-bold tracking-tight text-white">NEU HUB</span>
        </div>
        <Button variant="ghost" className="text-white/60 hover:text-white" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-3xl grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-8 flex flex-col justify-center text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">Campus <br /><span className="text-primary">Check-in</span></h1>
              <p className="text-white/50 text-sm max-w-xs mx-auto lg:mx-0">
                Please provide your destination, classification, and purpose to complete your check-in.
              </p>
            </div>
            
            <div className="hidden lg:block space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white">Destination</h4>
                  <p className="text-xs text-white/40">Select where you are heading.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white">Classification</h4>
                  <p className="text-xs text-white/40">Student or Staff member?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="glass-card border-none overflow-hidden">
              <CardContent className="p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="destination" className="text-white/70">Visit Destination</Label>
                      <Select value={destination} onValueChange={setDestination} required>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                          <SelectValue placeholder="Where are you going?" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10 text-white">
                          {DESTINATIONS.map((dest) => (
                            <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classification" className="text-white/70">User Classification</Label>
                      <Select value={classification} onValueChange={setClassification} required>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                          <SelectValue placeholder="Are you student or staff?" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10 text-white">
                          {CLASSIFICATIONS.map((cls) => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-white/70">Reason for Visit</Label>
                      <Select value={reason} onValueChange={setReason} required>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                          <SelectValue placeholder="What is your purpose?" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10 text-white">
                          {REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                      Complete Check-in
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      Logged in as {user.email}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
