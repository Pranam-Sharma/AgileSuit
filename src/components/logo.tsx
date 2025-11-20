import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';

export function Logo({ className }: { className?: string }) {
    const { state } = useSidebar();
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2', className)}
      aria-label="AgileSuit Home"
    >
      <Package className="h-8 w-8 text-primary" />
      <span className={cn("text-2xl font-bold tracking-tight text-foreground font-headline group-data-[collapsible=icon]/sidebar-wrapper:hidden", className)}>
        AgileSuit
      </span>
    </Link>
  );
}
