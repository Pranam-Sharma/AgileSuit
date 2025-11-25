'use client';
import * as React from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart, Check, CheckCircle2, Circle, Clock, GitBranch, Layers, Lightbulb, Milestone, RefreshCw, Repeat, Search, Target, Users, Zap, AlertTriangle, Scale, BookOpen, ThumbsUp, UsersRound, Handshake, Code } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/logo';

const getSimpleTitle = (levelString: string) => {
    if (!levelString) return '';
    const match = levelString.match(/:\s(.*?)\s\(/);
    return match ? match[1] : levelString.split(':')[1]?.trim() || levelString;
};

const toSlug = (title: string) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

const findContent = (levelSlug: string, subTopicSlug: string | null) => {
    const level = curriculumData.learningHubContent.find(l => toSlug(getSimpleTitle(l.level)) === levelSlug);
    if (!level) return null;

    if (!subTopicSlug) {
        return { level, topic: null, point: null };
    }

    for (const topic of level.topics) {
        const point = topic.points.find(p => toSlug(p) === subTopicSlug);
        if (point) {
            return { level, topic, point };
        }
    }
    
    return { level, topic: null, point: null }; // Subtopic not found, but we can still show level info
}

function LevelIntro({ level }: { level: any }) {
    const simpleLevelTitle = getSimpleTitle(level.level);
    const firstTopic = level.topics[0];
    const firstSubtopic = firstTopic?.points[0];
    const startLearningHref = firstTopic && firstSubtopic ? `/resources/${toSlug(simpleLevelTitle)}?subtopic=${toSlug(firstSubtopic)}` : '#';

    return (
        <article className="prose prose-lg max-w-none p-6 md:p-8 lg:p-12">
             <p className="text-sm font-medium text-primary uppercase tracking-wider">Learning Hub</p>
             <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {simpleLevelTitle}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
                Learn the fundamentals of Agile methodology—covering core concepts, frameworks, and the role of AgileSuit in supporting Agile teams.
            </p>
            <div className='my-8'>
                <p className='flex justify-between items-center text-sm font-medium text-muted-foreground'>
                    <span>Course Progress</span>
                    <span>10%</span>
                </p>
                <Progress value={10} className='mt-2' />
            </div>
            <Button asChild size="lg">
                <Link href={startLearningHref}>Start Learning</Link>
            </Button>
            <div className='mt-12 flex justify-start'>
                <Logo />
            </div>
        </article>
    );
}

function SubTopicArticle({ topic, point }: { topic: any, point: string }) {
     return (
        <article className="prose prose-lg max-w-none p-6 md:p-8 lg:p-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">{topic.title}</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                {point}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Detailed content for "{point}" will be displayed here. This section will include explanations,
                visual examples, real use-cases, and how AgileSuit helps with this concept. For now, this is placeholder content.
            </p>
            
            <div className='my-8 p-6 bg-primary/5 border-l-4 border-primary'>
                <p className='text-lg m-0'>This is an example of how a "How AgileSuit Helps" section could look, highlighting specific features or benefits.</p>
            </div>

            <p>
                Continue reading the detailed explanation of this sub-topic. We can add images, code snippets, and more to make this a rich learning experience.
            </p>
            
            <Card className="mt-8 bg-card border-border">
                <CardHeader>
                    <CardTitle>Key Takeaways</CardTitle>
                    <CardDescription>Main points to remember from this section on {point}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 my-0">
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>This is the first key takeaway. It summarizes a crucial point about this topic.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>This is another important concept to understand from the article.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span>And here is a final summary point for this sub-topic. Remember this!</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </article>
    );
}


export default function ResourcePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const levelSlug = params.slug as string;
    const subTopicSlug = searchParams.get('subtopic');
    
    const result = findContent(levelSlug, subTopicSlug);

    if (!result) {
        notFound();
    }
    const { level, topic, point } = result;
    
    if (topic && point) {
        const slug = toSlug(point);
        if (slug === 'what-is-agile-methodology') return <WhatIsAgileMethodologyArticle />;
        if (slug === 'why-agile-was-created') return <WhyAgileWasCreatedArticle />;
        if (slug === 'traditional-waterfall-vs-agile') return <WaterfallVsAgileArticle />;
        if (slug === 'problems-agile-solves-in-modern-development') return <ProblemsAgileSolvesArticle />;
        if (slug === 'agile-mindset-philosophy') return <AgileMindsetArticle />;
        if (slug === '4-core-values-of-agile') return <FourCoreValuesArticle />;
        if (slug === '12-agile-principles-explained-with-real-examples') return <TwelvePrinciplesArticle />;
        if (slug === 'scrum') return <ScrumIntroArticle />;
        if (slug === 'kanban') return <KanbanIntroArticle />;
        
        return <SubTopicArticle topic={topic} point={point} />;
    }

    if (level) {
      return <LevelIntro level={level} />;
    }

    return notFound();
}

