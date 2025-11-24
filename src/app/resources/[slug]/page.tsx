'use client';
import { notFound, useParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/logo';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

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
    const firstTopicSlug = toSlug(level.topics[0].title);
    const firstSubTopicSlug = toSlug(level.topics[0].points[0]);


    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <LandingHeader />
            <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card className="grid grid-cols-1 md:grid-cols-12 md:gap-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border-gray-200/80">
                    <aside className="md:col-span-3 lg:col-span-3 border-r border-gray-200/80 pr-4">
                        <div className='px-3 mb-4'>
                            <Logo />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground px-3 mb-2">Topics</h2>
                        <nav className="flex flex-col gap-1">
                            {level.topics.map((topic, index) => {
                                const topicSlug = toSlug(topic.title);
                                const firstSubTopicSlugForTopic = toSlug(topic.points[0]);
                                // This is just for initial display, the actual active state will be on the next page.
                                const isActive = index === 0;

                                return (
                                    <Link
                                        key={topic.title}
                                        href={`/resources/${slug}/${topicSlug}/${firstSubTopicSlugForTopic}`}
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
                                        {topic.title}
                                    </Link>
                                )
                            })}
                        </nav>
                    </aside>

                    <div className="md:col-span-9 lg:col-span-9 mt-6 md:mt-0">
                         <div className="flex flex-col h-full">
                            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Learning Hub</p>
                            <h1 className="mt-1 text-5xl font-bold tracking-tight text-foreground">
                                {simpleLevelTitle}
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                                Learn the fundamentals of Agile methodology—covering core concepts, frameworks, and the role of AgileSuit in supporting Agile teams.
                            </p>

                            <div className="my-8">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Course Progress</h3>
                                    <p className="text-sm font-medium text-primary">0%</p>
                                </div>
                                <Progress value={0} />
                            </div>

                            <div className="mt-auto flex flex-col items-start gap-8">
                                <Button asChild size="lg">
                                    <Link href={`/resources/${slug}/${firstTopicSlug}/${firstSubTopicSlug}`}>Start Learning</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </main>
            <Footer />
        </div>
    );
}