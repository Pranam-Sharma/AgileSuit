'use client';
import { notFound, useParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import React from 'react';

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
    return curriculumData.learningHubContent.find(level => {
        const simpleTitle = getSimpleTitle(level.level);
        return toSlug(simpleTitle) === slug;
    });
}

export default function ResourceTopicPage() {
    const params = useParams();
    const slug = params.slug as string;
    const level = findLevelBySlug(slug);

    if (!level) {
        notFound();
    }
    
    const simpleLevelTitle = getSimpleTitle(level.level);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <LandingHeader />
            <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <p className="text-base font-semibold text-primary">{level.level.split(':')[0]}</p>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            {simpleLevelTitle}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore the core topics within {simpleLevelTitle.toLowerCase()}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {level.topics.map((topic) => {
                            const firstSubTopicSlug = toSlug(topic.points[0]);
                            const topicSlug = toSlug(topic.title);
                            return (
                            <Card key={topic.title} className="flex flex-col rounded-xl border-2 border-gray-200/80 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <p className="text-sm font-semibold text-muted-foreground">What you'll learn:</p>
                                    <ul className="space-y-2 text-sm">
                                        {topic.points.slice(0, 3).map(point => (
                                            <li key={point} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-muted-foreground">{point}</span>
                                            </li>
                                        ))}
                                        {topic.points.length > 3 && <li className="text-muted-foreground">& more...</li>}
                                    </ul>
                                </CardContent>
                                <div className='p-6 pt-0'>
                                    <Button asChild className="w-full">
                                        <Link href={`/resources/${slug}/${topicSlug}`}>Start Learning</Link>
                                    </Button>
                                </div>
                            </Card>
                        )})}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
