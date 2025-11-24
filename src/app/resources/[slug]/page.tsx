'use client';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Check, CheckCircle, Code, GitBranch, Layers, Lightbulb, Milestone, RefreshCw, Repeat, Search, Target, Users, Zap } from 'lucide-react';
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
        description: "Analysis of concepts and requirements definitions; Determine current state and your expectations.",
        icon: Search,
        color: "fill-orange-500",
        textColor: "text-white",
        descriptionPosition: "left"
      },
      {
        step: 2,
        title: "Planning of Sprints",
        description: "Arrange teams and tools needed to optimize production.",
        icon: Milestone,
        color: "fill-orange-500",
        textColor: "text-white",
        descriptionPosition: "left"
      },
      {
        step: 3,
        title: "Collaborative Design & Development",
        description: "From the beginning of the process, the end users' involvement and feedback is critical.",
        icon: Users,
        color: "fill-blue-800",
        textColor: "text-white",
        descriptionPosition: "right"
      },
      {
        step: 4,
        title: "Create & Implement",
        description: "Frequent development delivery through sprints. Feedback on testing & appropriate changes are imperative.",
        icon: Zap,
        color: "fill-blue-800",
        textColor: "text-white",
        descriptionPosition: "right"
      },
      {
        step: 5,
        title: "Review & Monitor",
        description: "Ensure that you are reviewing and monitoring key metrics for success.",
        icon: BarChart,
        color: "fill-gray-800",
        textColor: "text-white",
        descriptionPosition: "right"
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
            <div className="relative w-[700px] h-[500px]">
                <svg viewBox="-350 -250 700 500" className="w-full h-full overflow-visible">
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
                    
                    {segments.map((segment) => {
                        const angle = (segment.step - 0.5) * anglePerSegment - (Math.PI / 2);
                        const isLeft = segment.descriptionPosition === 'left';
                        const startRadius = isLeft ? 300 : 230;
                        const endRadius = isLeft ? 230 : 300;

                        const lineStartX = startRadius * Math.cos(angle);
                        const lineStartY = startRadius * Math.sin(angle);
                        const lineEndX = endRadius * Math.cos(angle);
                        const lineEndY = endRadius * Math.sin(angle);
                        
                        const textX = isLeft ? lineStartX - 10 : lineStartX + 10;
                        const textY = lineStartY;
                        const textAnchor = isLeft ? 'end' : 'start';
                        
                        return (
                            <g key={`desc-${segment.step}`}>
                                <line x1={lineStartX} y1={lineStartY} x2={lineEndX} y2={lineEndY} stroke="#d1d5db" strokeWidth="1" />
                                <circle cx={lineEndX} cy={lineEndY} r="3" fill="#d1d5db" />
                                <foreignObject x={textX - (isLeft ? 256 : 0)} y={textY-25} width="256" height="100">
                                   <div className={`w-64 ${isLeft ? 'text-right' : 'text-left'}`}>
                                        <p className="text-sm text-gray-600">{segment.description}</p>
                                   </div>
                                </foreignObject>
                            </g>
                        )
                    })}
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

// Component for the "What is Agile Methodology?" article
function WhatIsAgileMethodologyArticle() {
    return (
        <article className="prose lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            <h1>What is Agile Methodology?</h1>
            <p className="lead !text-xl !font-normal text-muted-foreground">A Complete, In-Depth Guide for Modern Product Teams</p>

            <hr />

            <h2 id="introduction">Introduction: Understanding Agile in the Modern World</h2>
            <p>In today’s fast-paced digital environment, where customer expectations evolve rapidly and technology changes almost daily, traditional methods of project execution often struggle to keep up. This is where Agile Methodology emerges as a powerful alternative.</p>
            <p>Agile is not just a way to manage projects — it is a philosophy, a mindset, and a structured approach to delivering value continuously while adapting to change. It focuses on flexibility, collaboration, customer satisfaction, and incremental progress rather than rigid planning and long execution cycles.</p>
            <p>Agile methodology helps teams respond to uncertainty effectively, break complex work into manageable pieces, deliver faster, and improve continuously. Platforms like AgileSuit are built to support this entire lifecycle — from sprint planning and tracking to retrospectives and advanced reporting — making Agile more actionable and measurable.</p>
            
            <hr/>

            <h2 id="what-is-agile">What is Agile Methodology?</h2>
            <h3>Definition:</h3>
            <blockquote className="border-l-4 border-primary bg-muted/50 p-6 italic text-xl">
                Agile Methodology is an iterative and incremental approach to project management and software development that emphasizes flexibility, customer collaboration, continuous delivery, and rapid response to change.
            </blockquote>
            <p>Rather than planning everything upfront, Agile divides a project into small cycles called iterations or sprints, enabling teams to review progress regularly and adapt based on feedback.</p>
            <h4>Agile encourages:</h4>
            <ul>
                <li>Working software over extensive documentation</li>
                <li>Customer collaboration over contract negotiation</li>
                <li>Responding to change over following a fixed plan</li>
                <li>Individuals and interactions over processes and tools</li>
            </ul>
            <p>Agile methodology is guided by the <a href="https://agilemanifesto.org/" target="_blank" rel="noopener noreferrer">Agile Manifesto</a>, a foundational document created in 2001 by 17 software professionals who wanted a better way to develop products.</p>

            <hr/>

            <AgileFlowDiagram />

            <hr/>

            <h2 id="core-principles">Core Principles of Agile Methodology</h2>
            <p>Agile is driven by 12 core principles, some of the most important include:</p>
            <ul>
                <li>Deliver working software frequently</li>
                <li>Welcome changing requirements, even late in development</li>
                <li>Business people and developers must work together daily</li>
                <li>Simplicity is essential</li>
                <li>Continuous attention to technical excellence</li>
                <li>Regular reflection and adjustment</li>
            </ul>
            <div className="not-prose p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="font-semibold m-0 text-lg">How AgileSuit Helps:</p>
                <ul className="my-2 space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>Track sprint progress visually</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>Conduct retrospectives</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>Monitor performance analytics</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>Improve sprint outcomes over time</li>
                </ul>
            </div>

            <hr/>

            <h2 id="key-components">Key Components of Agile Methodology</h2>
            <ol>
                <li><strong>Iterative Development:</strong> The project is broken into short cycles (sprints usually 1–4 weeks). Each sprint delivers a usable piece of the product.</li>
                <li><strong>Incremental Delivery:</strong> Products are built piece by piece rather than all at once.</li>
                <li><strong>Continuous Feedback:</strong> Feedback from stakeholders and users is integrated frequently.</li>
                <li><strong>Cross-Functional Teams:</strong> Agile teams include developers, testers, designers, analysts, and product owners working together.</li>
                <li><strong>Flexible Planning:</strong> Planning adapts as new information emerges.</li>
            </ol>

            <hr/>
            
            <h2 id="agile-vs-waterfall">Agile vs Traditional Project Management</h2>
            <p><strong>Traditional (Waterfall) Approach:</strong></p>
            <p>Requirements → Design → Development → Testing → Deployment</p>
            <p>Executed linearly, with changes being expensive and difficult.</p>
            <p><strong>Agile Approach:</strong></p>
            <p>Plan → Build → Test → Review → Improve → Repeat</p>
            <p>Executed iteratively, allowing flexibility and faster time to value.</p>
            <div className="not-prose my-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aspect</TableHead>
                            <TableHead>Waterfall</TableHead>
                            <TableHead>Agile</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Flexibility</TableCell>
                            <TableCell>Low</TableCell>
                            <TableCell className='font-semibold text-primary'>High</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Customer Feedback</TableCell>
                            <TableCell>Late Stage</TableCell>
                            <TableCell className='font-semibold text-primary'>Continuous</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Delivery</TableCell>
                            <TableCell>End of Project</TableCell>
                            <TableCell className='font-semibold text-primary'>Frequent</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>Risk</TableCell>
                            <TableCell>High</TableCell>
                            <TableCell className='font-semibold text-primary'>Lower</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell>Adaptability</TableCell>
                            <TableCell>Poor</TableCell>
                            <TableCell className='font-semibold text-primary'>Excellent</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

             <hr/>

            <h2 id="why-created">Why Agile Methodology Was Created</h2>
            <p>Agile was created due to the failure of rigid project management models. Organizations faced challenges such as:</p>
            <ul>
                <li>Projects exceeding budget</li>
                <li>Delayed delivery</li>
                <li>Failed user adoption</li>
                <li>Inflexible planning</li>
                <li>Misalignment with business needs</li>
            </ul>
            <p>Agile was designed to:</p>
            <ul>
                <li>Embrace change instead of resisting it</li>
                <li>Improve collaboration across teams</li>
                <li>Enhance speed and quality</li>
                <li>Focus on real customer value</li>
            </ul>
             <div className="not-prose p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="m-0 text-lg">AgileSuit enhances this philosophy by providing real-time visibility and structured workflows for teams adapting Agile principles.</p>
            </div>

            <hr/>

            <h2 id="frameworks">Agile Methodology Frameworks</h2>
            <p>Agile is an umbrella concept supported by multiple frameworks:</p>
            <ol>
                <li><strong>Scrum:</strong> Most popular Agile framework. Uses Sprints, Daily Standups, Sprint Reviews, and Retrospectives.</li>
                <li><strong>Kanban:</strong> Focuses on visual workflow and continuous delivery without fixed sprints.</li>
                <li><strong>Extreme Programming (XP):</strong> Emphasizes technical excellence and continuous testing.</li>
                <li><strong>SAFe (Scaled Agile Framework):</strong> Used by large organizations to scale Agile across multiple teams.</li>
            </ol>
            
            <hr/>

            <h2 id="roles">Agile Roles Explained</h2>
            <p><strong>Product Owner:</strong> Defines requirements and prioritizes work.</p>
            <p><strong>Scrum Master:</strong> Facilitates Agile practices and removes obstacles.</p>
            <p><strong>Development Team:</strong> Delivers the product incrementally.</p>

            <AgileTeamStructureDiagram />

            <hr/>

            <h2 id="lifecycle">Agile Lifecycle Stages</h2>
            <ol>
                <li>Concept</li>
                <li>Inception</li>
                <li>Iteration</li>
                <li>Release</li>
                <li>Maintenance</li>
                <li>Retirement</li>
            </ol>
            <p>Each stage promotes flexibility, ensuring better adaptability to change.</p>
            
            <hr/>

            <h2 id="mindset">Agile Mindset & Philosophy</h2>
            <p>Agile is not only about tools; it’s about culture:</p>
            <ul>
                <li>Transparency</li>
                <li>Trust</li>
                <li>Accountability</li>
                <li>Continuous learning</li>
                <li>Customer focus</li>
            </ul>
            <div className="not-prose p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                <p className="m-0 text-lg">AgileSuit aligns seamlessly by allowing transparency across teams and leadership in real-time.</p>
            </div>

            <hr/>
            
            <h2 id="benefits">Benefits of Agile Methodology</h2>
             <ul>
                <li>Faster time to market</li>
                <li>Better product quality</li>
                <li>Higher customer satisfaction</li>
                <li>Reduced risk</li>
                <li>Increased team collaboration</li>
                <li>Continuous improvement</li>
            </ul>

            <hr/>

            <h2 id="myths">Common Myths About Agile</h2>
             <div className="not-prose my-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Myth</TableHead>
                            <TableHead>Reality</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Agile has no planning</TableCell>
                            <TableCell>Agile involves <span className='font-semibold text-primary'>continuous</span> planning</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Agile means no documentation</TableCell>
                            <TableCell>Agile values <span className='font-semibold text-primary'>essential</span> documentation</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Agile is only for IT</TableCell>
                            <TableCell>Agile applies <span className='font-semibold text-primary'>across industries</span></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <hr/>

            <h2 id="real-life">How Agile Works in Real Life</h2>
            <p>Imagine building an e-commerce app: Instead of building it completely and launching after 1 year, Agile allows you to:</p>
            <ul>
                <li>Release login system first</li>
                <li>Add payment next</li>
                <li>Add recommendation engine later</li>
                <li>Improve based on user feedback</li>
            </ul>
            <p>Each step delivers value.</p>
            
            <hr/>

            <h2 id="agilesuit-integration">Agile + AgileSuit = Structured Excellence</h2>
            <p>AgileSuit simplifies Agile implementation by providing:</p>
            <ul>
                <li>Sprint planning tools</li>
                <li>Real-time task tracking</li>
                <li>Retrospective analysis</li>
                <li>Performance metrics</li>
                <li>Department segmentation</li>
                <li>Team hierarchy control</li>
            </ul>
            <p>This turns Agile from theory into measurable execution.</p>

            <AgileSuitCycleDiagram />

            <hr/>

            <h2 id="non-it">Agile Methodology in Non-IT Fields</h2>
            <p>Agile is now used in:</p>
            <ul>
                <li>Marketing</li>
                <li>HR</li>
                <li>Education</li>
                <li>Manufacturing</li>
                <li>Healthcare</li>
                <li>Product Design</li>
            </ul>
            <p>Its flexibility proves universal.</p>
            
            <hr/>
            
            <h2 id="conclusion">Conclusion</h2>
            <p>Agile Methodology represents a transformation in how modern teams think, collaborate, and deliver value. It prioritizes people over processes, collaboration over control, and adaptability over rigidity.</p>
            <p>By adopting Agile, organizations move from slow, rigid execution to smart, flexible, and responsive systems that drive innovation and efficiency.</p>
            <p>With platforms like AgileSuit, Agile becomes structured, scalable, and measurable—offering businesses a powerful way to deliver continuous improvement while maintaining clarity and control.</p>
            <blockquote className="border-l-4 border-primary bg-muted/50 p-6 text-2xl text-center italic">
                Agile is not just a methodology — it is the heartbeat of modern innovation.
            </blockquote>
        </article>
    );
}

// Dummy table components to avoid breaking the file
// In a real scenario, you'd import these from your UI library
const Table = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => <table {...props} className="w-full text-left border-collapse">{children}</table>;
const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props}>{children}</thead>;
const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} className="border-b">{children}</tr>;
const TableHead = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <th {...props} className="p-4 font-medium text-muted-foreground text-base">{children}</th>;
const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props}>{children}</tbody>;
const TableCell = ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props} className="p-4 text-base">{children}</td>;

    




    

    