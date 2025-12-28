'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ShieldCheck, Lock, CreditCard, Wallet, Banknote, Smartphone, Building2, ArrowLeft } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions/stripe';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PLANS = {
    starter: {
        name: 'Starter Plan',
        price: '9',
        currency: '$',
        period: '/mo',
        features: ['1 Workspace', '5 Users', 'Basic Reports'],
    },
    team: {
        name: 'Team Plan',
        price: '29',
        currency: '$',
        period: '/mo',
        features: ['3 Teams', 'Unlimited Sprints', 'Analytics'],
    },
    business: {
        name: 'Business Plan',
        price: '79',
        currency: '$',
        period: '/mo',
        features: ['Unlimited Teams', 'RBAC', 'Priority Support'],
    },
};

import { createClient } from '@/lib/supabase/client';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan');
    const [isLoading, setIsLoading] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const supabase = createClient();

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session ? session.user : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const plan = PLANS[planId as keyof typeof PLANS];

    const handlePayment = async () => {
        if (!user) {
            console.error("User not authenticated");
            return;
        }
        setIsLoading(true);
        try {
            await createCheckoutSession(planId!, user.id);
        } catch (error) {
            console.error('Checkout error:', error);
            setIsLoading(false);
        }
    };

    if (!planId || !plan) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Link href="/pricing" className="text-indigo-600 hover:underline">Return to Pricing</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans selection:bg-indigo-500/30">
            {/* Ambient Backgrounds */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Main Compact Card */}
            <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Side: Summary (Dark) */}
                <div className="w-full md:w-2/5 bg-zinc-900 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative noise/texture could go here */}
                    <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <Link href="/pricing" className="inline-flex items-center text-zinc-400 hover:text-white text-xs mb-6 transition-colors">
                            <ArrowLeft className="w-3 h-3 mr-1" /> Change Plan
                        </Link>

                        <div className="mb-1">
                            <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Order Summary</h3>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{plan.name}</h1>
                        <div className="flex items-baseline mb-6">
                            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                                {plan.currency}{plan.price}
                            </span>
                            <span className="text-zinc-500 ml-1 text-sm">{plan.period}</span>
                        </div>

                        <div className="space-y-3">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-indigo-400" />
                                    </div>
                                    <span className="text-zinc-300 text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-zinc-800 mt-6">
                        <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                            <span>Subtotal</span>
                            <span>{plan.currency}{plan.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-500 mb-4">
                            <span>Tax</span>
                            <span>{plan.currency}0.00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-white">
                            <span>Total Due</span>
                            <span>{plan.currency}{plan.price}</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] text-zinc-500">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Secure SSL Encrypted Payment
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form (Light) */}
                <div className="flex-1 bg-white p-6 md:p-8 flex flex-col h-full overflow-y-auto max-h-[90vh]">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-zinc-900">Payment Method</h2>
                        <p className="text-xs text-zinc-500">Select how you'd like to pay.</p>
                    </div>

                    <Tabs defaultValue="card" className="flex-1 flex flex-col">
                        <TabsList className="grid grid-cols-5 gap-1 bg-zinc-100 p-1 mb-6 rounded-lg h-auto">
                            {[
                                { id: 'card', icon: CreditCard, label: 'Card' },
                                { id: 'netbanking', icon: Building2, label: 'Bank' },
                                { id: 'upi', icon: Smartphone, label: 'UPI' },
                                { id: 'paypal', icon: Wallet, label: 'PayPal' },
                                { id: 'neft', icon: Banknote, label: 'NEFT' },
                            ].map((m) => (
                                <TabsTrigger
                                    key={m.id}
                                    value={m.id}
                                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all"
                                >
                                    <m.icon className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">{m.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="flex-1">
                            {/* CARD */}
                            <TabsContent value="card" className="space-y-4 mt-0">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="cardNumber" className="text-xs text-zinc-600">Card Number</Label>
                                        <div className="relative">
                                            <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="h-9 pl-9 text-sm bg-zinc-50 border-zinc-200" />
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="expiry" className="text-xs text-zinc-600">Expiry</Label>
                                            <Input id="expiry" placeholder="MM/YY" className="h-9 text-sm bg-zinc-50 border-zinc-200 " />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="cvc" className="text-xs text-zinc-600">CVC</Label>
                                            <div className="relative">
                                                <Input id="cvc" placeholder="123" className="h-9 pl-8 text-sm bg-zinc-50 border-zinc-200" />
                                                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="cardName" className="text-xs text-zinc-600">Cardholder Name</Label>
                                        <Input id="cardName" placeholder="Name on card" className="h-9 text-sm bg-zinc-50 border-zinc-200" />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* NETBANKING */}
                            <TabsContent value="netbanking" className="mt-0">
                                <div className="space-y-4 py-4">
                                    <Label className="text-xs text-zinc-600">Popular Banks</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['HDFC', 'SBI', 'ICICI', 'Axis'].map(bank => (
                                            <Button key={bank} variant="outline" className="h-10 text-xs justify-start px-3 bg-zinc-50 border-zinc-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                                                <Building2 className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                                                {bank} Phone
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="text-center">
                                        <Select>
                                            <SelectTrigger className="h-9 w-full text-xs">
                                                <SelectValue placeholder="Other Banks" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kotak">Kotak Mahindra</SelectItem>
                                                <SelectItem value="yes">Yes Bank</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* UPI */}
                            <TabsContent value="upi" className="mt-0 py-4">
                                <Label className="text-xs text-zinc-600 mb-1.5 block">Enter UPI ID</Label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <Input placeholder="username@upi" className="h-9 pl-9 text-sm" />
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    </div>
                                    <Button size="sm" variant="secondary" className="h-9">Verify</Button>
                                </div>
                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-[10px] text-indigo-700 leading-tight">
                                    Open your UPI app to approve the payment request of {plan.currency}{plan.price}.
                                </div>
                            </TabsContent>

                            {/* PayPal */}
                            <TabsContent value="paypal" className="mt-0 flex flex-col items-center justify-center py-8 space-y-3 text-center">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-900">PayPal Secure Checkout</h4>
                                    <p className="text-xs text-zinc-500">You will be redirected to PayPal.</p>
                                </div>
                            </TabsContent>

                            {/* NEFT */}
                            <TabsContent value="neft" className="mt-0 space-y-3">
                                <div className="text-xs bg-zinc-50 p-3 rounded border border-zinc-100 space-y-1">
                                    <div className="flex justify-between"><span className="text-zinc-500">Acc No:</span> <span className="font-mono">1234567890</span></div>
                                    <div className="flex justify-between"><span className="text-zinc-500">IFSC:</span> <span className="font-mono">HDFC000123</span></div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-zinc-600">UTR Number</Label>
                                    <Input placeholder="Transaction Ref No." className="h-9 text-sm" />
                                </div>
                            </TabsContent>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-100">
                            <Button
                                size="sm"
                                className="w-full h-10 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                onClick={handlePayment}
                                disabled={isLoading || !user}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay ${plan.currency}${plan.price}`
                                )}
                            </Button>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

// ...
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    return (
        <React.Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        }>
            <CheckoutContent />
        </React.Suspense>
    );
}
