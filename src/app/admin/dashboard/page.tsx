
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Users, Calendar, Clock, Filter, Search, MoreVertical, 
  LayoutDashboard, UserCircle, FileText, LogOut, ChevronRight, Activity, X, Monitor, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { format, isToday, isWithinInterval, subDays } from 'date-fns';

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

const CLASSIFICATIONS = [
  'Student',
  'Faculty',
  'Staff',
  'Guest',
  'Employee'
];

export default function AdminDashboard() {
  const router = useRouter();
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user: authUser, isUserLoading } = useUser();
  
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [filterDept, setFilterDept] = useState('All');
  const [filterReason, setFilterReason] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  // Authorization check: Verify admin status
  const adminDocRef = useMemoFirebase(() => 
    authUser ? doc(firestore, 'roles_admin', authUser.uid) : null
  , [firestore, authUser]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  // Real-time Firestore queries
  const visitsQuery = useMemoFirebase(() => {
    if (!firestore || !adminData) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(100));
  }, [firestore, adminData]);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !adminData) return null;
    return query(collection(firestore, 'user_sessions'), limit(50));
  }, [firestore, adminData]);

  const { data: visitsRaw, isLoading: isVisitsLoading } = useCollection(visitsQuery);
  const { data: sessionsRaw, isLoading: isSessionsLoading } = useCollection(sessionsQuery);

  useEffect(() => {
    if (!isUserLoading && !isAdminChecking) {
      if (!authUser) {
        router.push('/');
      } else if (!adminData) {
        router.push('/visitor/check-in');
      }
    }
  }, [authUser, isUserLoading, isAdminChecking, adminData, router]);

  const visits = visitsRaw || [];
  const activeSessions = useMemo(() => {
    return (sessionsRaw || []).filter(s => s.status === 'online');
  }, [sessionsRaw]);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const date = new Date(v.timestamp);
      let inTimeRange = true;
      if (timeRange === 'Day') inTimeRange = isToday(date);
      else if (timeRange === 'Week') inTimeRange = isWithinInterval(date, { start: subDays(new Date(), 7), end: new Date() });
      else if (timeRange === 'Month') inTimeRange = isWithinInterval(date, { start: subDays(new Date(), 30), end: new Date() });

      const matchDept = filterDept === 'All' || v.department === filterDept;
      const matchReason = filterReason === 'All' || v.reason === filterReason;
      
      let matchClass = filterClass === 'All' || v.classification === filterClass;
      if (filterClass === 'Employee') {
        matchClass = v.classification === 'Faculty' || v.classification === 'Staff';
      }

      return inTimeRange && matchDept && matchReason && matchClass;
    });
  }, [visits, timeRange, filterDept, filterReason, filterClass]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisits.forEach(v => {
      counts[v.department] = (counts[v.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVisits]);

  const handleLogout = async () => {
    if (authUser) {
      await setDoc(doc(firestore, 'user_sessions', authUser.uid), {
        status: 'offline',
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
    await auth.signOut();
    router.push('/');
  };

  const clearFilters = () => {
    setFilterDept('All');
    setFilterReason('All');
    setFilterClass('All');
  };

  if (isUserLoading || isAdminChecking || (authUser && adminData && isVisitsLoading)) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin text-primary">
          <Activity className="h-12 w-12" />
        </div>
      </div>
    );
  }

  if (!authUser || !adminData) return null;

  return (
    <div className="min-h-screen flex gradient-bg">
      <aside className="w-72 glass-card border-none border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 bg-white rounded-full p-1 shadow-xl">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                alt="NEU Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">NEU HUB</span>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary text-white hover:bg-primary/90 rounded-xl h-12 shadow-lg shadow-primary/20">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 h-12 rounded-xl" onClick={() => router.push('/admin/users')}>
            <UserCircle className="h-5 w-5" />
            Users
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 h-12 rounded-xl" onClick={() => router.push('/admin/reports')}>
            <FileText className="h-5 w-5" />
            Reports
          </Button>
        </nav>
        <div className="p-6 border-t border-white/5">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive/80 hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-20 glass-card border-none border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-white/90">Institutional Analytics</h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 ml-2">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)} className="bg-white/5 rounded-xl p-1 border border-white/10">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger value="Day" className="rounded-lg data-[state=active]:bg-primary h-8 px-4">Day</TabsTrigger>
                <TabsTrigger value="Week" className="rounded-lg data-[state=active]:bg-primary h-8 px-4">Week</TabsTrigger>
                <TabsTrigger value="Month" className="rounded-lg data-[state=active]:bg-primary h-8 px-4">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 glass-card p-6 rounded-3xl border-none shadow-xl">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">College / Department</Label>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="All">All Units</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Type of Visit</Label>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="All">All Reasons</SelectItem>
                  {REASONS.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Visitor Classification</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="All">All Types</SelectItem>
                  {CLASSIFICATIONS.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {(filterDept !== 'All' || filterReason !== 'All' || filterClass !== 'All') ? (
                <Button variant="ghost" className="w-full h-11 rounded-xl text-white/40 hover:text-white hover:bg-white/5" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : (
                <div className="w-full h-11 flex items-center justify-center text-white/20 text-xs font-medium border border-dashed border-white/10 rounded-xl">
                  <Filter className="h-3 w-3 mr-2" />
                  Apply filters to narrow results
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/40 transition-colors" />
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Total Activity</CardDescription>
                <CardTitle className="text-4xl font-bold">{filteredVisits.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-primary font-medium">
                  <Activity className="h-3 w-3 mr-1.5" />
                  Real-time synchronization
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Active Sessions</CardDescription>
                <CardTitle className="text-4xl font-bold text-green-400">
                  {activeSessions.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-white/40 flex items-center">
                  <Monitor className="h-3 w-3 mr-1.5" />
                  Online community members
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Unique Visitors</CardDescription>
                <CardTitle className="text-4xl font-bold">
                  {new Set(filteredVisits.map(v => v.userEmail)).size}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-white/40 flex items-center">
                  <Users className="h-3 w-3 mr-1.5" />
                  Across institutional units
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Top Unit</CardDescription>
                <CardTitle className="text-xl font-bold truncate">
                  {chartData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-white/40">
                  Highest volume concentration
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Campus Volume</CardTitle>
                  <CardDescription className="text-white/40">Distribution across colleges and units</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={150} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{backgroundColor: '#0a0a0c', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'}}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(263, 70%, 50%)' : 'hsl(210, 100%, 66%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Active Sessions</CardTitle>
                    <CardDescription className="text-white/40">Real-time presence monitoring</CardDescription>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/20">{activeSessions.length} Online</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {session.role === 'admin' ? <Shield className="h-5 w-5 text-primary" /> : <UserCircle className="h-6 w-6 text-white/40" />}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{session.fullName}</p>
                          <p className="text-[10px] text-white/40 truncate uppercase tracking-widest">{session.role} • {session.email}</p>
                        </div>
                        <div className="text-[9px] font-bold text-white/20 tabular-nums">
                          {format(new Date(session.lastActive), 'HH:mm:ss')}
                        </div>
                      </div>
                    ))}
                    {activeSessions.length === 0 && (
                      <div className="col-span-full text-center py-12 text-white/20">
                        <Monitor className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm">No active sessions detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <Card className="glass-card border-none shadow-xl h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Logs</CardTitle>
                    <CardDescription className="text-white/40">Live activity stream</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredVisits.slice(0, 8).map((visit) => (
                      <div key={visit.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                          <UserCircle className="h-6 w-6 text-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-sm truncate">{visit.userFullName}</p>
                            <span className="text-[10px] font-bold text-white/20 tabular-nums">
                              {visit.timestamp ? format(new Date(visit.timestamp), 'HH:mm') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] h-4 font-normal text-white/30 border-white/10 px-1">
                              {visit.classification}
                            </Badge>
                            <p className="text-[10px] text-white/40 truncate">{visit.reason} • {visit.office} • {visit.department}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredVisits.length === 0 && (
                      <div className="text-center py-20 text-white/20">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm">No activity detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
