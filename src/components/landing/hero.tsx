import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, Clock, Mail, Slack, Calendar as CalendarIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

function FloatingCard({ className, children, ...props }: React.ComponentProps<typeof Card>) {
    return (
        <Card
            className={`absolute rounded-2xl bg-card/60 p-4 shadow-xl backdrop-blur-lg ${className}`}
            {...props}
        >
            {children}
        </Card>
    );
}

function NoteCard() {
    return (
      <FloatingCard className="top-16 left-0 w-64 -rotate-6 float-2">
        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-red-500 shadow-md" />
        <p className="text-sm font-medium text-yellow-900">
            Take notes to keep track of crucial details, and accomplish more tasks with ease.
        </p>
         <div className="mt-4 flex items-center justify-end">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md">
                <Check className="h-5 w-5" />
            </div>
        </div>
      </FloatingCard>
    );
}
function RemindersCard() {
    return (
        <FloatingCard className="top-24 right-0 w-72 rotate-3 float-3">
             <CardHeader className='p-2'>
                <div className='flex items-center justify-between'>
                    <p className="text-sm font-semibold">Reminders</p>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div className="rounded-lg bg-background p-4">
                    <p className="font-semibold">Today's Meeting</p>
                    <p className="text-sm text-muted-foreground">Call with marketing team</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                        <Badge variant="secondary">Time</Badge>
                        <p className="font-mono text-muted-foreground">13:00 - 13:45</p>
                    </div>
                </div>
            </CardContent>
        </FloatingCard>
    );
}

function TasksCard() {
    return (
        <FloatingCard className="bottom-16 left-0 w-80 -rotate-3 float-4">
             <CardHeader className='p-2'>
                 <p className="text-sm font-semibold">Today's tasks</p>
            </CardHeader>
            <CardContent className="space-y-4 p-2">
                <div className='space-y-2'>
                    <div className="flex justify-between items-center">
                        <p className='font-medium text-sm'>New ideas for campaign</p>
                         <Avatar className="h-6 w-6">
                            <AvatarImage src="https://i.pravatar.cc/40?img=3" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                    </div>
                    <Progress value={60} className='h-2' />
                </div>
                 <div className='space-y-2'>
                    <div className="flex justify-between items-center">
                        <p className='font-medium text-sm'>Design PPT #4</p>
                         <Avatar className="h-6 w-6">
                            <AvatarImage src="https://i.pravatar.cc/40?img=4" />
                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                    </div>
                    <Progress value={100} className='h-2' />
                </div>
            </CardContent>
        </FloatingCard>
    );
}

function IntegrationsCard() {
    return (
        <FloatingCard className="bottom-12 right-0 w-64 rotate-2 float-2">
            <CardHeader className='p-2'>
                <p className="text-sm font-semibold">100+ Integrations</p>
            </CardHeader>
            <CardContent className="flex justify-center gap-4 p-2">
                <div className='h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-md'><Mail className='h-6 w-6 text-red-500'/></div>
                <div className='h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-md'><Slack className='h-6 w-6 text-purple-500'/></div>
                <div className='h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-md'><CalendarIcon className='h-6 w-6 text-blue-500'/></div>
            </CardContent>
        </FloatingCard>
    );
}

export function HeroSection() {
    return (
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
                <div className='flex justify-center'>
                    <div className='p-3 border-4 border-foreground/10 rounded-2xl bg-background/50 backdrop-blur-sm shadow-lg mb-8'>
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500 animate-spin">
                             <div className="grid grid-cols-2 grid-rows-2 gap-1">
                                <span className="h-2 w-2 rounded-full bg-blue-300" />
                                <span className="h-2 w-2 rounded-full bg-background" />
                                <span className="h-2 w-2 rounded-full bg-background" />
                                <span className="h-2 w-2 rounded-full bg-background" />
                            </div>
                        </div>
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                    Think, plan, and track{' '}
                    <span className="text-muted-foreground">all in one place</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                    Efficiently manage your tasks and boost productivity.
                </p>
                <div className="mt-10">
                    <Button size="lg" asChild>
                        <Link href="/signup">Get free demo</Link>
                    </Button>
                </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute inset-0 -z-0 hidden md:block">
                <NoteCard />
                <RemindersCard />
                <TasksCard />
                <IntegrationsCard />
            </div>
        </section>
    );
}
