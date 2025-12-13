
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  LogOut,
  ListFilter,
  Search,
  Shield,
} from 'lucide-react';
// import { useAuth, useFirestore } from '@/firebase/provider'; // Removed
// import { useUser } from '@/hooks/use-user'; // Removed
import { useUserRole } from '@/hooks/use-user-role';
import { Logo } from '../logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateSprintDialog, type Sprint } from './create-sprint-dialog';
import { SprintCard } from './sprint-card';
import { Input } from '../ui/input';
import { getSprints } from '@/lib/sprints-client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';


import { type User } from '@supabase/supabase-js';

function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback className='bg-white/20 text-white'>{userInitial}</AvatarFallback>
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

import { createClient } from '@/lib/supabase/client';

// ... other imports ...

export function DashboardClient() {
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const { isAdmin } = useUserRole(); // Assuming this hook needs refactoring too, but addressing session first
  const router = useRouter();
  const { toast } = useToast();
  // const firestore = useFirestore(); // REMOVE FIRESTORE
  const [sprints, setSprints] = React.useState<(Sprint & { id: string })[]>([]);
  const [isSprintsLoading, setIsSprintsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    department: [],
    team: [],
  });

  const supabase = createClient();

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setIsUserLoading(false);
    };
    checkUser();
  }, [router]);


  // COMMENT OUT fetching sprints from Firestore for now
  // Fetch sprints from Supabase
  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    async function fetchSprints() {
      setIsSprintsLoading(true);
      try {
        const { getSprintsAction } = await import('@/app/actions/sprints');
        const userSprints = await getSprintsAction();
        setSprints(userSprints as any);
      } catch (error) {
        console.error("Failed to fetch sprints:", error);
        toast({
          title: "Error",
          description: "Failed to load sprints.",
          variant: "destructive"
        });
      } finally {
        setIsSprintsLoading(false);
      }
    }
    fetchSprints();
  }, [user, isUserLoading, toast]);

  const handleCreateSprint = (sprintData: Sprint & { id: string }) => {
    setSprints((prevSprints) => [sprintData, ...prevSprints]);
  };

  const handleDeleteSprint = (sprintId: string) => {
    setSprints((prevSprints) => prevSprints.filter(sprint => sprint.id !== sprintId));
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
    const lowercasedQuery = searchQuery.toLowerCase();
    return sprints.filter(sprint => {
      const departmentMatch = filters.department.length === 0 || filters.department.includes(sprint.department);
      const teamMatch = filters.team.length === 0 || filters.team.includes(sprint.team);

      if (!departmentMatch || !teamMatch) {
        return false;
      }

      if (searchQuery === '') {
        return true;
      }

      return (
        sprint.sprintNumber.toLowerCase().includes(lowercasedQuery) ||
        sprint.sprintName.toLowerCase().includes(lowercasedQuery) ||
        sprint.projectName.toLowerCase().includes(lowercasedQuery) ||
        sprint.department.toLowerCase().includes(lowercasedQuery) ||
        sprint.team.toLowerCase().includes(lowercasedQuery) ||
        (sprint.facilitatorName && sprint.facilitatorName.toLowerCase().includes(lowercasedQuery))
      );
    });
  }, [sprints, filters, searchQuery]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md sm:px-8">
        <Logo className="text-primary" />
        <div className="flex items-center gap-4">
          <CreateSprintDialog onCreateSprint={handleCreateSprint} />
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          )}
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sprints..."
              className="w-full bg-muted/50 pl-9 h-9 text-sm focus-visible:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
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

          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your sprints and track team progress.
            </p>
          </div>

          {isSprintsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SprintCard.Skeleton />
              <SprintCard.Skeleton />
              <SprintCard.Skeleton />
            </div>
          ) : filteredSprints.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSprints.map((sprint, index) => (
                <SprintCard key={sprint.id} sprint={sprint} onDelete={handleDeleteSprint} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed bg-background/50 text-center animate-in fade-in-50">
              <div className="bg-muted p-4 rounded-full mb-4">
                <ListFilter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No Sprints Found</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Get started by creating your first sprint to track your team's velocity and goals.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
