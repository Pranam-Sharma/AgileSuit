'use client';
import * as React from 'react';
import { notFound, useParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-');
};

const findTopicBySlugs = (levelSlug: string, topicSlug: string) => {
    const getSimpleTitle = (levelString: string) => {
        const match = levelString.match(/:\s(.*?)\s\(/);
        return match ? match[1] : levelString.split(':')[1]?.trim() || levelString;
    }
    const level = curriculumData.learningHubContent.find(l => toSlug(getSimpleTitle(l.level)) === levelSlug);
    if (!level) return null;

    const topic = level.topics.find(t => toSlug(t.title) === topicSlug);
    if (!topic) return null;

    return topic;
}

export default function ResourceSubTopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const levelSlug = params.slug as string;
  const topicSlug = params.topicSlug as string; // This will now be the main topic slug
  const subTopicSlug = params.subTopicSlug as string;

  const topic = findTopicBySlugs(levelSlug, topicSlug);

  if (!topic) {
    // This case might be hit if the URL is manually entered wrong.
    // The individual pages should handle their own notFound.
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <LandingHeader />
            <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
        <LandingHeader />
        <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 md:gap-8">
                <aside className="md:col-span-3 lg:col-span-3 border-r border-gray-200/80 pr-4">
                    <h2 className="text-lg font-semibold text-foreground px-3 mb-2">{topic.title}</h2>
                    <nav className="flex flex-col gap-1">
                        {topic.points.map((point) => {
                            const currentSubTopicSlug = toSlug(point);
                            const isActive = currentSubTopicSlug === subTopicSlug;

                            return (
                                <Link
                                    key={point}
                                    href={`/resources/${levelSlug}/${topicSlug}/${currentSubTopicSlug}`}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <div className={cn(
                                        'h-1.5 w-1.5 rounded-full ring-2 ring-offset-2 transition-all',
                                        isActive ? 'ring-primary bg-primary' : 'ring-transparent bg-muted-foreground/50'
                                    )}></div>
                                    {point}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                <div className="md:col-span-9 lg:col-span-9 mt-6 md:mt-0">
                    {children}
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
