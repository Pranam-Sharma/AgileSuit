'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GoogleIcon } from '../icons/google-icon';
import { useSearchParams } from 'next/navigation';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignUpForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.email.split('@')[0], // Default name
          }
        }
      });

      if (error) {
        throw error;
      }

      // Profile creation is handled by Supabase Trigger (handle_new_user)

      if (plan) {
        router.push(`/checkout?plan=${plan}`);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}`,
        },
      });

      if (error) throw error;

      // Note: Redirect happens automatically, so no router.push here usually
    } catch (error: any) {
      toast({
        title: 'Error signing in with Google',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  const inputStyles = "h-14 text-lg border-none bg-accent placeholder:text-accent-foreground/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0";

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-fuchsia-600">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Create an account to get started
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className={cn(inputStyles)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Password" disabled={isLoading} className={cn(inputStyles)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Confirm Password" disabled={isLoading} className={cn(inputStyles)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow-md hover:shadow-lg transition-shadow">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            SIGN UP
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full h-14 text-lg font-bold rounded-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-fuchsia-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
