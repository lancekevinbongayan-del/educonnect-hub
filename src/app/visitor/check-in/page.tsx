"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, CheckCircle2, LogOut } from 'lucide-react';
import { store } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = [
  'College of Computer Studies',
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Business and Accountancy',
  'College of Nursing',
  'College of Education',
];

const REASONS = [
  'Consultation',
  'Library Use',
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center p-8 border-none shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Check-in Confirmed</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for checking in, {user.name}. Your visit is now logged in the hub.
          </p>
          <Button onClick={handleLogout} className="w-full h-11 bg-primary">
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-background">
      <header className="flex justify-between items-center max-w-2xl mx-auto w-full mb-12">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">EduConnect</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Visitor Check-in</CardTitle>
            <CardDescription>
              Logged in as <span className="font-medium text-foreground">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department">College Department</Label>
                <Select onValueChange={setDepartment} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Select onValueChange={setReason} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select purpose of visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full h-11 text-base bg-primary hover:bg-primary/90">
                Complete Check-in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}