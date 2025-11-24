'use client';
import * as React from 'react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import curriculumData from '../../docs/curriculum.json';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { ArrowRight, BookOpen, Scaling, BarChart, Users, Star, Cpu, GraduationCap } from 'lucide-react';

// Helper to generate a URL-friendly slug from a title
const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

const levelIcons: Record<string, { icon: React.ElementType; color: string }> = {
    'LEVEL 1': { icon: BookOpen, color: 'bg-teal-100 text-teal-600' },
    'LEVEL 2': { icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    'LEVEL 3': { icon: Cpu, color: 'bg-orange-100 text-orange-600' },
    'LEVEL 4': { icon: BarChart, color: 'bg-blue-100 text-blue-600' },
    'LEVEL 5': { icon: Scaling, color: 'bg-purple-100 text-purple-600' },
    'LEVEL 6': { icon: Users, color: 'bg-red-100 text-red-600' },
    'LEVEL 7': { icon: Cpu, color: 'bg-amber-100 text-amber-700' },
    'LEVEL 8': { icon: GraduationCap, color: 'bg-slate-100 text-slate-600' },
};

export default function ResourcesPage() {
  React.useEffect(() => {
    document.title = 'Agile Methodology Learning Hub | AgileSuit';
  }, []);

  // Function to extract the simple title from the level string
  const getSimpleTitle = (levelString: string) => {
    const match = levelString.match(/:\s(.*?)\s\(/);
    return match ? match[1] : levelString;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-grow">
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Agile Methodology Learning Hub
                </h1>
                <div className="mt-6 flex items-center justify-center gap-2 text-lg leading-8 text-muted-foreground">
                    Powered by <Logo /> <span>(Free for Everyone)</span>
                </div>
            </div>

            <div className="mt-20 space-y-16">
              <div className="mx-auto grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
                {curriculumData.learningHubContent.map((level, levelIndex) => {
                  const levelNumber = level.level.split(':')[0];
                  const Icon = levelIcons[levelNumber]?.icon || BookOpen;
                  const iconColor = levelIcons[levelNumber]?.color || 'bg-gray-100 text-gray-600';
                  const simpleTitle = getSimpleTitle(level.level);

                  return (
                    <Link key={level.level} href={`/resources/${toSlug(level.topics[0].title)}`} className="block group">
                        <Card className="h-full border-2 border-gray-200/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                            <CardContent className="p-6 flex gap-6 items-start">
                                <div className={cn("flex-shrink-0 rounded-lg h-16 w-16 flex items-center justify-center", iconColor)}>
                                    <Icon className="h-8 w-8" />
                                </div>
                                <div className='flex-grow'>
                                    <h2 className="text-xl font-bold text-foreground">
                                       <span className='text-primary'>{levelIndex + 1}</span> {simpleTitle}
                                    </h2>
                                    <ul className="mt-4 space-y-2 text-md text-muted-foreground">
                                        {level.topics.map(topic => (
                                            <li key={topic.title} className='flex items-center gap-2 hover:text-foreground transition-colors'>
                                                {topic.title}
                                                <ArrowRight className='h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity' />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
