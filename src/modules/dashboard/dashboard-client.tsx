'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
import {
  Search,
  Plus,
  ChevronDown,
  Bell,
  Smartphone,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserRole } from '@/hooks/use-user-role';
import { Logo } from '@/components/layout/logo';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
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
import { Input } from '@/components/ui/input';
import { getSprints } from '@/services/sprints-client';
import { useToast } from '@/hooks/use-toast';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/auth/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { UserNav } from './user-nav';

type Filters = {
  department: string[];
  team: string[];
  status: string[];
};

export function DashboardClient() {
  const [user, setUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const { toast } = useToast();
  const [sprints, setSprints] = React.useState<(Sprint & { id: string })[]>([]);
  const [isSprintsLoading, setIsSprintsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const containerRef = React.useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleViewModeChange = contextSafe((newMode: 'grid' | 'list') => {
    if (newMode === viewMode || isTransitioning) return;
    setIsTransitioning(true);

    gsap.to('.gsap-item', {
      opacity: 0,
      y: -10,
      scale: 0.98,
      duration: 0.2,
      stagger: { amount: 0.1 },
      ease: "power2.in",
      onComplete: () => {
        setViewMode(newMode);
        setIsTransitioning(false);
      }
    });
  });



  // Persist View Mode
  React.useEffect(() => {
    const savedView = localStorage.getItem('sprint_dashboard_view');
    if (savedView === 'grid' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('sprint_dashboard_view', viewMode);
  }, [viewMode]);
  const [filters, setFilters] = React.useState<Filters>({
    department: [],
    team: [],
    status: [],
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

  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    async function fetchSprints() {
      setIsSprintsLoading(true);
      try {
        const { getSprintsAction } = await import('@/backend/actions/sprints.actions');
        const userSprints = await getSprintsAction();
        setSprints(userSprints as any);
      } catch (error) {
        console.error("Failed to fetch sprints:", error);
      } finally {
        setIsSprintsLoading(false);
      }
    }
    fetchSprints();
  }, [user, isUserLoading]);


  const handleCreateSprint = (sprintData: Sprint & { id: string }) => {
    setSprints((prevSprints) => [sprintData, ...prevSprints]);
  };

  const handleDeleteSprint = (sprintId: string) => {
    setSprints((prevSprints) => prevSprints.filter(sprint => sprint.id !== sprintId));
  };

  const activeSprintsCount = sprints.length;

  const handleFilterChange = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const newValues = prev[category].includes(value) ? prev[category].filter(i => i !== value) : [...prev[category], value];
      return { ...prev, [category]: newValues };
    });
  }

  const filteredSprints = React.useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return sprints.filter(sprint => {
      const departmentMatch = filters.department.length === 0 || filters.department.includes(sprint.department);
      const teamMatch = filters.team.length === 0 || filters.team.includes(sprint.team);
      const statusMatch = filters.status.length === 0 || filters.status.includes(sprint.status || 'planning');

      if (!departmentMatch || !teamMatch || !statusMatch) {
        return false;
      }
      if (searchQuery === '') return true;
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

  useGSAP(() => {
    if (filteredSprints.length === 0 && !isSprintsLoading) return;
    if (isTransitioning) return;

    gsap.fromTo('.gsap-item',
      { opacity: 0, y: 15, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: { amount: 0.15 }, ease: "back.out(1.2)", clearProps: "all" }
    );
  }, [viewMode, filteredSprints.length, isSprintsLoading, isTransitioning]);


  if (isUserLoading || !user) {
    return (
      <LoadingScreen message="Loading Dashboard..." />
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans selection:bg-rose-100 text-slate-900 overflow-x-hidden">
      {/* Static Branded Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#8b2635]/20 to-[#6d1d2b]/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#a63d40]/15 to-[#8b2635]/15 blur-[160px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[#8b2635]/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[45%] h-[45%] rounded-full bg-[#6d1d2b]/15 blur-[140px]" />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="flex relative z-10">
        {/* Sleek Glass Sidebar */}
        <Sidebar />

        {/* Main Integrated Canvas */}
        <main className="flex-1 ml-72 min-h-screen p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto space-y-10">

            {/* Minimalist Top Header */}
            <header className="flex items-center justify-between gap-8 h-12">
              <div className="flex-1 max-w-xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search sprints, projects, or teams..."
                  className="w-full pl-11 bg-white/40 backdrop-blur-xl border-white/60 shadow-sm focus-visible:bg-white focus-visible:ring-rose-500/20 transition-all rounded-2xl h-11 text-[14px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-white/80">
                    <Smartphone className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-white/80">
                      <Bell className="h-5 w-5" />
                    </Button>
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-600 border-2 border-white" />
                  </div>
                </div>
                <div className="h-9 w-px bg-slate-200 mx-2" />
                <UserNav user={user} />
              </div>
            </header>

            {/* Dashboard Hero Row */}
            <section className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
              <div>
                <p className="text-rose-700 font-bold tracking-widest text-[11px] mb-2 uppercase">{getGreeting()}</p>
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                  Sprints
                  <Badge className="bg-rose-600/10 text-rose-700 border-0 rounded-full px-4 py-1 text-sm font-bold shadow-none">
                    {activeSprintsCount} Active
                  </Badge>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <CreateSprintDialog
                  onCreateSprint={handleCreateSprint}
                  trigger={
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-7 h-14 font-bold border-0 transition-all active:scale-95 flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      New Sprint
                    </Button>
                  }
                />
              </div>
            </section>

            {/* View Controls & Tabs */}
            <section className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <div className="flex items-center gap-1.5 p-1.5 bg-white/40 backdrop-blur-xl rounded-[20px] border border-white/60 shadow-sm w-fit">
                {['All', 'Active', 'Upcoming', 'Completed', 'Archived'].map((tab) => {
                  const isActive = filters.status.length === 0 && tab === 'All' || filters.status.includes(tab.toLowerCase());
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'All') {
                          setFilters(prev => ({ ...prev, status: [] }));
                        } else {
                          setFilters(prev => ({ ...prev, status: [tab.toLowerCase()] }));
                        }
                      }}
                      className={cn(
                        "px-6 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300",
                        isActive
                          ? "bg-white text-rose-700 shadow-sm border border-slate-100"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                      )}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-xl rounded-[20px] border border-white/60 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300",
                    viewMode === 'grid' ? "bg-white shadow-sm text-rose-700" : "text-slate-400 hover:bg-white/60"
                  )}
                  onClick={() => handleViewModeChange('grid')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300",
                    viewMode === 'list' ? "bg-white shadow-sm text-rose-700" : "text-slate-400 hover:bg-white/60"
                  )}
                  onClick={() => handleViewModeChange('list')}
                >
                  <List className="h-5 w-5" />
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button variant="ghost" className="h-10 px-4 rounded-xl text-slate-500 hover:bg-white/60 font-bold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </section>

            {/* Sprints Canvas Grid/List */}
            <section className="pt-2 pb-20" ref={containerRef as any}>
              {isSprintsLoading ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "flex flex-col gap-4"
                  )}
                >
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "gsap-item bg-white/30 border border-white/50 animate-pulse",
                        viewMode === 'grid' ? "h-[220px] rounded-[32px]" : "h-20 rounded-2xl"
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "flex flex-col gap-4"
                  )}
                >
                  {/* Integrated Create New Sprint - Conditional Layout */}
                  <div className="gsap-item">
                    <CreateSprintDialog
                      onCreateSprint={handleCreateSprint}
                      trigger={
                        viewMode === 'grid' ? (
                          <div className="group border-2 border-dashed border-slate-300/40 rounded-[32px] flex flex-col items-center justify-center p-8 h-full min-h-[220px] hover:border-rose-400/60 hover:bg-white/40 transition-all cursor-pointer bg-white/10 backdrop-blur-sm">
                            <div className="h-14 w-14 rounded-[20px] bg-white shadow-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-90">
                              <Plus className="h-7 w-7 text-rose-600" />
                            </div>
                            <div className="text-center">
                              <p className="font-extrabold text-slate-800 text-lg tracking-tight mb-1">Create New Sprint</p>
                              <p className="text-slate-400 text-xs font-medium">Launch a fresh cycle</p>
                            </div>
                          </div>
                        ) : (
                          <div className="group border-2 border-dashed border-slate-300/40 rounded-2xl flex items-center gap-4 p-4 hover:border-rose-400/60 hover:bg-white/40 transition-all cursor-pointer bg-white/10 backdrop-blur-sm h-20">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                              <Plus className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm tracking-tight">Add New Sprint</p>
                              <p className="text-slate-400 text-[10px] font-medium">Quickly launch a new cycle</p>
                            </div>
                          </div>
                        )
                      }
                    />
                  </div>

                  {filteredSprints.length > 0 && filteredSprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className="gsap-item"
                    >
                      <SprintCard
                        sprint={sprint}
                        onDelete={handleDeleteSprint}
                        variant={viewMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
