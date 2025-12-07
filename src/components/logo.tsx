'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

export function Logo({ className }: { className?: string }) {
  const { user } = useUser();
  const href = user ? '/dashboard' : '/';

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2', className)}
      aria-label="AgileSuit Home"
    >
      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500">
        <Package className="h-6 w-6 text-white" />
      </div>
      <span className={cn("text-2xl font-bold tracking-tight text-foreground font-headline", className)}>
        AgileSuit
      </span>
    </Link>
  );
}
