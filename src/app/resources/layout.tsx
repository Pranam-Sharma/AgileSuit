'use client';
import * as React from 'react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { useParams, useSearchParams } from 'next/navigation';
import curriculumData from '../../docs/curriculum.json';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const getSimpleTitle = (levelString: string) => {
    const match = levelString.match(/:\s(.*?)\s\(/);
    return match ? match[1] : levelString.split(':')[1]?.trim() || levelString;
}

const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-');
};

const findLevelBySlug = (slug: string) => {
    return curriculumData.learningHubContent.find(level => toSlug(getSimpleTitle(level.level)) === slug);
}

function Sidebar() {
    const params = useParams();
    const searchParams = useSearchParams();
    const levelSlug = params.slug as string;
    const subTopicSlug = searchParams.get('subtopic');

    const level = findLevelBySlug(levelSlug);

    if (!level) return null;

    const defaultActiveTopic = level.topics.find(topic => topic.points.some(p => toSlug(p) === subTopicSlug))?.title;

    return (
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-200/80 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Topics</h2>
            <Accordion type="single" collapsible defaultValue={defaultActiveTopic ? toSlug(defaultActiveTopic) : undefined}>
                {level.topics.map((topic) => {
                    const topicSlug = toSlug(topic.title);
                    return (
                        <AccordionItem value={topicSlug} key={topicSlug}>
                            <AccordionTrigger className="text-base font-medium hover:no-underline">
                                {topic.title}
                            </AccordionTrigger>
                            <AccordionContent>
                                <nav className="flex flex-col gap-1 pl-4 border-l ml-2">
                                    {topic.points.map((point) => {
                                        const currentSubTopicSlug = toSlug(point);
                                        const isActive = currentSubTopicSlug === subTopicSlug;

                                        return (
                                            <Link
                                                key={point}
                                                href={`/resources/${levelSlug}?subtopic=${currentSubTopicSlug}`}
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
                                        );
                                    })}
                                </nav>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </aside>
    );
}

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LandingHeader />
            <div className="flex-grow container mx-auto">
                <div className="flex flex-col md:flex-row">
                    <Sidebar />
                    <main className="flex-grow p-6 md:p-8 lg:p-12">
                        {children}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}