function AgileFlowDiagram() {
    const segments = [
      {
        step: 1,
        title: "Requirements & Concepts",
        icon: Search,
        color: "fill-orange-500",
        textColor: "text-white",
      },
      {
        step: 2,
        title: "Planning of Sprints",
        icon: Milestone,
        color: "fill-orange-500",
        textColor: "text-white",
      },
      {
        step: 3,
        title: "Collaborative Design & Development",
        icon: Users,
        color: "fill-blue-800",
        textColor: "text-white",
      },
      {
        step: 4,
        title: "Create & Implement",
        icon: Zap,
        color: "fill-blue-800",
        textColor: "text-white",
      },
      {
        step: 5,
        title: "Review & Monitor",
        icon: BarChart,
        color: "fill-gray-800",
        textColor: "text-white",
      },
    ];

    const getPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
        const start = {
            x: radius * Math.cos(startAngle),
            y: radius * Math.sin(startAngle)
        };
        const end = {
            x: radius * Math.cos(endAngle),
            y: radius * Math.sin(endAngle)
        };
        const innerStart = {
            x: innerRadius * Math.cos(endAngle),
            y: innerRadius * Math.sin(endAngle)
        };
        const innerEnd = {
            x: innerRadius * Math.cos(startAngle),
            y: innerRadius * Math.sin(startAngle)
        };
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
        
        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
            "L", innerStart.x, innerStart.y,
            "A", innerRadius, innerRadius, 0, largeArcFlag, 0, innerEnd.x, innerEnd.y,
            "Z"
        ].join(" ");
    };
    
    const totalSteps = segments.length;
    const anglePerSegment = (2 * Math.PI) / totalSteps;
    const gap = 0.05; // Gap between segments
    
    return (
        <div className="not-prose my-16 flex flex-col items-center justify-center bg-blue-50 py-12 rounded-2xl relative overflow-hidden">
            <div className="relative w-[500px] h-[500px]">
                <svg viewBox="-250 -250 500 500" className="w-full h-full overflow-visible">
                    {segments.map((segment, index) => {
                        const startAngle = index * anglePerSegment - (Math.PI / 2);
                        const endAngle = (index + 1) * anglePerSegment - (Math.PI / 2) - gap;
                        const midAngle = (startAngle + endAngle) / 2;
                        const radius = 220;
                        const innerRadius = 130;
                        const iconRadius = 175;

                        const iconX = iconRadius * Math.cos(midAngle);
                        const iconY = iconRadius * Math.sin(midAngle);

                        return (
                            <g key={segment.step}>
                                <path d={getPath(startAngle, endAngle, radius, innerRadius)} className={segment.color} />
                                <foreignObject x={iconX - 25} y={iconY - 70} width="50" height="100" className="overflow-visible">
                                    <div className={`flex flex-col items-center text-center ${segment.textColor}`}>
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-gray-800 font-bold text-xl shadow-md">{segment.step}</div>
                                        <segment.icon className="mt-2 h-8 w-8" />
                                        <p className="mt-1 text-xs font-semibold w-24">{segment.title}</p>
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                    <circle cx="0" cy="0" r="120" fill="white" />
                     <foreignObject x="-100" y="-50" width="200" height="100">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-gray-800">Agile Methodology</h3>
                            <p className="text-sm text-gray-600 mt-2">User stories drive everything.</p>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </div>
    );
  }

function AgileTeamStructureDiagram() {
    return (
      <div className="not-prose my-12 p-6 bg-card border rounded-2xl shadow-sm flex flex-col items-center gap-4 text-center">
        <h3 className="text-xl font-semibold text-foreground">Agile Team Structure</h3>
        <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Product Owner</div>
        <div className="h-8 w-px bg-border" />
        <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Scrum Master</div>
        <div className="h-8 w-px bg-border" />
        <div className="font-mono text-sm px-4 py-2 bg-primary/10 text-primary-dark rounded-md w-64 shadow-inner">Development Team</div>
        <div className="h-8 w-px bg-border" />
        <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Testers | Designers | Developers</div>
      </div>
    );
}

function AgileSuitCycleDiagram() {
    return (
        <div className="not-prose my-12 p-6 bg-card border rounded-2xl shadow-sm flex flex-col items-center gap-4 text-center">
            <h3 className="text-xl font-semibold text-foreground">Agile Cycle with AgileSuit</h3>
            <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Idea</div>
            <div className="h-8 w-px bg-border" />
            <div className="font-mono text-sm px-4 py-2 bg-primary/10 text-primary-dark rounded-md w-64 shadow-inner flex items-center justify-center gap-2">
                <Logo className='h-5 text-primary' /> Plan in AgileSuit
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Execute Sprint</div>
            <div className="h-8 w-px bg-border" />
            <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Track Progress</div>
            <div className="h-8 w-px bg-border" />
            <div className="font-mono text-sm px-4 py-2 bg-primary/10 text-primary-dark rounded-md w-64 shadow-inner">Review Analytics</div>
            <div className="h-8 w-px bg-border" />
            <div className="font-mono text-sm px-4 py-2 bg-muted rounded-md w-64 shadow-inner">Optimize Next Sprint</div>
      </div>
    );
}

const comparisonData = [
    {
      block: 'Term',
      waterfall: 'Sequential development process in pre-defined phases',
      agile: 'Iterative development in short sprints',
    },
    {
      block: 'Adaptability',
      waterfall: 'Fixed requirements and structure',
      agile: 'Flexible and adaptable',
    },
    {
      block: 'Teams',
      waterfall: 'Homogeneous teams with strong hierarchy',
      agile: 'Network of empowered teams',
    },
    {
      block: 'Mindset',
      waterfall: 'Project-focused with the aim of reaching the delivery phase',
      agile: 'Focused around collaboration and communication',
    },
    {
      block: 'Process',
      waterfall: 'Sequential approach',
      agile: 'Incremental approach',
    },
    {
      block: 'Documentation',
      waterfall: 'Comprehensive',
      agile: 'Light',
    },
    {
      block: 'Value delivery',
      waterfall: 'Slow - only at major milestones',
      agile: 'Rapid (weekly / bi-weekly)',
    },
    {
      block: 'Quality',
      waterfall: 'Low - issues are not identified until the testing phase',
      agile: 'Improved - issues identified after each sprint',
    },
    {
      block: 'Risk',
      waterfall: 'Increases as project progresses',
      agile: 'Decreases as project progresses',
    },
    {
      block: 'Customer feedback',
      waterfall: 'Limited and delayed until project completion',
      agile: 'Frequent - after each sprint',
    },
    {
      block: 'Best for',
      waterfall: 'Straightforward projects in predictable circumstances',
      agile: 'Short projects in high-risk situations',
    },
];

function AgileVsWaterfallTable() {
    return (
        <div className="not-prose my-12 overflow-hidden rounded-lg border border-border shadow-md">
            <div className="grid grid-cols-3">
                <div className="col-span-1 bg-primary/80 p-4 font-bold text-primary-foreground">Building Blocks</div>
                <div className="col-span-1 p-4 font-bold text-foreground">Waterfall</div>
                <div className="col-span-1 p-4 font-bold text-foreground">Agile</div>
            </div>
            <div className="grid grid-cols-3">
                {comparisonData.map((row, index) => (
                    <React.Fragment key={index}>
                        <div className="col-span-1 bg-primary/80 p-4 text-sm font-medium text-primary-foreground border-t border-primary/50">{row.block}</div>
                        <div className="col-span-1 p-4 text-sm text-foreground border-t border-border">{row.waterfall}</div>
                        <div className="col-span-1 p-4 text-sm text-foreground border-t border-border">{row.agile}</div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

// Component for the "What is Agile Methodology?" article
function WhatIsAgileMethodologyArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">What is Agile Methodology?</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">A Complete, In-Depth Guide for Modern Product Teams</p>

            <hr className="my-8" />

            <h2 className="font-bold">Introduction: Understanding Agile in the Modern World</h2>
            <p>Agile is a modern approach to project management that helps teams deliver value faster and more efficiently. Unlike traditional methods that require rigid, long-term planning, Agile focuses on <strong>flexibility, customer collaboration, and delivering work in small, incremental steps</strong>.</p>
            <p>This iterative process allows teams to adapt to change, improve continuously, and respond to customer feedback in real-time. Platforms like <a href="#">AgileSuit</a> are designed to support this entire lifecycle, making Agile principles actionable and measurable.</p>
            
            <hr className="my-8" />

            <h2 className="font-bold">What is Agile? The Core Idea</h2>
            <blockquote>
                <em>Agile Methodology</em> is an <strong>iterative approach</strong> to project management and software development that helps teams deliver value to their customers <strong>faster and with fewer headaches</strong>.
            </blockquote>
            <p>Instead of a single "big bang" launch, Agile breaks projects into short cycles called <strong>sprints</strong>. Each sprint delivers a working piece of the product, which allows for regular reviews and quick adjustments based on feedback.</p>
            <p>The philosophy is guided by the <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Agile Manifesto</a>, which prioritizes:</p>
            <ul>
                <li><em>Individuals and interactions</em> over processes and tools</li>
                <li><em>Working software</em> over comprehensive documentation</li>
                <li><em>Customer collaboration</em> over contract negotiation</li>
                <li><em>Responding to change</em> over following a plan</li>
            </ul>

            <AgileFlowDiagram />
            
            <hr className="my-8" />

            <h2 className="font-bold">Agile vs. Traditional Waterfall</h2>
            <p>The core difference between Agile and traditional models like <strong>Waterfall</strong> is flexibility. Waterfall is a linear, sequential process where each phase must be completed before the next begins. Agile, on the other hand, is an iterative loop of planning, building, and learning.</p>
            
            <AgileVsWaterfallTable />
            
            <hr className="my-8" />

            <h2 className="font-bold">Common Agile Frameworks & Key Roles</h2>
            <p>Agile is an umbrella term for several frameworks. The most popular are:</p>
            <ul>
                <li><strong>Scrum:</strong> A framework based on sprints, specific roles, and regular meetings (events) to get work done.</li>
                <li><strong>Kanban:</strong> Focuses on visualizing workflow, limiting work-in-progress, and maximizing efficiency.</li>
                <li><strong>SAFe (Scaled Agile Framework):</strong> Designed for large organizations to apply Agile principles at an enterprise scale.</li>
            </ul>

            <p>In a typical Agile (Scrum) team, there are three key roles:</p>
            <AgileTeamStructureDiagram />

            <hr className="my-8" />

            <h2 className="font-bold">How AgileSuit Powers the Agile Cycle</h2>
            <p>AgileSuit is designed to simplify and enhance every stage of the Agile lifecycle. It provides the tools needed to turn Agile theory into measurable, day-to-day execution.</p>
            
            <AgileSuitCycleDiagram />

            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">AgileSuit streamlines your workflow with:</p>
                <ul className="my-2 space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary"/>Sprint planning and task tracking boards.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary"/>Real-time analytics and burndown charts.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary"/>Tools for running effective retrospectives.</li>
                </ul>
            </div>

            <hr className="my-8" />

            <h2 className="font-bold">Conclusion: The Agile Advantage</h2>
            <p>Agile is more than a methodology—it's a mindset that empowers teams to thrive in an environment of change. By prioritizing flexibility, collaboration, and continuous improvement, organizations can reduce risk, increase customer satisfaction, and deliver better products faster.</p>
            <blockquote className="border-l-4 border-primary bg-muted/50 p-6 text-2xl text-center italic">
                Agile is the heartbeat of modern innovation.
            </blockquote>
        </article>
    );
}

function WaterfallVsAgileDiagram() {
    return (
      <div className="not-prose my-12 p-8 bg-card border rounded-2xl shadow-sm text-center">
        <h3 className="text-2xl font-bold text-foreground mb-8">The Shift from Rigid to Flexible</h3>
        <div className="relative">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Waterfall Column */}
              <div>
                <h4 className="text-xl font-semibold text-red-600 mb-4">The Old Way: Waterfall</h4>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full bg-red-100 border border-red-200 text-red-800 rounded-lg p-3 shadow">Requirements</div>
                  <div className="h-8 w-1 bg-red-200"></div>
                  <div className="w-full bg-red-100 border border-red-200 text-red-800 rounded-lg p-3 shadow">Design</div>
                  <div className="h-8 w-1 bg-red-200"></div>
                  <div className="w-full bg-red-100 border border-red-200 text-red-800 rounded-lg p-3 shadow">Build</div>
                  <div className="h-8 w-1 bg-red-200"></div>
                  <div className="w-full bg-red-100 border border-red-200 text-red-800 rounded-lg p-3 shadow">Test</div>
                  <div className="h-8 w-1 bg-red-200"></div>
                  <div className="w-full bg-red-100 border border-red-200 text-red-800 rounded-lg p-3 shadow">Deploy</div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">A rigid, one-way process. Changes are costly and feedback comes too late.</p>
              </div>
      
              {/* Agile Column */}
              <div>
                <h4 className="text-xl font-semibold text-green-600 mb-4">The New Way: Agile</h4>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 shadow flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5" /> Sprint 1
                  </div>
                  <div className="h-8 w-1 bg-green-200"></div>
                  <div className="w-full bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 shadow flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5" /> Sprint 2
                  </div>
                  <div className="h-8 w-1 bg-green-200"></div>
                  <div className="w-full bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 shadow flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5" /> Sprint 3
                  </div>
                  <div className="h-8 w-1 bg-green-200"></div>
                  <div className="w-full bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 shadow">...etc</div>
                </div>
                 <p className="text-muted-foreground mt-4 text-sm">An iterative, cyclical process. Feedback is continuous and value is delivered early.</p>
              </div>
            </div>
            {/* Icons */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="text-5xl text-red-400 -translate-x-4">❌</div>
                <div className="text-5xl text-green-400 translate-x-4">✅</div>
            </div>
        </div>
      </div>
    );
  }
  

// Component for "Why Agile Was Created"
function WhyAgileWasCreatedArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 p-6 md:p-8 lg:p-12">
            <h1 className='font-bold'>Why Agile Was Created</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Problems That Sparked a Revolution in Software Development</p>

            <hr className="my-8" />

            <h2 className="font-bold">The Age of Failing Projects</h2>
            <p>To understand why <em>Agile</em> was created, we have to travel back to the 1990s. The software industry was booming, but it was also in a crisis. Projects were consistently running over budget, missing deadlines, and, worst of all, failing to meet the actual needs of customers. The traditional project management model, known as <strong>Waterfall</strong>, was a big part of the problem.</p>
            <p>The Waterfall model is a rigid, sequential process. Every step—requirements gathering, design, development, testing—had to be fully completed before the next could begin. This worked well for predictable manufacturing lines, but it was a disaster for the creative and ever-changing world of software development.</p>

            <hr className="my-8" />

            <h2 className="font-bold">The Core Flaws of the Waterfall Model</h2>
            <p>The Waterfall approach created several critical issues that made software projects incredibly risky:</p>
            <ul>
                <li><strong>Late Feedback:</strong> Customers and users often didn't see the product until it was nearly finished. By then, it was often too late or too expensive to make significant changes. Imagine spending a year building a car, only to find out the customer wanted a boat.</li>
                <li><strong>Resistance to Change:</strong> The model assumes all requirements can be known upfront. In reality, markets shift, and customer needs evolve. Waterfall treated change as an error to be controlled, not a reality to be embraced. This rigidity meant teams were often building products for a world that no longer existed by the time they launched.</li>
                <li><strong>Siloed Teams and Communication Gaps:</strong> In Waterfall, teams worked in isolated phases. Designers would "throw work over the wall" to developers, who would then throw it to testers. This led to misunderstandings, rework, and a lack of shared ownership.</li>
                <li><strong>High Risk of Failure:</strong> With a single "big bang" delivery at the end, all the project's risk was pushed to the final phase. If the product was wrong, the entire investment of time and money was wasted. There was no opportunity to pivot or correct course along the way.</li>
            </ul>

            <WaterfallVsAgileDiagram />
            
            <hr className="my-8" />

            <h2 className="font-bold">The Manifesto for a Better Way</h2>
            <p>In 2001, a group of 17 software developers met at a ski resort in Utah. They were frustrated with the status quo and recognized that the industry needed a new philosophy—one that embraced change, prioritized customer value, and enabled rapid delivery. The result of their meeting was the <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Manifesto for Agile Software Development</a>.</p>
            <p>Agile wasn't created as a single, rigid framework. It was a call for a <strong>mindset shift</strong>. It proposed a new way of thinking that valued:</p>
            <ul>
                <li><em>Flexibility</em> over rigid planning.</li>
                <li><em>Collaboration</em> over siloed teams.</li>
                <li><em>Working Software</em> over exhaustive documentation.</li>
                <li><em>Continuous Improvement</em> over a static, one-time delivery.</li>
            </ul>

            <hr className="my-8" />
            
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">How Agile Solved the Crisis</p>
                <p>By breaking work into small, iterative cycles (sprints), Agile introduced a continuous feedback loop. This allowed teams to adapt to change, reduce risk, and ensure the final product was something customers actually wanted. Tools like <strong>AgileSuit</strong> are the modern evolution of this thinking, providing the structure to make these iterative cycles efficient and transparent.</p>
            </div>

            <h2 className="font-bold">Conclusion: A Necessary Evolution</h2>
            <p>Ultimately, Agile was created because the old way of building software was broken. It wasn't just inefficient; it was actively hostile to the nature of creative work and changing markets. Agile offered a solution to deliver better products faster, with less risk and higher customer satisfaction. It was, and remains, a necessary evolution for an industry defined by constant change.</p>
        </article>
    );
}

// Component for "Traditional Waterfall vs. Agile"
function WaterfallVsAgileArticle() {
  return (
    <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 p-6 md:p-8 lg:p-12">
      <h1 className="font-bold">Traditional Waterfall vs. Agile</h1>
      <p className="lead !text-xl !font-normal text-muted-foreground">Understanding the Two Core Development Philosophies</p>
      
      <hr className="my-8" />
      
      <p>In the world of project management, <strong>Waterfall and Agile</strong> represent two fundamentally different approaches to delivering work. Understanding their core philosophies, structures, and outcomes is key to choosing the right method for your team and project.</p>
      
      <h2 className="font-bold">The Waterfall Model: A Linear, Sequential Path</h2>
      <p>The <strong>Waterfall model</strong> is the most traditional approach to software development. As the name suggests, it's a linear, sequential process where progress flows steadily downwards (like a waterfall) through a series of distinct phases. The typical phases are:</p>
      <ol>
          <li><strong>Requirements:</strong> All project requirements are gathered and documented upfront.</li>
          <li><strong>Design:</strong> The system architecture and software design are created based on the requirements.</li>
          <li><strong>Implementation (Coding):</strong> Developers write the code for the entire system.</li>
          <li><strong>Testing:</strong> The quality assurance team tests the complete product to find and report bugs.</li>
          <li><strong>Deployment:</strong> The finished product is released to the customer.</li>
          <li><strong>Maintenance:</strong> The team provides ongoing support and maintenance.</li>
      </ol>
      <p>This method is highly structured and requires comprehensive documentation and planning before any development begins. Once a phase is complete, going back to make changes is exceptionally difficult and costly, as it requires a formal change control process and can disrupt the entire project timeline. Waterfall works best for projects where requirements are completely understood, fixed, and unlikely to change—such as in manufacturing or construction.</p>
      
      <hr className="my-8" />
      
      <h2 className="font-bold">The Agile Model: An Iterative, Cyclical Loop</h2>
      <p><strong>Agile</strong>, on the other hand, is an iterative and incremental approach. Instead of one long, linear path, Agile breaks the project into small, manageable cycles called <strong>sprints</strong> (typically lasting 2-4 weeks). At the end of each sprint, the team delivers a small, functional, and potentially shippable piece of the product.</p>
      <p>This cyclical process—<em>plan, build, test, release, get feedback</em>—allows for continuous improvement, adaptation, and collaboration throughout the project lifecycle. It embraces the idea that not everything can be known upfront and that change is a natural part of development.</p>
      
      <WaterfallVsAgileDiagram />

      <hr className="my-8" />

      <h2 className="font-bold">Key Differences: A Head-to-Head Comparison</h2>
      <p>Let's break down the core differences in a simple table to highlight the contrasting philosophies:</p>
      
      <AgileVsWaterfallTable />

      <hr className="my-8" />
      
      <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
          <p className="font-semibold m-0 text-lg">Which One Should You Use?</p>
          <p>For most modern software and product development projects, where market conditions are dynamic and requirements are expected to evolve, <strong>Agile is the overwhelmingly preferred method</strong>. It reduces risk by delivering value early, improves customer satisfaction through continuous feedback, and allows teams to build the right product. Tools like <strong>AgileSuit</strong> are built from the ground up to support the Agile workflow, providing the visibility and structure needed for sprint planning, progress tracking, and performance analysis.</p>
      </div>

      <h2 className="font-bold">Conclusion</h2>
      <p>While Waterfall has its place for highly predictable, unchanging projects, its rigidity makes it ill-suited for the fast-paced world of modern development. Agile's flexibility, focus on collaboration, and continuous feedback loop make it the superior choice for teams that need to respond to change, innovate quickly, and consistently deliver products that delight customers.</p>
    </article>
  );
}

// Component for "Problems Agile Solves"
function ProblemsAgileSolvesArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">Problems Agile Solves in Modern Development</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">Why Teams Are Moving Away from Traditional Methods</p>

            <hr className="my-8" />

            <p>Agile wasn't just a new idea; it was a direct response to the persistent and costly problems that plagued traditional, linear development models like Waterfall. These issues regularly led to project failure, budget overruns, and products that no one wanted. Here are the key problems that Agile directly solves.</p>

            <h2 className="font-bold">1. The Problem: The Myth of Fixed Requirements</h2>
            <p><strong>Traditional Failure:</strong> Waterfall projects are built on the assumption that all requirements can be perfectly defined and frozen at the start. In the real world, this is nearly impossible. Market needs change, new competitors emerge, user feedback reveals better ideas, and business priorities shift. In a rigid model, any change is a crisis that triggers complex change request forms, budget renegotiations, and massive delays.</p>
            <p><strong>Agile Solution:</strong> Agile <em>embraces</em> change as a source of value. By working in short sprints, teams have a built-in mechanism to incorporate new feedback and adjust priorities at the start of every cycle. The backlog is a living document, not a stone tablet. This ensures the team is always working on the most valuable features and that the final product is what the customer actually wants *now*, not what was planned months or years ago.</p>

            <hr className="my-8" />

            <h2 className="font-bold">2. The Problem: Late Feedback & "Big Bang" Risk</h2>
            <p><strong>Traditional Failure:</strong> With Waterfall, the customer often doesn't see a working product until the very end of a long cycle. This is the "Big Bang" delivery. If the team misunderstood a key requirement or built the wrong solution, the entire project's budget and time can be wasted. All the project's risk is concentrated at this single, final delivery point.</p>
            <p><strong>Agile Solution:</strong> Agile delivers a small, working, and potentially shippable piece of the product every few weeks. This creates a continuous feedback loop. Customers and stakeholders can see tangible progress, provide input early and often, and guide the development process. Risk is spread out across many small iterations and is minimized with each successful sprint. You find out if you're on the wrong track after two weeks, not two years.</p>

            <hr className="my-8" />

            <h2 className="font-bold">3. The Problem: Lack of Transparency and Silos</h2>
            <p><strong>Traditional Failure:</strong> Stakeholders, and often even team members in different departments, have little visibility into the true progress of a project. Status is often reported by phase completion ("Design is 100% done"), which says nothing about the actual value delivered or the problems lurking beneath the surface. This creates friction, blame, and surprises.</p>
            <p><strong>Agile Solution:</strong> Agile provides radical transparency. Tools like <strong>AgileSuit</strong> offer real-time dashboards, burndown charts, and Kanban boards that are visible to everyone. Daily stand-up meetings ensure the entire team is aligned on progress and impediments. This transparency builds trust, fosters collective ownership, and allows problems to be surfaced and solved quickly.</p>

            <hr className="my-8" />

             <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">AgileSuit: Your Solution for Agile Problems</p>
                <p><strong>AgileSuit</strong> is specifically designed to solve these exact problems. It provides a central hub for dynamic backlog management, sprint planning, task visualization, and real-time metric tracking, ensuring your team stays aligned, adaptable, and productive.</p>
            </div>

            <h2 className="font-bold">Conclusion</h2>
            <p>Agile is not just a different process; it's a better-suited operating system for the uncertainty and complexity of modern development. It directly tackles the core issues of changing requirements, high risk, and poor visibility, leading to more successful projects, higher quality products, and happier, more engaged teams.</p>
        </article>
    );
}

// Component for "Agile Mindset & Philosophy"
function AgileMindsetArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">The Agile Mindset & Philosophy</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">It's Not Just What You Do, It's How You Think</p>

            <hr className="my-8" />

            <p>Many organizations try to "do Agile" by adopting its ceremonies—like daily stand-ups and sprints—without understanding the philosophy behind them. This often fails. Agile is more than a set of practices; it's a <strong>mindset</strong>. It's a fundamental shift in how teams approach work, collaboration, and value delivery. Adopting the processes without embracing the philosophy is like having a car without an engine. You have the frame, but you won't get very far.</p>
            <p>The Agile mindset is built on a foundation of trust, respect, customer-centricity, and a relentless desire to improve. It's about changing how you think about problems, challenges, and success itself.</p>
            
            <h2 className="font-bold">Core Pillars of the Agile Mindset</h2>

            <h3>1. Embrace and Welcome Change</h3>
            <p>The traditional mindset sees change as a problem to be avoided, a deviation from the plan that causes scope creep and budget overruns. The Agile mindset, however, sees change as an opportunity to create more value. Agile teams expect requirements to evolve and have a system designed to adapt to them. They understand that responding to change is more important than rigidly following a plan that may no longer be relevant. The goal is not to perfectly execute a static plan, but to continuously steer toward the best possible outcome for the customer, even if that means changing course based on new information.</p>

            <h3>2. Focus on Delivering Value Early and Often</h3>
            <p>The primary measure of success in Agile is <em>working software that delivers value</em> to the end user. Instead of waiting months or years for a single "big bang" release, Agile teams focus on delivering small, incremental pieces of a functional product in short cycles. This approach gets value into the hands of the customer sooner, which can generate revenue, provide crucial market learning, and create a competitive advantage. It also generates a continuous stream of feedback that guides future development, ensuring the team doesn't waste months building something that misses the mark.</p>

            <h3>3. Collaborate Relentlessly with Customers and Colleagues</h3>
            <p>Agile breaks down the silos common in traditional organizations. Instead of separate departments handing off work to each other in a sequence, Agile teams are cross-functional and collaborate daily. Business stakeholders, product managers, developers, and designers work together throughout the project. Most importantly, the customer is seen as a key collaborator, not a distant entity to be managed through contracts. This constant, rich communication ensures everyone is aligned, misunderstandings are caught and resolved instantly, and the team is collectively focused on building the right thing.</p>
            
            <h3>4. Trust and Empower the Team to Self-Organize</h3>
            <p>The Agile philosophy trusts that the best solutions, architectures, and designs emerge from motivated, self-organizing teams. Instead of a top-down, command-and-control structure where managers assign tasks and dictate solutions, leaders empower teams to make decisions about how to best accomplish their work. This fosters a powerful sense of ownership, creativity, and accountability. When a team is trusted to figure out the "how," they bring a higher level of commitment, ingenuity, and passion to the project's success.</p>
            
            <h3>5. Reflect and Adapt Continuously (Kaizen)</h3>
            <p>Agile teams are never satisfied with the status quo. They are learning teams. At regular intervals (e.g., at the end of each sprint during the Retrospective), the team pauses to reflect on what went well, what could be improved, and creates a concrete plan to adapt their process. This commitment to continuous improvement, often referred to by the Japanese term <em>Kaizen</em>, is a cornerstone of the Agile mindset. It ensures the team's process evolves and becomes more effective, efficient, and enjoyable over time.</p>
            
             <hr className="my-8" />
             
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Cultivating the Mindset with AgileSuit</p>
                <p><strong>AgileSuit</strong> is designed to reinforce the Agile mindset by providing tools that foster transparency, facilitate collaboration, and make continuous improvement a natural part of the workflow. From retrospective boards that capture action items to real-time progress charts that empower teams with data, it helps turn philosophy into daily practice.</p>
            </div>
            
            <h2 className="font-bold">Conclusion</h2>
            <p>Adopting Agile is a cultural transformation, not just a process change. It's about shifting from rigid processes to flexible frameworks, from individual assignments to collective ownership, and from following a plan to delivering customer value. While ceremonies and tools are useful, it is the mastery of this underlying mindset that is the true key to unlocking the full, transformative potential of Agile.</p>
        </article>
    );
}

