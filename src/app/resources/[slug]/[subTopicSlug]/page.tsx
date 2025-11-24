import { notFound } from 'next/navigation';
import curriculumData from '@/docs/curriculum.json';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

type SubTopicPageProps = {
    params: {
        slug: string;
        subTopicSlug: string;
    };
};

const findTopicAndSubTopicBySlugs = (slug: string, subTopicSlug: string) => {
    for (const level of curriculumData.learningHubContent) {
        const topic = level.topics.find(t => toSlug(t.title) === slug);
        if (topic) {
            const point = topic.points.find(p => toSlug(p) === subTopicSlug);
            if (point) {
                return { topic, point };
            }
        }
    }
    return null;
}

export async function generateMetadata({ params }: SubTopicPageProps): Promise<Metadata> {
    const result = findTopicAndSubTopicBySlugs(params.slug, params.subTopicSlug);

    if (!result) {
        return {
            title: 'Sub-Topic Not Found',
        };
    }
    return {
        title: `${result.point} | ${result.topic.title}`,
        description: `Learn about ${result.point}.`,
    };
}


export default function SubTopicPage({ params }: SubTopicPageProps) {
    const result = findTopicAndSubTopicBySlugs(params.slug, params.subTopicSlug);

    if (!result) {
        notFound();
    }
    const { topic, point } = result;

    return (
        <div>
            <p className="text-sm font-medium text-primary">Learning Hub</p>
            <h1 className="mt-1 text-5xl font-bold tracking-tight text-foreground">
                {topic.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Learn the fundamentals of Agile methodology—covering core concepts, frameworks, and the role of AgileSuit in supporting Agile teams.
            </p>
            <div className="mt-8 max-w-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-foreground">Course Progress</h3>
                    <p className="text-sm font-medium text-primary">10%</p>
                </div>
                <Progress value={10} className="h-2" />
            </div>
            <Button size="lg" className="mt-6">
                Start Learning
            </Button>

            <article className="prose prose-lg max-w-none mt-8 pt-8 border-t">
                <h2>{point}</h2>
                <p>
                    Detailed content for "{point}" will be displayed here. This section can include explanations,
                    visual examples, real use-cases, and how AgileSuit helps with this concept.
                </p>
                
                <Card className="mt-8 bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle>Key Takeaways</CardTitle>
                        <CardDescription>Main points to remember from this section.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary mt-1" />
                                <span>This is the first key takeaway. It summarizes a crucial point.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary mt-1" />
                                <span>This is another important concept to understand.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary mt-1" />
                                <span>And here is a final summary point for this sub-topic.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </article>
        </div>
    );
}

export async function generateStaticParams() {
    const params = [];
    for (const level of curriculumData.learningHubContent) {
        for (const topic of level.topics) {
            for (const point of topic.points) {
                params.push({
                    slug: toSlug(topic.title),
                    subTopicSlug: toSlug(point),
                });
            }
        }
    }
    return params;
}
