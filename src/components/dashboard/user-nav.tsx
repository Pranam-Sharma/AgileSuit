'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserNav({ user }: { user: any }) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    const avatarUrl = user.user_metadata?.avatar_url || user.avatar_url || '';
    const fullName = user.user_metadata?.full_name || user.display_name || 'User';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarImage src={avatarUrl} alt={fullName} />
                        <AvatarFallback className='bg-primary/10 text-primary font-medium'>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                        {fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
