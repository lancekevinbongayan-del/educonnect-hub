
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Users, Search, UserCircle, LayoutDashboard, FileText, LogOut, 
  MoreHorizontal, Ban, ShieldCheck, Mail, Activity, AlertTriangle,
  UserPlus, ShieldAlert, Filter, X, ChevronRight, Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export default function UserManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user: authUser, isUserLoading } = useUser();
  
  const [search, setSearch] = useState('');
  const [blockingUser, setBlockingUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');

  // Authorization check
  const adminDocRef = useMemoFirebase(() => 
    authUser ? doc(firestore, 'roles_admin', authUser.uid) : null
  , [firestore, authUser]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !adminData) return null;
    return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
  }, [firestore, adminData]);

  const { data: usersRaw, isLoading: isUsersLoading } = useCollection(usersQuery);

  useEffect(() => {
    if (!isUserLoading && !isAdminChecking && (!authUser || !adminData)) {
      router.push('/');
    }
  }, [authUser, isUserLoading, isAdminChecking, adminData, router]);

  const users = usersRaw || [];

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      blocked: users.filter(u => u.isBlocked).length,
      admins: users.filter(u => u.role === 'admin').length,
      visitors: users.filter(u => u.role === 'visitor').length
    };
  }, [users]);

  const handleBlockConfirm = async () => {
    if (!blockingUser) return;
    
    try {
      await updateDoc(doc(firestore, 'users', blockingUser.id), {
        isBlocked: true,
        blockReason: blockReason,
        blockedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: 'Access Restricted', 
        description: `${blockingUser.fullName || blockingUser.name} has been blacklisted.` 
      });
      setBlockingUser(null);
      setBlockReason('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  const unblockUser = async (user: any) => {
    try {
      await updateDoc(doc(firestore, 'users', user.id), {
        isBlocked: false,
        blockReason: null,
        blockedAt: null,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: 'Access Restored', 
        description: `${user.fullName || user.name} is now permitted to enter.` 
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  const handleLogout = async () => {
    if (authUser) {
      await setDoc(doc(firestore, 'user_sessions', authUser.uid), {
        status: 'offline',
        lastActive: serverTimestamp()
      }, { merge: true });
    }
    await auth.signOut();
    router.replace('/');
  };

  if (isUserLoading || isAdminChecking || isUsersLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin text-primary">
          <Activity className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex gradient-bg">
      {/* Sidebar - Consistent with Dashboard */}
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
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 h-12 rounded-xl" onClick={() => router.push('/admin/dashboard')}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary text-white hover:bg-primary/90 rounded-xl h-12 shadow-lg shadow-primary/20">
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
            <h2 className="text-xl font-bold tracking-tight text-white/90">Institutional Directory</h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 ml-2">
              {stats.total} Profiles
            </Badge>
          </div>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-11 bg-white/5 border-white/10 h-11 rounded-xl text-white focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-none shadow-xl group overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Total Members</CardDescription>
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
            </Card>
            
            <Card className="glass-card border-none shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Blocked Accounts</CardDescription>
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold text-red-400">{stats.blocked}</CardTitle>
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
            </Card>

            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Administrators</CardDescription>
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold text-blue-400">{stats.admins}</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
            </Card>

            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Standard Visitors</CardDescription>
                <div className="flex items-baseline gap-2">
                  <CardTitle className="text-4xl font-bold">{stats.visitors}</CardTitle>
                  <UserPlus className="h-4 w-4 text-white/40" />
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-12">User Identity</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Classification</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Access Status</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px]">System Role</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-4 py-2">
                          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors overflow-hidden relative">
                             {user.role === 'admin' ? (
                               <ShieldCheck className="h-6 w-6 text-primary" />
                             ) : (
                               <UserCircle className="h-8 w-8 text-white/20" />
                             )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-white/90 truncate">{user.fullName || user.name || 'NEU Community Member'}</span>
                            <span className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium text-[10px] h-6 px-3 bg-white/5 border-white/10 text-white/60">
                          {user.classification || 'Unclassified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge className="bg-destructive/20 text-destructive border-destructive/20 hover:bg-destructive/30 cursor-pointer h-6 px-3">
                                Blacklisted
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card border-white/10 w-64 p-4 text-white">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Security Event</p>
                                  <AlertTriangle className="h-3 w-3 text-destructive" />
                                </div>
                                <p className="text-xs italic leading-relaxed text-white/80">"{user.blockReason || 'Violation of campus protocols.'}"</p>
                                <div className="pt-2 border-t border-white/5 text-[9px] text-white/30 flex justify-between">
                                  <span>Recorded At</span>
                                  <span>{user.blockedAt ? format(new Date(user.blockedAt), 'MMM dd, yyyy') : 'N/A'}</span>
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20 h-6 px-3">
                            Permitted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-white/20" />
                          <span className="text-xs uppercase font-bold tracking-widest text-white/40">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 text-white/40 hover:text-white">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/10 text-white w-48">
                            {user.isBlocked ? (
                              <DropdownMenuItem className="cursor-pointer focus:bg-white/10 gap-2" onClick={() => unblockUser(user)}>
                                <ShieldCheck className="h-4 w-4 text-green-400" />
                                Restore Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer focus:bg-destructive/10 text-destructive gap-2" 
                                disabled={user.role === 'admin'}
                                onClick={() => setBlockingUser(user)}
                              >
                                <Ban className="h-4 w-4" />
                                Restrict Access
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 gap-2" onClick={() => router.push(`/admin/users/${user.id}`)}>
                              <ChevronRight className="h-4 w-4 text-white/40" />
                              View Activity
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                          <Search className="h-12 w-12" />
                          <p className="text-sm">No community members matching your search.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>

      {/* Security Protocol Dialog */}
      <Dialog open={!!blockingUser} onOpenChange={() => setBlockingUser(null)}>
        <DialogContent className="glass-card border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-destructive/20 text-destructive">
                <ShieldAlert className="h-6 w-6" />
              </div>
              Confirm Blacklist
            </DialogTitle>
            <DialogDescription className="text-white/40 pt-2">
              You are initiating a security block for <strong className="text-white">{blockingUser?.fullName}</strong>. This user will be immediately barred from all institutional check-in points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white/60 text-xs font-bold uppercase tracking-widest">Formal Reason for Restriction</Label>
              <Textarea 
                id="reason" 
                placeholder="e.g. Unauthorized entry attempt, Misconduct, Credential expiration..." 
                className="bg-white/5 border-white/10 rounded-xl focus:ring-primary h-32 text-sm leading-relaxed"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl border-white/10 text-white/60 hover:text-white" onClick={() => setBlockingUser(null)}>
              Abort Protocol
            </Button>
            <Button variant="destructive" className="rounded-xl shadow-lg shadow-destructive/20 font-bold" onClick={handleBlockConfirm}>
              Execute Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
