'use client';
import * as React from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart, Check, CheckCircle2, Circle, Clock, GitBranch, Layers, Lightbulb, Milestone, RefreshCw, Repeat, Search, Target, Users, Zap, AlertTriangle } from 'lucide-react';
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
        if (toSlug(point) === 'what-is-agile-methodology') {
            return <WhatIsAgileMethodologyArticle />;
        }
        if (toSlug(point) === 'why-agile-was-created') {
            return <WhyAgileWasCreatedArticle />;
        }
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

            <h2>The Age of Failing Projects</h2>
            <p>To understand why <em>Agile</em> was created, we have to travel back to the 1990s. The software industry was booming, but it was also in a crisis. Projects were consistently running over budget, missing deadlines, and, worst of all, failing to meet the actual needs of customers. The traditional project management model, known as <strong>Waterfall</strong>, was a big part of the problem.</p>
            <p>The Waterfall model is a rigid, sequential process. Every step—requirements gathering, design, development, testing—had to be fully completed before the next could begin. This worked well for predictable manufacturing lines, but it was a disaster for the creative and ever-changing world of software development.</p>

            <hr className="my-8" />

            <h2>The Core Flaws of the Waterfall Model</h2>
            <p>The Waterfall approach created several critical issues that made software projects incredibly risky:</p>
            <ul>
                <li><strong>Late Feedback:</strong> Customers and users often didn't see the product until it was nearly finished. By then, it was often too late or too expensive to make significant changes.</li>
                <li><strong>Resistance to Change:</strong> The model assumes all requirements can be known upfront. In reality, markets shift, and customer needs evolve. Waterfall treated change as an error, not a reality.</li>
                <li><strong>High Risk of Failure:</strong> With a single "big bang" delivery at the end, all the project's risk was pushed to the final phase. If the product was wrong, the entire investment was wasted.</li>
            </ul>

            <WaterfallVsAgileDiagram />
            
            <hr className="my-8" />

            <h2>The Manifesto for a Better Way</h2>
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

            <h2>Conclusion: A Necessary Evolution</h2>
            <p>Ultimately, Agile was created because the old way of building software was broken. It offered a solution to deliver better products faster, with less risk and higher customer satisfaction. It was, and remains, a necessary evolution for an industry defined by constant change.</p>
        </article>
    );
}
