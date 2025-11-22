'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function SolutionsSection() {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="solutions" className="py-24 sm:py-32 bg-white" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Your Command Center</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All-in-One Project Dashboard
          </p>
           <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get a bird's-eye view of your sprint's progress. Track points, monitor burndown, and gain AI-powered insights to keep your team aligned and on schedule.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
            <div className={cn('rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 ease-out', isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                <Image
                    src="/images/dashboard-showcase.jpg"
                    alt="AgileSuit dashboard showcase"
                    width={2070}
                    height={1164}
                    className="object-cover"
                    data-ai-hint="dashboard analytics"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
