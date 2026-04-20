'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { useUser } from '@/hooks/use-user';

export function Logo({ className, variant = 'default' }: { className?: string, variant?: 'default' | 'white' }) {
  const { user } = useUser();
  const href = user ? '/dashboard' : '/';

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-0', className)}
      aria-label="AgileSuit Home"
    >
      <div className="relative h-16 w-auto">
        <img
          src="/images/AgileSuitLogo.jpg"
          alt="AgileSuit Logo"
          className="h-full w-auto object-contain"
        />
      </div>
      <div className="relative h-10 w-auto -ml-3">
        <img
          src="/images/AgileSuitLogoText.jpg"
          alt="AgileSuit"
          className="h-full w-auto object-contain"
        />
      </div>
    </Link>
  );
}
