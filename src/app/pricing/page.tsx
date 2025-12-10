'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, HelpCircle } from 'lucide-react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const items = [
    {
        order: 1,
        id: 'starter',
        price: '$9',
        period: 'per month',
        name: 'Starter',
        description: 'For small teams getting started with Agile.',
        features: [
            '1 Workspace',
            '1 Team',
            'Up to 5 Users',
            'Up to 3 Active Sprints',
            'Basic Retrospectives',
            'Standard Reports',
        ],
        buttonText: 'Get Starter',
        href: '/signup?plan=starter',
        popular: false,
        variant: 'outline',
    },
    {
        order: 2,
        id: 'team',
        price: '$29',
        period: 'per month',
        name: 'Team',
        description: 'For growing teams that need more structure.',
        features: [
            'Up to 3 Teams',
            'Up to 20 Users',
            'Unlimited Sprints',
            'Advanced Planning (Goals, Milestones)',
            'Velocity & Burndown Charts',
            'Team Dashboards',
        ],
        buttonText: 'Choose Team',
        href: '/signup?plan=team',
        popular: true,
        variant: 'default',
    },
    {
        order: 3,
        id: 'business',
        price: '$79',
        period: 'per month',
        name: 'Business',
        description: 'For multi-team organizations with advanced analytics.',
        features: [
            'Unlimited Teams',
            'Up to 100 Users',
            'Cross-team Sprint Comparison',
            'Department & Platform Views',
            'Custom Reports & Exports',
            'Role-based Access',
            'Priority Support',
        ],
        buttonText: 'Choose Business',
        href: '/signup?plan=business',
        popular: false,
        variant: 'outline',
    },
    {
        order: 4,
        id: 'enterprise',
        price: 'Custom',
        period: 'contact us',
        name: 'Enterprise',
        description: 'For large organizations with custom needs.',
        features: [
            'Unlimited Users',
            'SSO / SAML',
            'Dedicated Support',
            'Custom Onboarding',
            'Security Reviews',
            'SLA Guarantees',
        ],
        buttonText: 'Contact Sales',
        href: 'mailto:sales@agilesuit.com', // Simple contact link for now
        popular: false,
        variant: 'outline',
    },
];

const faqs = [
    {
        question: 'How does the free trial work?',
        answer: 'You can test drive the Team plan for 14 days with no credit card required. At the end of the trial, you can choose to subscribe or downgrade to the Starter plan.',
    },
    {
        question: 'Can I change plans later?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Prorated charges will apply for upgrades.',
    },
    {
        question: 'Do you offer discounts for non-profits?',
        answer: 'Absolutely! We love supporting organizations that do good. Contact our sales team for special non-profit pricing.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and UPI. Secure processing is handled by Stripe.',
    },
];

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <LandingHeader />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-headline">
                                Plans that scale with you
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Choose the perfect plan for your team size and needs. Transparent pricing, no hidden fees.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                    <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-x-8">
                        {items.map((item) => (
                            <div
                                key={item.name}
                                className={`relative flex flex-col rounded-3xl p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10 ${item.popular
                                        ? 'bg-gray-900 text-white shadow-2xl scale-105 z-10'
                                        : 'bg-white text-gray-900'
                                    }`}
                            >
                                {item.popular && (
                                    <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-center text-sm font-medium text-white shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className={`text-xl font-bold tracking-tight ${item.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {item.name}
                                </h3>

                                <div className="mt-4 flex items-baseline text-4xl font-bold tracking-tight">
                                    {item.price}
                                    {item.price !== 'Custom' && (
                                        <span className={`text-sm font-semibold tracking-normal ml-1 ${item.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                                            /mo
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm ${item.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {item.period === 'contact us' ? '' : 'billed monthly'}
                                </p>

                                <p className={`mt-6 text-sm leading-6 ${item.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {item.description}
                                </p>

                                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${item.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {item.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className={`h-6 w-5 flex-none ${item.popular ? 'text-indigo-400' : 'text-indigo-600'}`} aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 pt-8 flex flex-1 flex-col justify-end">
                                    <Button
                                        asChild
                                        size="lg"
                                        variant={item.popular ? 'secondary' : 'default'}
                                        className={`w-full ${!item.popular && 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                    >
                                        <Link href={item.href}>{item.buttonText}</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-lg font-medium text-gray-900">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-gray-600">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

            </main>
            <Footer />
        </div>
    );
}
