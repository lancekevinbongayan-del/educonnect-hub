"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, LogOut, MapPin, UserCircle, School, Building2, 
  Library as LibraryIcon, GraduationCap, Users, BookOpen, ChevronRight, Menu
} from 'lucide-react';
import { store } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

const LIBRARY_REASONS = [
  'Library - Research',
  'Library - Study',
  'Library - Borrowing/Returning',
  'Library - Computer Use',
  'Reference Inquiry',
  'Consultation'
];

const DEANS_OFFICE_REASONS = [
  'Office Permission',
  'Official Academic Request',
  'Document Submission',
  'Faculty Meeting',
  'Enrollment Inquiry',
  'Clearance Processing',
  'Administrative Transaction'
];

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [department, setDepartment] = useState('');
  const [office, setOffice] = useState('');
  const [classification, setClassification] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (!currentUser || currentUser.role !== 'visitor') {
      router.push('/');
    } else {
      setUser(currentUser);
      if (currentUser.classification) {
        setClassification(currentUser.classification);
      }
    }
  }, [router]);

  // Reset reason when office changes to ensure valid selection
  useEffect(() => {
    setReason('');
  }, [office]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !office || !reason || !classification) {
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
      department: department,
      office: office,
      reason: reason,
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

  const currentReasons = office === "Dean's Office" ? DEANS_OFFICE_REASONS : LIBRARY_REASONS;

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
          <h2 className="text-3xl font-bold mb-4 text-white">Welcome to NEU Library!</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Thank you for checking in, <span className="text-white font-medium">{user.name}</span>. Your visit to the <span className="text-white font-medium">{office}</span> ({department}) as <span className="text-white font-medium">{classification}</span> is now logged.
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
      <header className="px-6 py-6 lg:px-12 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-white rounded-full p-1.5 shadow-lg">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <span className="font-bold tracking-tight text-white text-xl">NEU HUB</span>
        </div>
        <Button variant="ghost" className="text-white/60 hover:text-white bg-white/5 rounded-xl" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start py-12 px-6 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tighter">
              Institutional <span className="text-primary">Check-in</span>
            </h1>
            <p className="text-white/40 text-sm">
              Please finalize your visit details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            {/* Target Office Selection - Icon Grid */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Target Office
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Library', icon: LibraryIcon, label: 'Library' },
                  { id: "Dean's Office", icon: GraduationCap, label: "Dean's Office" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOffice(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group relative overflow-hidden",
                      office === item.id 
                        ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <item.icon className={cn(
                      "h-10 w-10 mb-3 transition-transform",
                      office === item.id ? "scale-110" : "group-hover:scale-105"
                    )} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    {office === item.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Classification Selection - Icon Grid */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Classification
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Student', icon: UserCircle, label: 'Student' },
                  { id: 'Staff', icon: Building2, label: 'Staff' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setClassification(item.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group relative",
                      classification === item.id 
                        ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl bg-white/5",
                      classification === item.id && "bg-primary/20"
                    )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    {classification === item.id && (
                      <div className="ml-auto">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Selections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <School className="h-3 w-3" />
                  College / Department
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:ring-primary focus:border-primary px-5">
                    <div className="flex items-center gap-3">
                      <Menu className="h-4 w-4 text-primary/60" />
                      <SelectValue placeholder="Select unit" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 text-white max-h-[300px]">
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  Purpose of Visit
                </Label>
                <Select value={reason} onValueChange={setReason} disabled={!office}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:ring-primary focus:border-primary px-5">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="h-4 w-4 text-primary/60" />
                      <SelectValue placeholder={!office ? "Select office first" : "Select purpose"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 text-white">
                    {currentReasons.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Section */}
            <div className="pt-6 space-y-4">
              <Button type="submit" className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-[1.01] active:scale-[0.99]">
                Complete Check-in
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Logged in as {user.email}
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] pointer-events-none -z-10" />
    </div>
  );
}
