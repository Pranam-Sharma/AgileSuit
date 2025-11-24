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
        <article className="prose prose-lg max-w-none">
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
        <article className="prose prose-lg max-w-none">
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
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            <h1>What is Agile Methodology?</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">A Complete, In-Depth Guide for Modern Product Teams</p>

            <hr className="my-8" />

            <h2>Introduction: Understanding Agile in the Modern World</h2>
            <p>Agile is a modern approach to project management that helps teams deliver value faster and more efficiently. Unlike traditional methods that require rigid, long-term planning, Agile focuses on <strong>flexibility, customer collaboration, and delivering work in small, incremental steps</strong>.</p>
            <p>This iterative process allows teams to adapt to change, improve continuously, and respond to customer feedback in real-time. Platforms like <a href="#">AgileSuit</a> are designed to support this entire lifecycle, making Agile principles actionable and measurable.</p>
            
            <hr className="my-8" />

            <h2>What is Agile? The Core Idea</h2>
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

            <h2>Agile vs. Traditional Waterfall</h2>
            <p>The core difference between Agile and traditional models like <strong>Waterfall</strong> is flexibility. Waterfall is a linear, sequential process where each phase must be completed before the next begins. Agile, on the other hand, is an iterative loop of planning, building, and learning.</p>
            
            <AgileVsWaterfallTable />
            
            <hr className="my-8" />

            <h2>Common Agile Frameworks & Key Roles</h2>
            <p>Agile is an umbrella term for several frameworks. The most popular are:</p>
            <ul>
                <li><strong>Scrum:</strong> A framework based on sprints, specific roles, and regular meetings (events) to get work done.</li>
                <li><strong>Kanban:</strong> Focuses on visualizing workflow, limiting work-in-progress, and maximizing efficiency.</li>
                <li><strong>SAFe (Scaled Agile Framework):</strong> Designed for large organizations to apply Agile principles at an enterprise scale.</li>
            </ul>

            <p>In a typical Agile (Scrum) team, there are three key roles:</p>
            <AgileTeamStructureDiagram />

            <hr className="my-8" />

            <h2>How AgileSuit Powers the Agile Cycle</h2>
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

            <h2>Conclusion: The Agile Advantage</h2>
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
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
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
                <li><strong>Late Feedback:</strong> Customers and users often didn't see the product until it was nearly finished. By then, it was often too late or too expensive to make significant changes.</li>
                <li><strong>Resistance to Change:</strong> The model assumes all requirements can be known upfront. In reality, markets shift, and customer needs evolve. Waterfall treated change as an error, not a reality.</li>
                <li><strong>High Risk of Failure:</strong> With a single "big bang" delivery at the end, all the project's risk was pushed to the final phase. If the product was wrong, the entire investment was wasted.</li>
            </ul>

            <WaterfallVsAgileDiagram />
            
            <hr className="my-8" />

            <h2 className="font-bold">The Manifesto for a Better Way</h2>
            <p>In 2001, a group of 17 software developers met in Utah, frustrated with the status quo. They recognized that the industry needed a new philosophy—one that embraced change, prioritized customer value, and enabled rapid delivery. The result of their meeting was the <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Manifesto for Agile Software Development</a>.</p>
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
            <p>Ultimately, Agile was created because the old way of building software was broken. It offered a solution to deliver better products faster, with less risk and higher customer satisfaction. It was, and remains, a necessary evolution for an industry defined by constant change.</p>
        </article>
    );
}

