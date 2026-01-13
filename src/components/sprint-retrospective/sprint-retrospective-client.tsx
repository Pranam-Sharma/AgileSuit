'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function UserNav({ user }: { user: any }) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
                        <AvatarFallback className="bg-white/20 text-white">{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user?.displayName ?? 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
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

export function SprintRetrospectiveClient({ sprintId }: { sprintId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
            <header className="flex-shrink-0 h-14 bg-primary border-b border-primary/10 flex items-center justify-between px-6 z-20 shadow-md">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-4 divide-x divide-white/20">
                        <Logo variant="white" className="hidden md:flex" />
                        <div className="pl-4 flex flex-col justify-center h-full">
                            <h1 className="text-lg font-bold text-white leading-tight">
                                Retrospective
                            </h1>
                            <div className="text-xs text-white/80">
                                Sprint #{sprintId}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && <UserNav user={user} />}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <h2 className="text-2xl font-bold text-foreground mb-2">Retrospective</h2>
                <p>Retrospective features for Sprint {sprintId} are coming soon.</p>
            </main>
        </div>
    );
}
