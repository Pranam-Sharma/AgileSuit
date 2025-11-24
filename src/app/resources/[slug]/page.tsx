'use client';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/logo';

const getSimpleTitle = (levelString: string) => {
    const match = levelString.match(/:\s(.*?)\s\(/);
    return match ? match[1] : levelString.split(':')[1]?.trim() || levelString;
};

const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-');
};

const findContent = (levelSlug: string, subTopicSlug: string | null) => {
    const level = curriculumData.learningHubContent.find(l => toSlug(getSimpleTitle(l.level)) === levelSlug);
    if (!level) return null;

    if (!subTopicSlug) {
        return { level, topic: null, point: null };
    }

    for (const topic of level.topics) {
        const point = topic.points.find(p => toSlug(p) === subTopicSlug);
        if (point) {
            return { level, topic, point };
        }
    }
    
    return { level, topic: null, point: null }; // Subtopic not found, but we can still show level info
}

function LevelIntro({ level }: { level: any }) {
    const simpleLevelTitle = getSimpleTitle(level.level);
    const firstTopic = level.topics[0];
    const firstSubtopic = firstTopic?.points[0];
    const startLearningHref = firstTopic && firstSubtopic ? `/resources/${toSlug(simpleLevelTitle)}?subtopic=${toSlug(firstSubtopic)}` : '#';

    return (
        <article className="prose prose-lg max-w-none">
             <p className="text-sm font-medium text-primary uppercase tracking-wider">Learning Hub</p>
             <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {simpleLevelTitle}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
                Learn the fundamentals of Agile methodology—covering core concepts, frameworks, and the role of AgileSuit in supporting Agile teams.
            </p>
            <div className='my-8'>
                <p className='flex justify-between items-center text-sm font-medium text-muted-foreground'>
                    <span>Course Progress</span>
                    <span>10%</span>
                </p>
                <Progress value={10} className='mt-2' />
            </div>
            <Button asChild size="lg">
                <Link href={startLearningHref}>Start Learning</Link>
            </Button>
            <div className='mt-12 flex justify-start'>
                <Logo />
            </div>
        </article>
    );
}

function SubTopicArticle({ topic, point }: { topic: any, point: string }) {
     return (
        <article className="prose prose-lg max-w-none">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">{topic.title}</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                {point}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Detailed content for "{point}" will be displayed here. This section will include explanations,
                visual examples, real use-cases, and how AgileSuit helps with this concept. For now, this is placeholder content.
            </p>
            
            <div className='my-8 p-6 bg-primary/5 border-l-4 border-primary'>
                <p className='text-lg m-0'>This is an example of how a "How AgileSuit Helps" section could look, highlighting specific features or benefits.</p>
            </div>

            <p>
                Continue reading the detailed explanation of this sub-topic. We can add images, code snippets, and more to make this a rich learning experience.
            </p>
            
            <Card className="mt-8 bg-card border-border">
                <CardHeader>
                    <CardTitle>Key Takeaways</CardTitle>
                    <CardDescription>Main points to remember from this section on {point}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 my-0">
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>This is the first key takeaway. It summarizes a crucial point about this topic.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>This is another important concept to understand from the article.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>And here is a final summary point for this sub-topic. Remember this!</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </article>
    );
}


export default function ResourcePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const levelSlug = params.slug as string;
    const subTopicSlug = searchParams.get('subtopic');
    
    const result = findContent(levelSlug, subTopicSlug);

    if (!result) {
        notFound();
    }
    const { level, topic, point } = result;

    if (topic && point) {
        return <SubTopicArticle topic={topic} point={point} />;
    }

    return <LevelIntro level={level} />;
}
