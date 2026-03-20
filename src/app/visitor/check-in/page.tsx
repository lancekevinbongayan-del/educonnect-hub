"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, LogOut, ChevronLeft, MapPin, ClipboardList } from 'lucide-react';
import { store } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = [
  'College of Computer Studies',
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Business and Accountancy',
  'College of Nursing',
  'College of Education',
  'College of Law',
  'College of Music',
  'College of Communication',
  'College of Architecture',
  'College of Medicine',
  'College of Agriculture',
  'College of Hospitality Management',
  'Graduate School',
  'Senior High School',
  'Basic Education Department',
];

const REASONS = [
  'Consultation',
  'Library - Research',
  'Library - Study',
  'Library - Borrowing/Returning',
  'Library - Computer Use',
  'Administrative Transaction',
  'Submission of Documents',
  'Exam/Assessment',
  'Facility Usage',
];

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (!currentUser || currentUser.role !== 'visitor') {
      router.push('/');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !reason) return;

    store.addVisit({
      userEmail: user.email,
      userName: user.name,
      department,
      reason,
      classification: user.classification
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
          <h2 className="text-3xl font-bold mb-4">Check-in Confirmed</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Thank you for checking in, <span className="text-white font-medium">{user.name}</span>. Your visit to <span className="text-white font-medium">{department}</span> is now logged.
          </p>
          <Button onClick={handleLogout} className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20">
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
          <span className="font-bold tracking-tight">NEU HUB</span>
        </div>
        <Button variant="ghost" className="text-white/60 hover:text-white" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl grid lg:grid-cols-5 gap-8">
          {/* Left info column */}
          <div className="lg:col-span-2 space-y-8 flex flex-col justify-center text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">Visitor <br /><span className="text-primary">Check-in</span></h1>
              <p className="text-white/50 text-sm max-w-xs mx-auto lg:mx-0">
                Please provide your destination and purpose to complete your campus check-in.
              </p>
            </div>
            
            <div className="hidden lg:block space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Destination</h4>
                  <p className="text-xs text-white/40">Where on campus are you visiting?</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Purpose</h4>
                  <p className="text-xs text-white/40">Select the primary reason for your visit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-none overflow-hidden">
              <CardContent className="p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-white/70">College / Department</Label>
                      <Select onValueChange={setDepartment} required>
                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-white/70">Reason for Visit</Label>
                      <Select onValueChange={setReason} required>
                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl">
                          <SelectValue placeholder="What's your purpose?" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          {REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20">
                      Complete Check-in
                    </Button>
                  </div>

                  <div className="text-center pt-4">
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
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
    </div>
  );
}