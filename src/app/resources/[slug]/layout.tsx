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

const findTopicBySlug = (slug: string) => {
    for (const level of curriculumData.learningHubContent) {
        const foundTopic = level.topics.find(topic => toSlug(topic.title) === slug);
        if (foundTopic) return foundTopic;
    }
    return null;
}

export default function ResourceTopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const topicSlug = params.slug as string;
  const subTopicSlug = params.subTopicSlug as string;

  const topic = findTopicBySlug(topicSlug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
        <LandingHeader />
        <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 md:gap-8">
                <aside className="md:col-span-3 lg:col-span-3 border-r border-gray-200/80 pr-4">
                    <h2 className="text-lg font-semibold text-foreground px-3 mb-2">{topic.title}</h2>
                    <nav className="flex flex-col gap-1">
                        {topic.points.map((point, index) => {
                            const currentSubTopicSlug = toSlug(point);
                            const isActive = currentSubTopicSlug === subTopicSlug;

                            return (
                                <Link
                                    key={index}
                                    href={`/resources/${topicSlug}/${currentSubTopicSlug}`}
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
