
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BarChart, Users, Settings } from 'lucide-react';

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Task Management',
    description: 'Organize, assign, and track tasks to keep your team aligned and productive.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Reporting & Analytics',
    description: 'Gain insights into your team\'s performance with comprehensive reports.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Team Collaboration',
    description: 'Facilitate communication and collaboration with a centralized platform.',
  },
  {
    icon: <Settings className="h-8 w-8 text-primary" />,
    title: 'Custom Workflows',
    description: 'Adapt the tool to your team\'s unique processes with customizable workflows.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/20">
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
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className='pt-2'>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
