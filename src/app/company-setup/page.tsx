'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createOrganization } from '@/app/actions/organization';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
    slug: z.string()
        .min(3, { message: 'Subdomain must be at least 3 characters.' })
        .regex(/^[a-z0-9-]+$/, { message: 'Only lowercase letters, numbers, and hyphens are allowed.' }),
});

// ...
export const dynamic = 'force-dynamic';

export default function CompanySetupPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/login');
            } else {
                setUser(user);
            }
        }
        getUser();
    }, [router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    });

    // Auto-generate slug from name
    const watchName = form.watch('name');
    React.useEffect(() => {
        if (watchName && !form.getFieldState('slug').isDirty) {
            const slug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            form.setValue('slug', slug);
        }
    }, [watchName, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await createOrganization({
                userId: user.id,
                name: values.name,
                slug: values.slug,
            });

            if (response.error) {
                // Determine if it's a slug error or general error
                if (response.error.includes('URL')) {
                    form.setError('slug', { message: response.error });
                } else {
                    form.setError('root', { message: response.error });
                    // Also show as slug error if general, just to be visible
                    if (!form.formState.errors.slug) {
                        form.setError('slug', { message: response.error });
                    }
                }
                return;
            }

            if (response.success) {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error(error);
            form.setError('slug', { message: error.message || 'Failed to create organization' });
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Setup your Workspace</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Let's give your team a home.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company / Organization Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corp" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace URL</FormLabel>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 mr-2 text-sm">
                                            {process.env.NEXT_PUBLIC_BASE_URL || 'agilesuit.com'}/
                                        </span>
                                        <FormControl>
                                            <Input placeholder="acme-corp" {...field} disabled={isLoading} />
                                        </FormControl>
                                    </div>
                                    <FormDescription>This will be your unique workspace address.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4">
                            <p className="text-sm font-medium mb-1">First Admin</p>
                            <div className="p-3 bg-gray-50 rounded border flex items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user.displayName || 'You'}</p>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                                <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Owner</span>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Workspace
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={async () => {
                                    const { signOut } = await import('@/app/actions/auth');
                                    await signOut();
                                }}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Stuck? Sign Out & Try Again
                            </button>
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );
}
