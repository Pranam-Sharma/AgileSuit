'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        // If we get a result, a user has just signed in via redirect.
        if (result && result.user) {
          setUser(result.user);
          setIsLoading(false);
          // We can remove the hash from the URL
          router.replace('/dashboard');
          return; // Early exit, we have the user.
        }
      } catch (error) {
        console.error("Error getting redirect result:", error);
        // Fall through to the onAuthStateChanged listener
      }

      // This will run if there's no redirect result, or after it has been handled.
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Only redirect if we are done with the initial loading and have no user.
          router.push('/login');
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    handleAuth();
  }, [router]);


  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // The redirect to /login is happening
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
              You are successfully logged in.
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
