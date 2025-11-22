
import { BarChart2, ClipboardList, Lightbulb, Users } from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Plan Sprints',
    description: 'Organize your with structured sprint plans',
  },
  {
    icon: Users,
    title: 'Collaborate Easily',
    description: 'Enhance teamwork with retrospective tools',
  },
  {
    icon: BarChart2,
    title: 'Track Progress',
    description: 'Monitor sprint status and task completion',
  },
  {
    icon: Lightbulb,
    title: 'Gain Insights',
    description: 'Generate reports to improve your performance',
  },
];

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
        <div className="mx-auto mt-16 max-w-none">
          <div className="grid grid-cols-1 gap-y-16 gap-x-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold leading-7 text-foreground">{feature.title}</h3>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