// Component for "Traditional Waterfall vs. Agile"
function WaterfallVsAgileArticle() {
  return (
    <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
      <h1 className="font-bold">Traditional Waterfall vs. Agile</h1>
      <p className="lead !text-xl !font-normal text-muted-foreground">Understanding the Two Core Development Philosophies</p>
      
      <hr className="my-8" />
      
      <p>In project management, <strong>Waterfall and Agile</strong> represent two fundamentally different approaches to delivering work. Understanding their differences is key to choosing the right method for your team and project.</p>
      
      <h2 className="font-bold">The Waterfall Model: A Linear Path</h2>
      <p>The <strong>Waterfall model</strong> is a traditional, sequential approach. Think of it as a series of cascading steps where each phase must be fully completed before the next one begins. The typical phases are:</p>
      <ol>
          <li>Requirements</li>
          <li>Design</li>
          <li>Implementation (Coding)</li>
          <li>Testing</li>
          <li>Deployment</li>
      </ol>
      <p>This method is very structured and requires extensive documentation and planning upfront. Once a phase is complete, going back to make changes is difficult and costly. It works best for projects where requirements are well-understood and unlikely to change.</p>
      
      <hr className="my-8" />
      
      <h2 className="font-bold">The Agile Model: An Iterative Loop</h2>
      <p><strong>Agile</strong>, on the other hand, is an iterative and incremental approach. Instead of one long, linear path, Agile breaks the project into small, manageable cycles called <strong>sprints</strong> (typically 2-4 weeks long). At the end of each sprint, the team delivers a working piece of the product. This allows for continuous feedback, adaptation, and improvement throughout the project lifecycle.</p>
      
      <WaterfallVsAgileDiagram />

      <hr className="my-8" />

      <h2 className="font-bold">Key Differences: A Head-to-Head Comparison</h2>
      <p>Let's break down the core differences in a simple table:</p>
      
      <AgileVsWaterfallTable />

      <hr className="my-8" />
      
      <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
          <p className="font-semibold m-0 text-lg">Which One Should You Use?</p>
          <p>For most modern software projects where requirements are expected to evolve, <strong>Agile is the preferred method</strong>. It reduces risk, improves customer satisfaction, and allows teams to deliver value faster. Tools like <strong>AgileSuit</strong> are built from the ground up to support the Agile workflow, from sprint planning to tracking metrics.</p>
      </div>

      <h2 className="font-bold">Conclusion</h2>
      <p>While Waterfall has its place for highly predictable projects, Agile's flexibility and focus on continuous feedback make it the superior choice for the dynamic and fast-paced world of modern development. It empowers teams to respond to change, collaborate effectively, and consistently deliver products that meet customer needs.</p>
    </article>
  );
}

// Component for "Problems Agile Solves"
function ProblemsAgileSolvesArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground">
            <h1 className="font-bold">Problems Agile Solves in Modern Development</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">Why Teams Are Moving Away from Traditional Methods</p>

            <hr className="my-8" />

            <p>Agile wasn't just a new idea; it was a direct solution to the persistent and costly problems that plagued traditional development models like Waterfall. Here are the key issues that Agile directly addresses.</p>

            <h2 className="font-bold">1. The Problem: Changing Requirements</h2>
            <p><strong>Traditional Failure:</strong> Waterfall projects require all requirements to be defined upfront. In the real world, this is nearly impossible. Market needs change, new competitors emerge, and customer feedback reveals better ideas. In a rigid model, any change is a crisis that causes delays and budget overruns.</p>
            <p><strong>Agile Solution:</strong> Agile <em>embraces</em> change. By working in short sprints, teams can incorporate new feedback and adjust priorities at the start of every cycle. This ensures the final product is what the customer actually wants, not just what was planned months ago.</p>

            <hr className="my-8" />

            <h2 className="font-bold">2. The Problem: Late Feedback & High Risk</h2>
            <p><strong>Traditional Failure:</strong> With Waterfall, the customer often doesn't see a working product until the very end. If the team misunderstood a requirement or built the wrong thing, the entire project's budget and time can be wasted. The risk is concentrated at the final delivery.</p>
            <p><strong>Agile Solution:</strong> Agile delivers a small, working piece of the product every few weeks. This creates a continuous feedback loop. Customers can see progress, provide input early, and guide the development process. Risk is spread out and minimized with each successful sprint.</p>

            <hr className="my-8" />

            <h2 className="font-bold">3. The Problem: Lack of Transparency</h2>
            <p><strong>Traditional Failure:</strong> Stakeholders and even team members often have little visibility into the true progress of a project. Status is measured by phase completion ("Design is 100% done"), which doesn't reflect actual value delivered.</p>
            <p><strong>Agile Solution:</strong> Agile provides radical transparency. Tools like <strong>AgileSuit</strong> offer real-time dashboards, burndown charts, and Kanban boards. Everyone can see what's being worked on, what's done, and what's blocked. Daily stand-ups ensure the entire team is aligned and aware of progress and impediments.</p>

            <hr className="my-8" />

             <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">AgileSuit: Your Solution for Agile Problems</p>
                <p>AgileSuit is designed to solve these exact problems by providing a central hub for sprint planning, task management, and real-time metric tracking, ensuring your team stays aligned and productive.</p>
            </div>

            <h2 className="font-bold">Conclusion</h2>
            <p>Agile isn't just a different process; it's a better-suited operating system for the uncertainty of modern development. It directly tackles the core issues of changing requirements, high risk, and poor visibility, leading to more successful projects and happier teams.</p>
        </article>
    );
}

