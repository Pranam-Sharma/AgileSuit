import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2', className)}
      aria-label="AgileSuit Home"
    >
      <Package className="h-7 w-7 text-primary" />
      <span className="text-2xl font-bold tracking-tight text-foreground font-headline">
        AgileSuit
      </span>
    </Link>
  );
}