function FourCoreValuesDiagram() {
    const values = [
        { icon: UsersRound, title: "Individuals and Interactions", description: "over processes and tools" },
        { icon: Code, title: "Working Software", description: "over comprehensive documentation" },
        { icon: Handshake, title: "Customer Collaboration", description: "over contract negotiation" },
        { icon: RefreshCw, title: "Responding to Change", description: "over following a plan" },
    ];
    return (
        <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow bg-card">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-4 rounded-full mb-4">
                            <value.icon className="h-10 w-10" />
                        </div>
                        <p className="text-xl font-bold text-foreground">{value.title}</p>
                        <p className="text-lg text-muted-foreground mt-1">{value.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function FourCoreValuesArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">The 4 Core Values of the Agile Manifesto</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Simple Statements That Revolutionized Software Development</p>
            
            <hr className="my-8" />
            
            <p>The <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Manifesto for Agile Software Development</a> is not a rulebook or a detailed process. It's a declaration of priorities. It consists of four core values that contrast the Agile approach with the traditional, heavyweight methodologies that were common at the time. Each value highlights a preference, stating that while there is value in the items on the right, Agile practitioners value the items on the left <em>more</em>.</p>
            
            <FourCoreValuesDiagram />
            
            <h2 className="font-bold">1. Individuals and Interactions Over Processes and Tools</h2>
            <p>This value emphasizes that, ultimately, people are the most important factor in development success. While processes and tools are helpful and often necessary, the best solutions come from people collaborating effectively. A brilliant team with basic tools will always outperform a dysfunctional team with the most advanced, expensive tools. Agile prioritizes creating an environment where communication, trust, and direct conversation can thrive, believing that this is the fastest way to solve problems and innovate.</p>
            
            <h2 className="font-bold">2. Working Software Over Comprehensive Documentation</h2>
            <p>The primary goal of software development is to deliver software that works and provides tangible value to the customer. Traditional methods often produced mountains of documentation (detailed specifications, design documents, manuals) that were expensive to create, difficult to maintain, and quickly became outdated. Agile doesn't eliminate documentation, but it prioritizes delivering functional increments of the product over creating documentation for its own sake. Documentation should be lean, purposeful, and only created when it truly adds value.</p>
            
            <h2 className="font-bold">3. Customer Collaboration Over Contract Negotiation</h2>
            <p>Traditionally, the relationship with a customer was often adversarial, defined by a rigid contract negotiated at the beginning of a project. This contract would attempt to specify every detail, and any deviation would lead to difficult negotiations. Agile flips this model. It views the customer as a partner in the development process. Instead of relying on an initial contract, Agile teams work in close, continuous collaboration with their customers throughout the project. This ongoing feedback loop is crucial for ensuring that the final product truly meets the customer's evolving needs and expectations.</p>
            
            <h2 className="font-bold">4. Responding to Change Over Following a Plan</h2>
            <p>The business world is dynamic and unpredictable. Market conditions change, user needs evolve, and new opportunities emerge. Traditional models treat change as a deviation from the plan that must be controlled and resisted. Agile, however, anticipates and welcomes change. It recognizes that the ability to pivot and respond to new information is a powerful competitive advantage. An Agile plan is not a rigid script to be followed blindly; it is a flexible guide that helps the team navigate toward the most valuable outcome, even if that outcome is different from what was originally envisioned.</p>

            <hr className="my-8" />
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Living the Values with AgileSuit</p>
                <p><strong>AgileSuit</strong> is built around these four values. It provides tools that promote real-time communication (<em>individuals and interactions</em>), track the delivery of functional user stories (<em>working software</em>), facilitate feedback loops (<em>customer collaboration</em>), and allow for easy backlog re-prioritization (<em>responding to change</em>).</p>
            </div>
        </article>
    );
}

function TwelvePrinciplesArticle() {
    const principles = [
      { title: "Customer Satisfaction", description: "Our highest priority is to satisfy the customer through early and continuous delivery of valuable software." },
      { title: "Welcome Change", description: "Welcome changing requirements, even late in development. Agile processes harness change for the customer's competitive advantage." },
      { title: "Deliver Frequently", description: "Deliver working software frequently, from a couple of weeks to a couple of months, with a preference to the shorter timescale." },
      { title: "Work Together", description: "Business people and developers must work together daily throughout the project." },
      { title: "Motivated Individuals", description: "Build projects around motivated individuals. Give them the environment and support they need, and trust them to get the job done." },
      { title: "Face-to-Face Conversation", description: "The most efficient and effective method of conveying information to and within a development team is face-to-face conversation." },
      { title: "Working Software", description: "Working software is the primary measure of progress." },
      { title: "Sustainable Pace", description: "Agile processes promote sustainable development. The sponsors, developers, and users should be able to maintain a constant pace indefinitely." },
      { title: "Technical Excellence", description: "Continuous attention to technical excellence and good design enhances agility." },
      { title: "Simplicity", description: "Simplicity--the art of maximizing the amount of work not done--is essential." },
      { title: "Self-Organizing Teams", description: "The best architectures, requirements, and designs emerge from self-organizing teams." },
      { title: "Reflect and Adjust", description: "At regular intervals, the team reflects on how to become more effective, then tunes and adjusts its behavior accordingly." },
    ];
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">The 12 Principles of Agile Software</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Guiding Rules Behind the Agile Manifesto</p>
            <hr className="my-8" />
            <p>While the four core values provide the philosophical foundation of Agile, the 12 supporting principles offer more specific, actionable guidance. They are the "how-to" behind the Agile mindset, translating the values into concrete practices and behaviors for high-performing teams.</p>
            <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principles.map((p, i) => (
                    <Card key={i} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                <span className="text-primary mr-2 font-black">{i+1}.</span>
                                {p.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground my-0">{p.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <hr className="my-8" />
            <h2 className="font-bold">Putting the Principles into Practice</h2>
            <p>These 12 principles are not a checklist to be mechanically followed. They are a guide for decision-making. When a team faces a challenge, they can turn to these principles to find the "Agile" way forward. For example:</p>
            <ul>
                <li>If a new, important feature request comes in mid-project, a team remembers to <strong>"Welcome Change"</strong> (Principle 2) rather than resisting it.</li>
                <li>If a team is consistently working overtime to meet deadlines, they are violating the principle of <strong>"Sustainable Pace"</strong> (Principle 8) and must address their process.</li>
                <li>If progress is being measured by lines of code written or documents completed, the team should refocus on <strong>"Working Software"</strong> as the primary measure of progress (Principle 7).</li>
            </ul>
             <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Principles Embodied in AgileSuit</p>
                <p>AgileSuit is designed to help teams live these principles. The platform's structure encourages frequent delivery, daily collaboration, and continuous reflection, turning abstract ideas into a concrete, effective workflow.</p>
            </div>
        </article>
    );
}

function ScrumIntroArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">Introduction to Scrum</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Most Popular Agile Framework for Complex Projects</p>

            <hr className="my-8" />

            <p>While Agile is the overarching philosophy, <strong>Scrum</strong> is the most widely used framework for putting Agile into practice. It is a lightweight yet powerful framework designed to help small, cross-functional teams build complex products in an iterative and incremental way. It is not a rigid methodology with detailed instructions, but rather a simple framework that provides a structure of roles, events, and artifacts. Within this structure, teams can develop their own specific processes that work for them.</p>
            <p>The name "Scrum" is taken from the sport of rugby, where a team works together in a tight, coordinated unit to move the ball down the field. Similarly, a Scrum team works together to deliver value in focused, time-boxed bursts called <strong>sprints</strong>.</p>
            
            <h2 className="font-bold">The 3 Pillars of Scrum: Empirical Process Control</h2>
            <p>Scrum is founded on the theory of empiricism, which asserts that knowledge comes from experience and making decisions based on what is known. This is supported by three essential pillars:</p>
            <ul>
                <li><strong>Transparency:</strong> All significant aspects of the work must be visible to everyone responsible for the outcome—the stakeholders, the team, and the customers. This requires shared standards and open communication, which tools like AgileSuit's shared dashboards and backlogs are critical for.</li>
                <li><strong>Inspection:</strong> The team must frequently inspect the Scrum artifacts (like the Product Backlog and the sprint progress) and their progress toward the Sprint Goal to detect any undesirable variances or problems. Inspection should not be so frequent that it gets in the way of the work.</li>
                <li><strong>Adaptation:</strong> If the inspection reveals that one or more aspects of the process are deviating outside acceptable limits and that the resulting product will be unacceptable, the team must adapt the process or the material being processed as quickly as possible to prevent further deviation.</li>
            </ul>

            <hr className="my-8" />

            <h2 className="font-bold">The Core Components of the Scrum Framework</h2>
            <p>The Scrum framework is defined by a simple set of interlocking components. Mastering them is the first step to a successful Scrum implementation.</p>
            <div className="not-prose my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md"><CardHeader><CardTitle>The 3 Roles</CardTitle></CardHeader><CardContent><p className="my-0">The <strong>Product Owner</strong> (owns the "what"), the <strong>Scrum Master</strong> (owns the process), and the <strong>Development Team</strong> (owns the "how").</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader><CardTitle>The 5 Events</CardTitle></CardHeader><CardContent><p className="my-0">The <strong>Sprint</strong> itself, <strong>Sprint Planning</strong>, the <strong>Daily Scrum</strong>, the <strong>Sprint Review</strong>, and the <strong>Sprint Retrospective</strong>.</p></CardContent></Card>
                <Card className="shadow-md"><CardHeader><CardTitle>The 3 Artifacts</CardTitle></CardHeader><CardContent><p className="my-0">The <strong>Product Backlog</strong> (all work to be done), the <strong>Sprint Backlog</strong> (work for the current sprint), and the <strong>Increment</strong> (the usable piece of product created).</p></CardContent></Card>
            </div>
            <p>Each of these components has a specific purpose and is essential to Scrum's success. We will explore each of them in detail in the upcoming sections of the Learning Hub, showing how to implement them effectively using platforms like AgileSuit.</p>
        </article>
    );
}


function KanbanVsScrumDiagram() {
    return (
        <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scrum Column */}
            <div className="bg-card border rounded-lg p-6 shadow-md">
                <h3 className="text-2xl font-bold text-center text-primary mb-4">Scrum</h3>
                <ul className="space-y-3 my-0">
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Cadence:</strong> Uses regular, fixed-length sprints (e.g., 2 weeks) to structure work.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Roles:</strong> Prescribes three specific roles: Product Owner, Scrum Master, and Development Team.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Change:</strong> Changes are generally not introduced during a sprint to protect the sprint goal.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Metrics:</strong> Velocity (how much work is completed per sprint) is a key metric for planning.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Best for:</strong> Projects that benefit from a regular rhythm, iterative feedback, and a structured approach to delivering complex products.</div></li>
                </ul>
            </div>
            {/* Kanban Column */}
            <div className="bg-card border rounded-lg p-6 shadow-md">
                <h3 className="text-2xl font-bold text-center text-accent-foreground mb-4">Kanban</h3>
                <ul className="space-y-3 my-0">
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Cadence:</strong> Based on a continuous flow of work. There are no sprints.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Roles:</strong> Does not prescribe any new roles. It is applied to the existing team structure.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Change:</strong> Changes can be made at any time as long as they don't disrupt the workflow or exceed WIP limits.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Metrics:</strong> Cycle Time and Lead Time (how long a task takes to move through the process) are key metrics.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Best for:</strong> Teams with shifting priorities and a focus on continuous delivery, such as support or maintenance teams.</div></li>
                </ul>
            </div>
        </div>
    );
}


function KanbanIntroArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground p-6 md:p-8 lg:p-12">
            <h1 className="font-bold">Introduction to Kanban</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">Visualizing Work, Limiting WIP, and Maximizing Flow</p>

            <hr className="my-8" />

            <p><strong>Kanban</strong> is a popular Agile framework that helps teams visualize their workflow, limit work in progress (WIP), and maximize efficiency to achieve a smooth, continuous flow of value. The word "Kanban" is Japanese for "visual signal" or "card," which points to the framework's core component: the <strong>Kanban board</strong>. This board provides a visual representation of your team's entire process, from idea to completion.</p>
            <p>Unlike Scrum, Kanban is not a prescriptive framework. It is a "start with what you do now" method that focuses on introducing gradual improvements to your existing process.</p>
            
            <h2 className="font-bold">The Four Core Principles of Kanban</h2>
            <p>The Kanban method is guided by four foundational principles:</p>
            <ol>
                <li><strong>Start with what you do now:</strong> Kanban does not require you to make drastic changes to your existing process overnight. You start by visualizing your current workflow, including all its steps and potential flaws. This makes it a less disruptive way to begin your Agile journey.</li>
                <li><strong>Agree to pursue incremental, evolutionary change:</strong> The Kanban philosophy is about making small, continuous improvements (Kaizen) rather than large, disruptive ones. This approach reduces resistance to change and allows the team to evolve its process organically.</li>
                <li><strong>Respect the current process, roles, and responsibilities:</strong> Unlike Scrum, Kanban does not require you to create new roles like "Scrum Master." It is designed to be implemented on top of your existing team structure, respecting the current roles and responsibilities while highlighting areas for improvement.</li>
                <li><strong>Encourage acts of leadership at all levels:</strong> Kanban empowers every team member—from developers to managers—to identify problems, suggest improvements, and take ownership of the workflow. Leadership is seen as a shared responsibility, not the job of a single person.</li>
            </ol>
            
            <h2 className="font-bold">Scrum vs. Kanban: The Key Differences</h2>
            <p>While both are popular Agile frameworks, they operate on different principles. Scrum is about a time-boxed, iterative rhythm, while Kanban is about a continuous, interrupt-driven flow. Here's a breakdown of the main distinctions:</p>
            
            <KanbanVsScrumDiagram />

             <hr className="my-8" />
             
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Flexible Boards for Any Framework in AgileSuit</p>
                <p>Whether your team uses the structured sprints of Scrum or the continuous flow of Kanban, <strong>AgileSuit</strong> has you covered. Our platform provides flexible board views that can be easily configured for either framework. This allows your organization to use the methods that best suit different teams' needs, all while keeping your work, reporting, and collaboration in one centralized platform.</p>
            </div>
        </article>
    );
}
