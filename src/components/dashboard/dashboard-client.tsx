
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type User } from 'firebase/auth';
import {
  Loader2,
  LogOut,
  ListFilter,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
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


function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
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

export function DashboardClient() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [sprints, setSprints] = React.useState<(Sprint & {id: string})[]>([]);
  const [isSprintsLoading, setIsSprintsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    department: [],
    team: [],
  });
  
  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) return;

    async function fetchSprints() {
      setIsSprintsLoading(true);
      try {
        const userSprints = await getSprints(firestore, user.uid);
        setSprints(userSprints);
      } catch (error) {
        toast({
          title: 'Error fetching sprints',
          description: 'Could not load your sprints. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsSprintsLoading(false);
      }
    }

    fetchSprints();
  }, [user, isUserLoading, router, toast, firestore]);

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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-violet-700/50 bg-violet-600 px-4 text-white sm:px-8">
        <Logo className="text-white" />
        <div className="flex items-center gap-4">
          <CreateSprintDialog onCreateSprint={handleCreateSprint} />
          <Link href="/admin">
            <Button variant="outline" className="gap-2 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
            </Button>
          </Link>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search sprints..."
              className="w-full rounded-full bg-violet-500/80 pl-10 h-10 border-violet-500 text-white placeholder:text-violet-200 focus-visible:bg-violet-500 focus-visible:shadow-lg focus-visible:shadow-violet-400/10 focus-visible:ring-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
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
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 rounded-2xl bg-white/50 p-8 text-center shadow-lg shadow-fuchsia-200/50 backdrop-blur-sm">
            <h1 className="text-4xl font-bold font-headline text-red-800/80">
              The Heart of Agile Excellence
            </h1>
            <p className="mt-4 text-lg text-foreground/70">
              AgileSuit brings clarity, structure, and insight to every sprint -
              empowering teams to deliver better outcomes through continuous
              improvement and smarter collaboration.
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
            <div className="text-center py-16 rounded-2xl bg-white/50 shadow-lg shadow-fuchsia-200/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-gray-700">No Sprints Yet!</h2>
                <p className="mt-2 text-gray-500">Click "Create Sprint" to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
