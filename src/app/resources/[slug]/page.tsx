import { notFound } from 'next/navigation';
import Image from 'next/image';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import resourcesData from '@/app/lib/placeholder-images.json';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type ResourcePageProps = {
    params: {
        slug: string;
    };
};

// Generate metadata for each resource page
export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
    const resource = resourcesData.resources.find((p) => p.slug === params.slug);
    if (!resource) {
        return {
            title: 'Resource Not Found',
            description: 'The requested resource could not be found.',
        };
    }
    return {
        title: `${resource.title} | AgileSuit`,
        description: resource.description,
    };
}


export default function ResourcePage({ params }: ResourcePageProps) {
    const resource = resourcesData.resources.find((p) => p.slug === params.slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LandingHeader />
            <main className="flex-grow py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="mb-8">
                        <Button asChild variant="ghost">
                            <Link href="/resources" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Back to all resources
                            </Link>
                        </Button>
                    </div>
                    <article>
                        <header className="mb-12">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                {resource.title}
                            </h1>
                            <p className="mt-4 text-xl text-muted-foreground">{resource.description}</p>
                        </header>
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-12">
                            <Image 
                                src={resource.image} 
                                alt={resource.title} 
                                fill 
                                className="object-cover" 
                                data-ai-hint={resource.imageHint}
                            />
                        </div>
                        <div className="prose prose-lg max-w-none text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
                            {resource.content.split('\\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Function to generate static paths for all resources
export async function generateStaticParams() {
    return resourcesData.resources.map((resource) => ({
        slug: resource.slug,
    }));
}
