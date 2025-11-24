'use client';
import * as React from 'react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import resources from '@/app/lib/placeholder-images.json';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// Note: Metadata is usually handled in Server Components, but for this client-side
// reconstruction, we'll manage the title with useEffect. A proper implementation
// would involve a server component wrapper.
//
// export const metadata: Metadata = {
//     title: 'Agile Resources | AgileSuit',
//     description: 'Explore our comprehensive library of Agile resources, guides, and best practices.',
// };

export default function ResourcesPage() {

    React.useEffect(() => {
        document.title = 'Agile Resources | AgileSuit';
    }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-grow">
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Agile Resources
              </h1>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Explore our comprehensive library of Agile resources, guides, and best practices to master agile development.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {resources.resources.map((resource) => (
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
                    <Link href={`/resources/${resource.slug}`} className="flex items-center text-primary font-semibold">
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
