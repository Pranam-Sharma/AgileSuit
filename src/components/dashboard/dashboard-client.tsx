'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This will trigger the onAuthStateChanged listener
          router.refresh();
        }
      } catch (error: any) {
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Only redirect if not already in a redirect flow
        if (!isLoading) {
            router.push('/login');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, isLoading]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is happening or will happen
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-8">
          <div className="space-y-4 rounded-lg border bg-card p-8 shadow-sm">
            <h1 className="text-3xl font-bold font-headline">Welcome to AgileSuit</h1>
            <p className="text-muted-foreground">
              This is your dashboard. More features coming soon!
            </p>
            <p className="text-sm">
              Logged in as: <span className="font-medium text-primary">{user.email}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
