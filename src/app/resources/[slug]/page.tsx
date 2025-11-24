import { notFound } from 'next/navigation';
import Image from 'next/image';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import curriculumData from '@/docs/curriculum.json';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper to generate a URL-friendly slug from a title
const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

type ResourcePageProps = {
    params: {
        slug: string;
    };
};

const findTopicBySlug = (slug: string) => {
    for (const level of curriculumData.learningHubContent) {
        const foundTopic = level.topics.find(topic => toSlug(topic.title) === slug);
        if (foundTopic) return foundTopic;
    }
    return null;
}

// Generate metadata for each resource page
export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
    const topic = findTopicBySlug(params.slug);

    if (!topic) {
        return {
            title: 'Topic Not Found',
            description: 'The requested topic could not be found.',
        };
    }
    return {
        title: `${topic.title} | AgileSuit Learning Hub`,
        description: `Learn about ${topic.title} and related concepts.`,
    };
}


export default function ResourcePage({ params }: ResourcePageProps) {
    const topic = findTopicBySlug(params.slug);

    if (!topic) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LandingHeader />
            <main className="flex-grow py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-12">
                        <Button asChild variant="ghost">
                            <Link href="/resources" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Learning Hub
                            </Link>
                        </Button>
                    </div>
                    
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                            {topic.title}
                        </h1>
                        <p className="mt-4 text-xl text-muted-foreground">Explore the key concepts within this topic. Click a card to start learning.</p>
                    </header>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {topic.points.map((point, index) => {
                            const subTopicSlug = toSlug(point);
                            return (
                                <Link key={index} href={`/resources/${params.slug}/${subTopicSlug}`} className="block group">
                                    <Card className="flex flex-col h-full border-2 border-transparent group-hover:border-primary group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-primary/10 p-3 rounded-lg">
                                                   <BookOpenCheck className="h-6 w-6 text-primary" />
                                                </div>
                                                <CardTitle className="text-lg">{point}</CardTitle>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

// Function to generate static paths for all topics in the curriculum
export async function generateStaticParams() {
    return curriculumData.learningHubContent.flatMap(level =>
        level.topics.map(topic => ({
            slug: toSlug(topic.title),
        }))
    );
}
