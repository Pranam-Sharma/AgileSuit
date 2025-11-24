import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import resourcesData from '@/app/lib/placeholder-images.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resources | AgileSuit',
    description: 'Explore our guides, best practices, and case studies to get the most out of AgileSuit.',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-grow">
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Resources</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Learn and grow with AgileSuit
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Explore our guides, best practices, and case studies to get the most out of AgileSuit.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {resourcesData.resources.map((resource) => (
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
