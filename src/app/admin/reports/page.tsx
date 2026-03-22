"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Users, UserCircle, LayoutDashboard, FileText, LogOut, Sparkles, 
  RefreshCcw, Download, Clock, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateDeanReport } from '@/ai/flows/generate-dean-report';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function DeanReports() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user: authUser, isUserLoading } = useUser();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const visitsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'visits'), orderBy('timestamp', 'desc'), limit(500));
  }, [firestore]);

  const { data: visitsRaw, isLoading: isVisitsLoading } = useCollection(visitsQuery);

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isUserLoading, router]);

  const visits = visitsRaw || [];

  const handleGenerateReport = async () => {
    if (visits.length === 0) {
      toast({ variant: 'destructive', title: 'Insufficient Data', description: 'No visit records available for analysis.' });
      return;
    }

    setIsGenerating(true);
    setReport(null);
    
    try {
      const visitorData = visits.map(v => ({
        timestamp: v.timestamp,
        department: v.department,
        reasonForVisit: v.reason
      }));

      const result = await generateDeanReport({ visitorData });
      setReport(result);
      toast({ title: 'Report Generated', description: 'AI analysis of visitor patterns is complete.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not process patterns at this time.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                alt="NEU Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg text-primary font-headline">NEU EduConnect</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push('/admin/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push('/admin/users')}>
            <UserCircle className="h-4 w-4" />
            User Management
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary">
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

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold font-headline text-primary">Administrative Reports</h2>
          <Button 
            className="bg-accent text-primary font-medium shadow-sm hover:bg-accent/90" 
            onClick={handleGenerateReport}
            disabled={isGenerating || isVisitsLoading}
          >
            {isGenerating ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Summary
          </Button>
        </header>

        <div className="p-8 max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Temporal Analysis</p>
                    <p className="text-xs text-muted-foreground">Identifying busiest operational hours.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Intent Tracking</p>
                    <p className="text-xs text-muted-foreground">Mapping common visit rationales.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isGenerating && (
            <Card className="border-none shadow-md">
              <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <div className="text-center">
                  <h3 className="font-bold">Analyzing Pattern Data</h3>
                  <p className="text-sm text-muted-foreground">The LLM is processing {visits.length} records...</p>
                </div>
                <Progress value={65} className="w-64 h-2" />
              </CardContent>
            </Card>
          )}

          {!isGenerating && report && (
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Executive Summary for NEU Dean</CardTitle>
                  <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="py-8 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-700">
                  {report}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t py-4 text-[10px] text-muted-foreground italic">
                This report was generated using AI-powered pattern recognition based on NEU real-time check-in logs.
              </CardFooter>
            </Card>
          )}

          {!isGenerating && !report && (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl border-muted/50">
              <div className="inline-block p-4 bg-muted/30 rounded-full mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">No Report Active</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">
                Click the "Generate Summary" button to analyze campus traffic and create insights for NEU administrative review.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
