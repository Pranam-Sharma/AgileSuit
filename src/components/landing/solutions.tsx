'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import { AnimatedSection } from './animated-section';

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
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <AnimatedSection className={cn('transition-all duration-1000 ease-out', isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Your Command Center</h3>
                <h2 className="mt-4 text-6xl font-bold tracking-tight text-foreground">
                    Solutions for Every Agile Need
                </h2>
                <p className="mt-6 text-xl leading-8 text-muted-foreground">
                    Whether it&apos;s planning, tracking, retrospective, or reporting, AgileSuit has you covered.
                </p>
            </AnimatedSection>
            <AnimatedSection className={cn('rounded-xl overflow-hidden transition-all duration-1000 ease-out', isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                <Image
                    src="/images/dashboard-showcase-v3.jpg"
                    alt="AgileSuit dashboard showcase"
                    width={2070}
                    height={1164}
                    className="object-cover"
                />
            </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
