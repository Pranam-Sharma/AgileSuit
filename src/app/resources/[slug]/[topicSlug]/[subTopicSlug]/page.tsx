'use client';
import { notFound, useParams } from 'next/navigation';
import curriculumData from '../../../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

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

const findTopicAndSubTopicBySlugs = (levelSlug: string, topicSlug: string, subTopicSlug: string) => {
    const level = curriculumData.learningHubContent.find(l => toSlug(getSimpleTitle(l.level)) === levelSlug);
    if (!level) return null;

    const topic = level.topics.find(t => toSlug(t.title) === topicSlug);
    if (!topic) return null;
    
    const point = topic.points.find(p => toSlug(p) === subTopicSlug);
    if (!point) return null;

    return { level, topic, point };
}

export default function SubTopicPage() {
    const params = useParams();
    const levelSlug = params.slug as string;
    const topicSlug = params.topicSlug as string;
    const subTopicSlug = params.subTopicSlug as string;
    
    const result = findTopicAndSubTopicBySlugs(levelSlug, topicSlug, subTopicSlug);

    if (!result) {
        notFound();
    }
    const { topic, point } = result;

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
