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
      <Package className="h-12 w-12 text-primary" />
      <span className={cn("text-5xl font-bold tracking-tight text-foreground font-headline", className)}>
        AgileSuit
      </span>
    </Link>
  );
}
