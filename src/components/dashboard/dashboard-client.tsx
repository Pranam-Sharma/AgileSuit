'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type User } from 'firebase/auth';
import {
  Loader2,
  LogOut,
  ListFilter,
  Search,
} from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateSprintDialog, type Sprint } from './create-sprint-dialog';
import { SprintCard } from './sprint-card';

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

type Filters = {
  department: string[];
  team: string[];
};

export function DashboardClient() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [sprints, setSprints] = React.useState<Sprint[]>([]);
  const [filters, setFilters] = React.useState<Filters>({
    department: [],
    team: [],
  });

  const handleCreateSprint = (sprintData: Sprint) => {
    setSprints((prevSprints) => [...prevSprints, sprintData]);
  };
  
  const allDepartments = React.useMemo(() => Array.from(new Set(sprints.map(s => s.department))), [sprints]);
  const allTeams = React.useMemo(() => Array.from(new Set(sprints.map(s => s.team))), [sprints]);

  const handleFilterChange = (category: keyof Filters, value: string) => {
    setFilters(prev => {
        const newFilters = prev[category].includes(value)
            ? prev[category].filter(item => item !== value)
            : [...prev[category], value];
        return { ...prev, [category]: newFilters };
    });
  };

  const filteredSprints = React.useMemo(() => {
    return sprints.filter(sprint => {
        const departmentMatch = filters.department.length === 0 || filters.department.includes(sprint.department);
        const teamMatch = filters.team.length === 0 || filters.team.includes(sprint.team);
        return departmentMatch && teamMatch;
    });
  }, [sprints, filters]);


  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 via-fuchsia-50 to-orange-50">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-8">
        <Logo />
        <div className="flex items-center gap-4">
          <CreateSprintDialog onCreateSprint={handleCreateSprint} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full">
                    <ListFilter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allDepartments.length > 0 && (
                    <>
                        <DropdownMenuLabel className='font-normal text-muted-foreground'>Department</DropdownMenuLabel>
                        {allDepartments.map(department => (
                            <DropdownMenuCheckboxItem
                                key={department}
                                checked={filters.department.includes(department)}
                                onCheckedChange={() => handleFilterChange('department', department)}
                            >
                                {department}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                    </>
                )}
                {allTeams.length > 0 && (
                     <>
                        <DropdownMenuLabel className='font-normal text-muted-foreground'>Team</DropdownMenuLabel>
                        {allTeams.map(team => (
                            <DropdownMenuCheckboxItem
                                key={team}
                                checked={filters.team.includes(team)}
                                onCheckedChange={() => handleFilterChange('team', team)}
                            >
                                {team}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 rounded-2xl bg-white/50 p-8 text-center shadow-sm backdrop-blur-sm">
            <h1 className="text-4xl font-bold font-headline text-red-800/80">
              The Heart of Agile Excellence
            </h1>
            <p className="mt-4 text-lg text-foreground/70">
              AgileSuit brings clarity, structure, and insight to every sprint -
              empowering teams to deliver better outcomes through continuous
              improvement and smarter collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             {filteredSprints.map((sprint, index) => (
                <SprintCard key={index} sprint={sprint} />
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
