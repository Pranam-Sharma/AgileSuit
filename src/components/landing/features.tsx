import { TaskManagementIcon } from '../icons/task-management-icon';
import { ReportingAnalyticsIcon } from '../icons/reporting-analytics-icon';
import { TeamCollaborationIcon } from '../icons/team-collaboration-icon';
import { CustomWorkflowsIcon } from '../icons/custom-workflows-icon';

const features = [
  {
    icon: TaskManagementIcon,
    title: 'Task Management',
    description: 'Organize, assign, and track tasks to keep your team aligned and productive.',
  },
  {
    icon: ReportingAnalyticsIcon,
    title: 'Reporting & Analytics',
    description: 'Gain insights into your team\'s performance with comprehensive reports.',
  },
  {
    icon: TeamCollaborationIcon,
    title: 'Team Collaboration',
    description: 'Facilitate communication and collaboration with a centralized platform.',
  },
  {
    icon: CustomWorkflowsIcon,
    title: 'Custom Workflows',
    description: 'Adapt the tool to your team\'s unique processes with customizable workflows.',
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
                <div className="flex h-32 w-32 items-center justify-center">
                  <feature.icon className="h-32 w-32" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold leading-7 text-foreground">{feature.title}</h3>
                <p className="mt-4 text-lg leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
