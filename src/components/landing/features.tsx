
import Image from 'next/image';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Core Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for agile excellence
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            AgileSuit provides a comprehensive suite of tools to help your team succeed.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
            <div className={'rounded-3xl overflow-hidden'}>
                <Image
                    src="/images/features-showcase.jpg"
                    alt="AgileSuit features showcase"
                    width={2070}
                    height={1164}
                    className="object-cover"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
