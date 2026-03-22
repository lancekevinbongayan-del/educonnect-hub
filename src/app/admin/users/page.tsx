"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Users, Search, UserCircle, LayoutDashboard, FileText, LogOut, 
  MoreHorizontal, Ban, ShieldCheck, Mail, Activity
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
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';

export default function UserManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user: authUser, isUserLoading } = useUser();
  
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter(u => 
    (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = async (user: any) => {
    if (user.role === 'admin') {
      toast({ variant: 'destructive', title: 'Action Denied', description: 'Administrators cannot be blocked.' });
      return;
    }

    try {
      await updateDoc(doc(firestore, 'users', user.id), {
        isBlocked: !user.isBlocked,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: user.isBlocked ? 'User Unblocked' : 'User Blocked', 
        description: `${user.fullName || user.name} access updated.` 
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
    router.push('/');
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
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary">
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

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold font-headline text-primary">Institutional Directory</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email" 
              className="pl-9 h-10 border-none bg-background shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="p-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg">Registered Community Members</CardTitle>
              <CardDescription>Manage NEU profiles and campus access permissions.</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">User Info</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                          <UserCircle className="h-6 w-6 text-primary/40" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{user.fullName || user.name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">{user.classification || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize font-medium">{user.role}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleBlock(user)}>
                            {user.isBlocked ? (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Unblock Access
                              </>
                            ) : (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Block User
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
