'use client';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import curriculumData from '../../docs/curriculum.json';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { ArrowRight, BookOpen, Scaling, BarChart, Users, Star, Cpu, GraduationCap } from 'lucide-react';

const getSimpleTitle = (levelString: string) => {
    const match = levelString.match(/:\s(.*?)\s\(/);
    return match ? match[1] : levelString.split(':')[1]?.trim() || levelString;
}

// Helper to generate a URL-friendly slug from a title
const toSlug = (title: string) => {
  const simpleTitle = getSimpleTitle(title);
  return simpleTitle
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-');
};

const levelIcons: Record<string, { icon: React.ElementType; color: string, gradient: string }> = {
    'LEVEL 1': { icon: BookOpen, color: 'text-teal-600', gradient: 'from-teal-50 to-white' },
    'LEVEL 2': { icon: Star, color: 'text-yellow-600', gradient: 'from-yellow-50 to-white' },
    'LEVEL 3': { icon: Cpu, color: 'text-orange-600', gradient: 'from-orange-50 to-white' },
    'LEVEL 4': { icon: BarChart, color: 'text-blue-600', gradient: 'from-blue-50 to-white' },
    'LEVEL 5': { icon: Scaling, color: 'text-purple-600', gradient: 'from-purple-50 to-white' },
    'LEVEL 6': { icon: Users, color: 'text-red-600', gradient: 'from-red-50 to-white' },
    'LEVEL 7': { icon: Cpu, color: 'text-amber-700', gradient: 'from-amber-50 to-white' },
    'LEVEL 8': { icon: GraduationCap, color: 'text-slate-600', gradient: 'from-slate-50 to-white' },
};

export default function ResourcesPage() {
  React.useEffect(() => {
    document.title = 'Agile Methodology Learning Hub | AgileSuit';
  }, []);

  return (
    <>
      <main className="flex-grow bg-gray-50">
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-0" />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 relative z-10">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Agile Methodology Learning Hub
                    </h1>
                    <div className="mt-6 flex items-center justify-center gap-2 text-lg leading-8 text-muted-foreground">
                        Powered by <Logo /> <span>(Free for Everyone)</span>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-16 -mt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="column-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {curriculumData.learningHubContent.map((level, levelIndex) => {
                const levelNumber = level.level.split(':')[0];
                const Icon = levelIcons[levelNumber]?.icon || BookOpen;
                const iconColor = levelIcons[levelNumber]?.color || 'text-gray-600';
                const gradient = levelIcons[levelNumber]?.gradient || 'from-gray-50 to-white';
                const simpleTitle = getSimpleTitle(level.level);
                const levelSlug = toSlug(level.level);
                const description = level.level.split('(')[1];

                return (
                  <Link key={level.level} href={`/resources/${levelSlug}`} className="block group break-inside-avoid">
                      <Card className={cn(
                          "h-full border-2 border-transparent rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br",
                          gradient
                          )}>
                          <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                  <div className={cn("flex-shrink-0 rounded-full h-12 w-12 flex items-center justify-center bg-white shadow-inner", iconColor)}>
                                      <Icon className="h-6 w-6" />
                                  </div>
                                  <div className='flex-grow'>
                                      <h2 className="text-xl font-bold text-foreground">
                                         {simpleTitle}
                                      </h2>
                                      <p className="text-sm text-muted-foreground">{description ? description.replace(')','') : ''}</p>
                                  </div>
                              </div>
                              <ul className="mt-6 space-y-3 text-md text-muted-foreground">
                                  {level.topics.map(topic => (
                                      <li key={topic.title} className='flex items-center gap-3 group-hover:text-foreground transition-colors'>
                                          <ArrowRight className='h-4 w-4 text-primary/50 group-hover:text-primary transition-colors' />
                                          <span>{topic.title}</span>
                                      </li>
                                  ))}
                              </ul>
                          </CardContent>
                      </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
