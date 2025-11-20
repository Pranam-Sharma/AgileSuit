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
      <div className="bg-blue-600 p-2 rounded-lg">
        <Package className="h-6 w-6 text-white" />
      </div>
      <span className={cn("text-2xl font-bold tracking-tight text-foreground font-headline", className)}>
        AgileSuit
      </span>
    </Link>
  );
}
