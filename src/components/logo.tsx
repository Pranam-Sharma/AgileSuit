'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

export function Logo({ className, variant = 'default' }: { className?: string, variant?: 'default' | 'white' }) {
  const { user } = useUser();
  const href = user ? '/dashboard' : '/';

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2', className)}
      aria-label="AgileSuit Home"
    >
      <div className={cn(
        "p-2 rounded-lg",
        variant === 'white'
          ? "bg-white"
          : "bg-gradient-to-br from-primary to-orange-600"
      )}>
        <Package className={cn(
          "h-6 w-6",
          variant === 'white' ? "text-primary" : "text-white"
        )} />
      </div>
      <span className={cn(
        "text-2xl font-bold tracking-tight font-headline",
        variant === 'white' ? "text-white" : "text-foreground",
        className
      )}>
        AgileSuit
      </span>
    </Link>
  );
}
