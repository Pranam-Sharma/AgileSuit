
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const resources = [
  {
    title: 'Getting Started with Agile',
    description: 'A beginner\'s guide to agile methodologies and how to implement them.',
    image: 'https://picsum.photos/seed/resource1/600/400',
    imageHint: 'team meeting',
    link: '#',
  },
  {
    title: 'Best Practices for Sprint Planning',
    description: 'Learn how to plan effective sprints that deliver results.',
    image: 'https://picsum.photos/seed/resource2/600/400',
    imageHint: 'whiteboard planning',
    link: '#',
  },
  {
    title: 'Case Study: How Acme Inc. Increased Productivity',
    description: 'Discover how AgileSuit helped a leading company improve their workflow.',
    image: 'https://picsum.photos/seed/resource3/600/400',
    imageHint: 'office analytics',
    link: '#',
  },
];

export function ResourcesSection() {
  return (
    <section id="resources" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Resources</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Learn and grow with AgileSuit
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Explore our guides, best practices, and case studies to get the most out of AgileSuit.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow bg-card border">
               <div className="aspect-video relative">
                <Image
                    src={resource.image}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    data-ai-hint={resource.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={resource.link} className="flex items-center text-primary font-semibold">
                  Read more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
