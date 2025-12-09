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
        price: 'Free',
        period: 'Forever',
        name: 'Starter',
        description: 'Perfect for small teams and startups getting started with agile.',
        features: [
            'Up to 5 team members',
            'Unlimited sprints',
            'Basic retrospective tools',
            'Community support',
        ],
        buttonText: 'Get Started',
        href: '/signup',
        popular: false,
    },
    {
        price: '$49',
        period: 'per month',
        name: 'Pro',
        description: 'Advanced features for growing teams that need more power.',
        features: [
            'Up to 20 team members',
            'Advanced analytics & reporting',
            'Custom workflows',
            'Priority email support',
            'Jira & GitHub integration',
        ],
        buttonText: 'Start Free Trial',
        href: '/signup?plan=pro',
        popular: true,
    },
    {
        price: 'Custom',
        period: 'contact us',
        name: 'Enterprise',
        description: 'Scalable solutions for large organizations with specific needs.',
        features: [
            'Unlimited team members',
            'SSO & Advanced Security',
            'Dedicated Success Manager',
            'Custom SLA',
            'On-premise deployment option',
        ],
        buttonText: 'Contact Sales',
        href: '/contact',
        popular: false,
    },
];

const faqs = [
    {
        question: 'How does the free trial work?',
        answer: 'You can test drive the Pro plan for 14 days with no credit card required. At the end of the trial, you can choose to subscribe or downgrade to the Free plan.',
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
        answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. For Enterprise plans, we also support invoicing.',
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
                                Simple, transparent pricing
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Choose the plan that's right for your team. All plans include a 14-day free trial.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                    <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8">
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

                                <h3 className={`text-2xl font-bold tracking-tight ${item.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {item.name}
                                </h3>

                                <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight">
                                    {item.price}
                                    <span className={`text-lg font-semibold tracking-normal ${item.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                                        /{item.period}
                                    </span>
                                </div>

                                <p className={`mt-6 text-base leading-7 ${item.popular ? 'text-gray-300' : 'text-gray-600'}`}>
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
                <div className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
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