// Component for "Agile Mindset & Philosophy"
function AgileMindsetArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground">
            <h1 className="font-bold">The Agile Mindset & Philosophy</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">It's Not Just What You Do, It's How You Think</p>

            <hr className="my-8" />

            <p>Agile is more than a set of practices, ceremonies, and roles. At its core, it's a <strong>mindset</strong>—a fundamental shift in how teams approach work, collaboration, and value delivery. Adopting the processes without embracing the philosophy is like having a car without an engine. You have the frame, but you won't get far.</p>
            <p>The Agile mindset is built on a foundation of trust, collaboration, and a relentless focus on the customer.</p>
            
            <h2 className="font-bold">Core Pillars of the Agile Mindset</h2>

            <h3>1. Embrace and Welcome Change</h3>
            <p>The traditional mindset sees change as a problem to be avoided. The Agile mindset sees change as an opportunity to create more value. Agile teams expect requirements to evolve and have a system designed to adapt to them. The goal is not to perfectly execute a static plan but to continuously steer toward the best possible outcome.</p>

            <h3>2. Focus on Delivering Value Early and Often</h3>
            <p>The primary measure of success in Agile is <em>working software</em>. Instead of waiting months for a "big bang" release, Agile teams focus on delivering small, incremental pieces of a functional product. This approach provides value to the customer sooner and generates crucial feedback that guides future development.</p>

            <h3>3. Collaborate and Communicate Relentlessly</h3>
            <p>Agile breaks down silos. Instead of separate departments handing off work, Agile teams are cross-functional and collaborate daily. Business stakeholders, developers, and designers work together throughout the project. This constant communication ensures everyone is aligned and that the team is building the right thing.</p>
            
            <h3>4. Trust and Empower the Team</h3>
            <p>The Agile philosophy trusts that the best work comes from motivated, self-organizing teams. Instead of a top-down, command-and-control structure, leaders empower teams to make decisions about how to best accomplish their work. This fosters ownership, creativity, and a higher level of commitment.</p>
            
            <h3>5. Reflect and Adapt Continuously</h3>
            <p>Agile teams are never satisfied with the status quo. At regular intervals (e.g., at the end of each sprint), the team reflects on what went well, what could be improved, and creates a concrete plan to adapt their process. This commitment to continuous improvement (known as <em>Kaizen</em>) is a cornerstone of the Agile mindset.</p>
            
             <hr className="my-8" />
             
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Cultivating the Mindset with AgileSuit</p>
                <p><strong>AgileSuit</strong> reinforces the Agile mindset by providing tools that foster transparency, facilitate collaboration, and make continuous improvement a natural part of the workflow. From retrospective boards to real-time progress charts, it helps turn philosophy into practice.</p>
            </div>
            
            <h2 className="font-bold">Conclusion</h2>
            <p>Adopting Agile is a cultural transformation. It's about shifting from rigid processes to flexible frameworks, from individual assignments to collective ownership, and from following a plan to delivering customer value. Mastering this mindset is the true key to unlocking the full potential of Agile.</p>
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
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            <h1 className="font-bold">The 4 Core Values of the Agile Manifesto</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Simple Statements That Revolutionized Software Development</p>
            
            <hr className="my-8" />
            
            <p>The <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Agile Manifesto</a> is not a rulebook. It's a declaration of priorities. It consists of four core values that contrast the Agile approach with traditional, heavyweight methodologies. Each value highlights a preference, stating that while there is value in the items on the right, Agile practitioners value the items on the left <em>more</em>.</p>
            
            <FourCoreValuesDiagram />
            
            <h2 className="font-bold">1. Individuals and Interactions Over Processes and Tools</h2>
            <p>This value emphasizes that the best solutions come from people collaborating effectively. While processes and tools are helpful, they are secondary to the quality of interactions between team members. A great team with basic tools will always outperform a dysfunctional team with the best tools money can buy. Communication, trust, and collaboration are the real drivers of success.</p>
            
            <h2 className="font-bold">2. Working Software Over Comprehensive Documentation</h2>
            <p>The primary goal of development is to deliver software that works and provides value to the customer. Traditional methods often produced mountains of documentation that were expensive to create and quickly became outdated. Agile prioritizes delivering functional increments of the product over creating exhaustive documentation. Documentation is still created, but only what is necessary and adds value.</p>
            
            <h2 className="font-bold">3. Customer Collaboration Over Contract Negotiation</h2>
            <p>Agile views the customer as a partner in the development process, not an adversary across a negotiation table. Instead of locking in every detail in a rigid contract upfront, Agile teams work in close collaboration with their customers throughout the project. This continuous feedback loop ensures that the final product truly meets the customer's needs and expectations.</p>
            
            <h2 className="font-bold">4. Responding to Change Over Following a Plan</h2>
            <p>The business world is dynamic. Market conditions change, user needs evolve, and new opportunities arise. Traditional models treat change as a deviation from the plan that must be controlled. Agile, however, anticipates and welcomes change. It recognizes that the ability to pivot and respond to new information is a competitive advantage. An Agile plan is a flexible guide, not a rigid script.</p>

            <hr className="my-8" />
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Living the Values with AgileSuit</p>
                <p><strong>AgileSuit</strong> is designed around these values, with features that promote real-time collaboration, track working software increments, and provide the flexibility needed to respond to change effectively.</p>
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
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground">
            <h1 className="font-bold">The 12 Principles of Agile Software</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Guiding Rules Behind the Agile Manifesto</p>
            <hr className="my-8" />
            <p>While the four core values provide the philosophical foundation of Agile, the 12 supporting principles offer more specific, actionable guidance. They are the "how-to" behind the Agile mindset.</p>
            <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principles.map((p, i) => (
                    <Card key={i} className="flex flex-col">
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
        </article>
    );
}

function ScrumIntroArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground">
            <h1 className="font-bold">Introduction to Scrum</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">The Most Popular Agile Framework</p>

            <hr className="my-8" />

            <p><strong>Scrum</strong> is a lightweight yet powerful framework designed to help teams build complex products in an iterative and incremental way. It is not a methodology with rigid instructions, but a framework that provides a structure of roles, events, and artifacts. Within this structure, teams can develop their own specific processes.</p>
            <p>The name "Scrum" is taken from rugby, where a team works together to move the ball down the field. Similarly, a Scrum team works together to deliver value in focused bursts called <strong>sprints</strong>.</p>
            
            <h2 className="font-bold">The 3 Pillars of Scrum</h2>
            <p>Scrum is founded on empiricism, which means learning from experience. This is supported by three pillars:</p>
            <ul>
                <li><strong>Transparency:</strong> All aspects of the work must be visible to everyone involved—the stakeholders, the team, and the customers. Tools like AgileSuit's shared dashboards are critical for this.</li>
                <li><strong>Inspection:</strong> The team frequently inspects the product and their progress toward the sprint goal to detect any undesirable variances.</li>
                <li><strong>Adaptation:</strong> If the inspection reveals that one or more aspects of the process are flawed, the team must adapt as quickly as possible to prevent further deviation.</li>
            </ul>

            <hr className="my-8" />

            <h2 className="font-bold">The Core Components of Scrum</h2>
            <p>Scrum is defined by three categories of components:</p>
            <div className="not-prose my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader><CardTitle>3 Roles</CardTitle></CardHeader><CardContent><p>Product Owner, Scrum Master, Development Team.</p></CardContent></Card>
                <Card><CardHeader><CardTitle>5 Events</CardTitle></CardHeader><CardContent><p>The Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective.</p></CardContent></Card>
                <Card><CardHeader><CardTitle>3 Artifacts</CardTitle></CardHeader><CardContent><p>Product Backlog, Sprint Backlog, Increment.</p></CardContent></Card>
            </div>
            <p>We will explore each of these in detail in the upcoming sections of the Learning Hub.</p>
        </article>
    );
}


