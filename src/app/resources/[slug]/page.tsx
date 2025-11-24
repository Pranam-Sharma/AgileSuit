'use client';
import { notFound, useParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

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

export default function ResourceLevelPage() {
    const params = useParams();
    const slug = params.slug as string;
    const level = findLevelBySlug(slug);

    if (!level) {
        notFound();
    }
    
    const simpleLevelTitle = getSimpleTitle(level.level);
    const levelNumberMatch = level.level.match(/LEVEL (\d+)/);
    const levelNumber = levelNumberMatch ? levelNumberMatch[1] : '';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-base font-semibold text-primary uppercase tracking-wider">Level {levelNumber}</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        {simpleLevelTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Explore the core topics within {simpleLevelTitle.toLowerCase()}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {level.topics.map((topic) => {
                        const topicSlug = toSlug(topic.title);
                        const firstSubTopicSlug = toSlug(topic.points[0]);
                        return (
                        <Card key={topic.title} className="flex flex-col border-2 border-gray-200/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                                <CardTitle>{topic.title}</CardTitle>
                                <CardDescription>What you'll learn:</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {topic.points.slice(0, 3).map(point => (
                                        <li key={point} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                     {topic.points.length > 3 && (
                                        <li className="flex items-center gap-2">
                                            <span className='ml-6'>& more...</span>
                                        </li>
                                    )}
                                </ul>
                            </CardContent>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/resources/${slug}/${topicSlug}/${firstSubTopicSlug}`}>
                                        Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            </main>
        </div>
    );
}
