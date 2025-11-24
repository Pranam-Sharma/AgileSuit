'use client';
import * as React from 'react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import curriculumData from '@/docs/curriculum.json';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

// Helper to generate a URL-friendly slug from a title
const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

export default function ResourcesPage() {
  React.useEffect(() => {
    document.title = 'Agile Methodology Learning Hub | AgileSuit';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-grow">
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-base font-semibold leading-7 text-primary">Free for Everyone</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Agile Methodology Learning Hub
              </h1>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Your complete guide to mastering Agile, from fundamental principles to expert practices. Powered by AgileSuit.
              </p>
            </div>

            <div className="mt-20 space-y-16">
              {curriculumData.learningHubContent.map((level, levelIndex) => (
                <div key={level.level}>
                  <div className="relative text-center mb-12">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                          <h2 className="inline-flex items-center gap-3 bg-white px-4 text-2xl font-bold text-foreground">
                            <span className="text-3xl">{level.emoji}</span>
                            {level.level}
                          </h2>
                      </div>
                  </div>
                  
                  <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
                    {level.topics.map((topic, topicIndex) => {
                      const topicSlug = toSlug(topic.title);
                      return (
                        <Card key={topic.title} className="flex flex-col border-2 border-transparent hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="text-xl">
                              {`${levelIndex * 3 + topicIndex + 1}. ${topic.title}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow space-y-3">
                              <p className='text-sm text-muted-foreground'>What you&apos;ll learn:</p>
                              <ul className="space-y-2 text-sm">
                                {topic.points.map(point => (
                                    <li key={point} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                                        <span className='text-muted-foreground'>{point}</span>
                                    </li>
                                ))}
                              </ul>
                          </CardContent>
                          <CardContent>
                            <Link 
                              href={`/resources/${topicSlug}`} 
                              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                              title={`Learn more about ${topic.title}`}
                            >
                              Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
