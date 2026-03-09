'use client';

import * as React from 'react';
import {
    Home,
    Layers,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

const NAV_ITEMS = [
    { icon: Home, label: 'Overview', href: '/dashboard' },
    { icon: Layers, label: 'Sprints', href: '/dashboard', active: true },
    { icon: Users, label: 'Teams', href: '/dashboard/team' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "w-72 h-screen fixed left-0 top-0 z-50 flex flex-col p-6 transition-all duration-500",
            className
        )}>
            {/* Sidebar Glass Background */}
            <div className="absolute inset-4 bg-rose-50/40 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] -z-10" />

            {/* Logo Section */}
            <div className="px-4 mb-10">
                <Logo className="scale-110 origin-left" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                            item.active
                                ? "bg-white/80 shadow-sm text-blue-600 font-bold"
                                : "text-slate-500 hover:bg-white/40 hover:text-slate-900"
                        )}
                    >
                        {item.active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            item.active ? "text-blue-600" : "text-slate-400"
                        )} />
                        <span className="tracking-tight">{item.label}</span>
                        {item.active && <ChevronRight className="ml-auto h-4 w-4 opacity-40" />}
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto space-y-2 px-2">
                <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-white/40 hover:text-slate-900 transition-all duration-300">
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                    <span className="tracking-tight">Support</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500/80 hover:bg-red-50/50 hover:text-red-600 transition-all duration-300">
                    <LogOut className="h-5 w-5" />
                    <span className="tracking-tight font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