function KanbanVsScrumDiagram() {
    return (
        <div className="not-prose my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scrum Column */}
            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-2xl font-bold text-center text-primary mb-4">Scrum</h3>
                <ul className="space-y-3">
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Cadence:</strong> Regular, fixed-length sprints (e.g., 2 weeks).</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Roles:</strong> Prescribed roles: Product Owner, Scrum Master, Dev Team.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Change:</strong> Changes are typically not introduced during a sprint.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Metrics:</strong> Velocity is a key metric.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" /><div><strong>Best for:</strong> Projects that benefit from a regular rhythm and iterative feedback.</div></li>
                </ul>
            </div>
            {/* Kanban Column */}
            <div className="bg-card border rounded-lg p-6">
                <h3 className="text-2xl font-bold text-center text-accent-foreground mb-4">Kanban</h3>
                <ul className="space-y-3">
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Cadence:</strong> Continuous flow. No sprints.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Roles:</strong> No prescribed roles. The existing team structure is used.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Change:</strong> Changes can be made at any time as capacity allows.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Metrics:</strong> Cycle time and lead time are key metrics.</div></li>
                    <li className="flex gap-3"><CheckCircle2 className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-1" /><div><strong>Best for:</strong> Teams with shifting priorities and a focus on continuous delivery.</div></li>
                </ul>
            </div>
        </div>
    );
}


function KanbanIntroArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground">
            <h1 className="font-bold">Introduction to Kanban</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">Visualizing Work, Limiting WIP, and Maximizing Flow</p>

            <hr className="my-8" />

            <p><strong>Kanban</strong> is an Agile framework that focuses on visualizing your workflow, limiting work in progress (WIP), and maximizing efficiency. The word "Kanban" is Japanese for "visual signal" or "card." The core of Kanban is the <strong>Kanban board</strong>, a visual representation of your team's process.</p>
            
            <h2 className="font-bold">The Four Core Principles of Kanban</h2>
            <ol>
                <li><strong>Start with what you do now:</strong> Kanban does not prescribe a specific process. Instead, you start by visualizing your current workflow, and then gradually make improvements.</li>
                <li><strong>Agree to pursue incremental, evolutionary change:</strong> Kanban is about making small, continuous improvements rather than large, disruptive ones.</li>
                <li><strong>Respect the current process, roles, and responsibilities:</strong> Unlike Scrum, Kanban does not require new roles. It is designed to be implemented on top of your existing team structure.</li>
                <li><strong>Encourage acts of leadership at all levels:</strong> Kanban empowers every team member to identify problems and suggest improvements to the workflow.</li>
            </ol>
            
            <h2 className="font-bold">Scrum vs. Kanban</h2>
            <p>While both are Agile frameworks, they have key differences:</p>
            <KanbanVsScrumDiagram />

             <hr className="my-8" />
             
            <div className="not-prose my-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">Kanban Boards in AgileSuit</p>
                <p><strong>AgileSuit</strong> provides flexible board views that can be configured for either Scrum or Kanban, allowing your team to use the framework that best suits your needs while keeping all your work in one centralized platform.</p>
            </div>
        </article>
    );
}
