"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Users, Calendar, Clock, Filter, Search, MoreVertical, 
  LayoutDashboard, UserCircle, FileText, LogOut, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { store, type Visit } from '@/lib/store';
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

export default function AdminDashboard() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [filterDept, setFilterDept] = useState('All');
  const [filterReason, setFilterReason] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
    } else {
      setVisits(store.getVisits());
    }
  }, [router]);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const date = new Date(v.timestamp);
      let inTimeRange = true;
      if (timeRange === 'Day') inTimeRange = isToday(date);
      else if (timeRange === 'Week') inTimeRange = isWithinInterval(date, { start: subDays(new Date(), 7), end: new Date() });
      else if (timeRange === 'Month') inTimeRange = isWithinInterval(date, { start: subDays(new Date(), 30), end: new Date() });

      const matchDept = filterDept === 'All' || v.department === filterDept;
      const matchReason = filterReason === 'All' || v.reason === filterReason;
      const matchClass = filterClass === 'All' || v.classification === filterClass;

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

  const handleLogout = () => {
    store.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary font-headline">EduConnect Hub</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push('/admin/users')}>
            <UserCircle className="h-4 w-4" />
            User Management
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push('/admin/reports')}>
            <FileText className="h-4 w-4" />
            Dean's Reports
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold font-headline">Real-time Dashboard</h2>
          <div className="flex items-center gap-4">
            <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <TabsList>
                <TabsTrigger value="Day">Day</TabsTrigger>
                <TabsTrigger value="Week">Week</TabsTrigger>
                <TabsTrigger value="Month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-primary text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/70">Total Visitors ({timeRange})</CardDescription>
                <CardTitle className="text-3xl">{filteredVisits.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-white/50">
                  <Clock className="h-3 w-3 mr-1" />
                  Real-time update active
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Unique Users</CardDescription>
                <CardTitle className="text-3xl">
                  {new Set(filteredVisits.map(v => v.userEmail)).size}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Across all categories
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Peak Department</CardDescription>
                <CardTitle className="text-xl truncate">
                  {chartData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Highest traffic volume detected
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-muted-foreground">Department</Label>
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Departments</SelectItem>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-muted-foreground">Reason</Label>
                  <Select value={filterReason} onValueChange={setFilterReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Reasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Reasons</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Library Use">Library Use</SelectItem>
                      <SelectItem value="Administrative Transaction">Admin</SelectItem>
                      <SelectItem value="Submission of Documents">Submissions</SelectItem>
                      <SelectItem value="Exam/Assessment">Exams</SelectItem>
                      <SelectItem value="Facility Usage">Facilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-muted-foreground">Classification</Label>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classifications" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Classifications</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Faculty">Faculty</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Chart */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Visitor Distribution</CardTitle>
                <CardDescription>Breakdown by Department</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: '#f5f5f5'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1F50A8' : '#2ECEED'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest visitor check-ins</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredVisits.slice(0, 5).map((visit) => (
                    <div key={visit.id} className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <UserCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-medium truncate">{visit.userName}</p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {format(new Date(visit.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{visit.reason} • {visit.department}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-secondary/10 text-primary border-none">
                        {visit.classification}
                      </Badge>
                    </div>
                  ))}
                  {filteredVisits.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No visits recorded for this selection.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`block font-medium ${className}`}>{children}</label>;
}
