'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type User } from 'firebase/auth';
import {
  Loader2,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Sprint } from '../dashboard/create-sprint-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName ?? 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SprintDetailClientProps = {
    sprint: Sprint & { id: string };
};

export function SprintDetailClient({ sprint }: SprintDetailClientProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 via-fuchsia-50 to-orange-50">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.push('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
            </Button>
            <Logo />
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
            <Card className="w-full shadow-lg shadow-blue-200/50">
                <CardHeader>
                    <CardDescription>{sprint.projectName} / Sprint {sprint.sprintNumber}</CardDescription>
                    <CardTitle className='text-3xl font-bold text-fuchsia-700'>{sprint.sprintName}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="font-medium text-muted-foreground">Department</div>
                            <div>{sprint.department}</div>
                            <div className="font-medium text-muted-foreground">Team</div>
                            <div>{sprint.team}</div>
                            <div className="font-medium text-muted-foreground">Facilitator</div>
                            <div>{sprint.facilitatorName}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
