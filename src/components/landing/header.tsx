'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '#solutions', label: 'Solutions' },
  { href: '#features', label: 'Features' },
  { href: '#resources', label: 'Resources' },
  { href: '/pricing', label: 'Pricing' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace(/.*#/, '');
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <Link
      href={href}
      onClick={handleScroll}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
    </Link>
  );
}

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  React.useEffect(() => {
    if (!isLandingPage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <header
      className={cn(
        'z-50 transition-all duration-300',
        isLandingPage ? 'sticky top-0' : 'bg-gray-50',
        isScrolled
          ? 'bg-background/80 shadow-sm backdrop-blur-sm'
          : isLandingPage ? 'bg-transparent' : ''
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          {isLandingPage && (
            <nav className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </nav>
          )}
        </div>
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="default" className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Demo</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Logo />
                {isLandingPage && (
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                )}
                <div className="mt-auto flex flex-col gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Get Demo</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
