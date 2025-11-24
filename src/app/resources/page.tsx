import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agile Methodology Learning Hub | AgileSuit',
    description: 'Learn everything about Agile, from the basics to expert-level topics. Powered by AgileSuit, free for everyone.',
};

const learningHubContent = [
    {
        level: 'LEVEL 1: Absolute Basics (Foundation)',
        emoji: '🟢',
        topics: [
            {
                title: 'What is Agile?',
                points: [
                    'What is Agile Methodology?',
                    'Why Agile was created',
                    'Traditional Waterfall vs Agile',
                    'Problems Agile solves in modern development',
                    'Agile mindset & philosophy',
                ],
            },
            {
                title: 'Agile Manifesto',
                points: [
                    '4 Core Values of Agile',
                    '12 Agile Principles explained with real examples',
                    'How Agile values apply in real teams (with AgileSuit scenarios)',
                ],
            },
            {
                title: 'Introduction to Agile Frameworks',
                points: [
                    'Scrum',
                    'Kanban',
                    'SAFe',
                    'Lean Agile',
                    'XP (Extreme Programming)',
                    'How AgileSuit supports multiple frameworks',
                ],
            },
        ],
    },
    {
        level: 'LEVEL 2: Scrum Fundamentals',
        emoji: '🟡',
        topics: [
            {
                title: 'Scrum Basics',
                points: ['What is Scrum?', 'Scrum Pillars (Transparency, Inspection, Adaptation)', 'Scrum Theory & Empiricism'],
            },
            {
                title: 'Scrum Roles',
                points: [
                    'Product Owner – Responsibilities & mindset',
                    'Scrum Master – Facilitation & leadership',
                    'Development Team – Collaboration model',
                    'Role mapping inside AgileSuit',
                ],
            },
            {
                title: 'Scrum Artifacts',
                points: ['Product Backlog', 'Sprint Backlog', 'Increment', 'Definition of Done', 'Definition of Ready'],
            },
            {
                title: 'Scrum Events',
                points: [
                    'Sprint Planning',
                    'Daily Stand-up',
                    'Sprint Review',
                    'Sprint Retrospective',
                    'How to manage all events using AgileSuit dashboards',
                ],
            },
        ],
    },
    {
        level: 'LEVEL 3: Sprint Lifecycle Mastery',
        emoji: '🟠',
        topics: [
            {
                title: 'Sprint Planning Deep Dive',
                points: [
                    'Creating a Sprint Goal',
                    'Estimation techniques',
                    'Story point allocation',
                    'Task breakdown',
                    'Capacity planning using AgileSuit',
                ],
            },
            {
                title: 'Sprint Execution',
                points: ['Managing tasks during sprint', 'Tracking work in progress (WIP)', 'Handling blockers', 'Daily sprint health analysis'],
            },
            {
                title: 'Sprint Retrospective',
                points: [
                    'What went well / What didn’t',
                    'Action items creation',
                    'Retrospective formats',
                    'Retrospective automation using AgileSuit',
                ],
            },
        ],
    },
    {
        level: 'LEVEL 4: Agile Metrics & Performance',
        emoji: '🔵',
        topics: [
            {
                title: 'Agile Metrics',
                points: ['Story Points', 'Velocity', 'Lead Time', 'Cycle Time', 'Throughput'],
            },
            {
                title: 'Sprint Metrics',
                points: ['Planned vs Completed Stories', 'Sprint Success Rate', 'Spillover analysis', 'Dependency tracking in AgileSuit'],
            },
            {
                title: 'Advanced Reports',
                points: ['Burndown Chart', 'Burnup Chart', 'Cumulative Flow Diagram', 'Velocity Trends', 'Predictive analytics using AgileSuit'],
            },
        ],
    },
    {
        level: 'LEVEL 5: Advanced Agile Practices',
        emoji: '🟣',
        topics: [
            {
                title: 'Agile Estimation Techniques',
                points: ['Planning Poker', 'T-Shirt Sizing', 'Fibonacci Estimation', 'Relative Estimation'],
            },
            {
                title: 'Backlog Management',
                points: [
                    'Grooming techniques',
                    'Prioritization strategies (MoSCoW, WSJF)',
                    'Roadmap planning',
                    'Product vision management in AgileSuit',
                ],
            },
            {
                title: 'SAFe & Scaling Agile',
                points: ['What is SAFe?', 'Agile Release Train (ART)', 'Program Increment Planning (PI Planning)', 'Multi-team sprint management in AgileSuit'],
            },
        ],
    },
    {
        level: 'LEVEL 6: Team & Culture Excellence',
        emoji: '🔴',
        topics: [
            {
                title: 'Agile Team Collaboration',
                points: ['Cross-functional teams', 'Psychological safety', 'Team maturity model', 'Collaboration workflows inside AgileSuit'],
            },
            {
                title: 'Agile Leadership',
                points: ['Servant leadership', 'Coaching strategies', 'Conflict resolution', 'Metrics-driven leadership'],
            },
        ],
    },
    {
        level: 'LEVEL 7: Technical Agile',
        emoji: '🟤',
        topics: [
            {
                title: 'DevOps & Agile Integration',
                points: ['CI/CD principles', 'Agile + DevOps lifecycle', 'Continuous delivery model', 'Integration possibilities with AgileSuit'],
            },
            {
                title: 'Agile Automation',
                points: [
                    'Automated sprint reporting',
                    'AI-driven retrospective insights',
                    'Smart velocity prediction',
                    'How AgileSuit automates iterative improvement',
                ],
            },
        ],
    },
    {
        level: 'LEVEL 8: Expert Topics',
        emoji: '⚫',
        topics: [
            {
                title: 'Agile Transformation',
                points: ['Enterprise Agile adoption', 'Change management strategies', 'Transition from Waterfall to Agile'],
            },
            {
                title: 'Agile Governance',
                points: ['Policy creation', 'Compliance tracking', 'Risk management'],
            },
            {
                title: 'AI + Agile Future',
                points: ['AI in sprint planning', 'AI-driven backlog prioritization', 'Smart Agile reporting (AgileSuit vision)'],
            },
        ],
    },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-grow">
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Agile Methodology Learning Hub
              </h1>
              <p className="mt-6 text-lg font-semibold leading-8 text-primary">
                Powered by AgileSuit (Free for Everyone)
              </p>
              <hr className="mt-8 border-border" />
            </div>

            <div className="mx-auto mt-16 max-w-4xl">
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {learningHubContent.map((level, levelIndex) => (
                  <AccordionItem value={`item-${levelIndex}`} key={levelIndex}>
                    <AccordionTrigger className="text-xl sm:text-2xl font-bold hover:no-underline">
                      <span className="flex items-center gap-4">
                        <span className="text-2xl">{level.emoji}</span>
                        {level.level}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-12 pr-4">
                      <div className="space-y-8 py-4">
                        {level.topics.map((topic, topicIndex) => (
                          <div key={topicIndex}>
                            <h3 className="text-lg font-semibold text-foreground mb-3">{`${topicIndex + 1}. ${topic.title}`}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                              {topic.points.map((point, pointIndex) => (
                                <li key={pointIndex}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}