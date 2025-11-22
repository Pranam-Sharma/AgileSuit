'use client';

import * as React from 'react';
import { Users, ListChecks, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const solutions = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Team Alignment',
    description: 'Ensure your team is always on the same page with task-sharing and transparent updates.',
  },
  {
    icon: <ListChecks className="h-6 w-6 text-primary" />,
    title: 'Effective Prioritization',
    description: 'Prioritize and manage tasks effectively so your team can focus on what matters most.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: 'Accountability',
    description: 'Hold everyone accountable without the need for constant check-ins.',
  },
];

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
        observer.unobserve(sectionref.current);
      }
    };
  }, []);

  return (
    <section id="solutions" className="py-24 sm:py-32 bg-black" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Solutions</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Solve your team's biggest challenges
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-3">
            {solutions.map((solution, index) => (
              <div
                key={solution.title}
                className={cn(
                  'text-center sm:flex sm:text-left lg:block lg:text-center opacity-0',
                  isVisible && 'animate-slide-in-right'
                )}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="sm:flex-shrink-0">
                  <div className="flow-root">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {solution.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-6 lg:mt-6 lg:ml-0">
                  <h3 className="text-lg font-medium text-white">{solution.title}</h3>
                  <p className="mt-2 text-gray-400">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 aspect-[4/2] lg:aspect-[5/2] xl:aspect-[16/6] relative rounded-2xl shadow-2xl overflow-hidden border">
             <Image 
                src="https://picsum.photos/seed/dashboard/1200/600"
                alt="AgileSuit Dashboard"
                fill
                className="object-cover"
                data-ai-hint="dashboard analytics"
             />
          </div>
        </div>
      </div>
    </section>
  );
}
