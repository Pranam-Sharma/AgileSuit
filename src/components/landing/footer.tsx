import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

const footerNav = [
  {
    category: 'Product',
    links: [
      { label: 'Solutions', href: '#solutions' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Resources', href: '#resources' },
    ],
  },
  {
    category: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    category: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Logo className="text-white" />
            <p className="text-sm text-gray-400">
              The operating system for Agile teams. Plan, track, and improve with ease.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="text-gray-400 hover:text-white">
                  <span className="sr-only">{social.label}</span>
                  <social.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">{footerNav[0].category}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNav[0].links.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="text-sm leading-6 text-gray-400 hover:text-white">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">{footerNav[1].category}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNav[1].links.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="text-sm leading-6 text-gray-400 hover:text-white">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">{footerNav[2].category}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNav[2].links.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="text-sm leading-6 text-gray-400 hover:text-white">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Subscribe to our newsletter</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  The latest news, articles, and resources, sent to your inbox weekly.
                </p>
                <form className="mt-6 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:w-64 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                  <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                    <Button type="submit" className="w-full">
                      Subscribe
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">&copy; {new Date().getFullYear()} AgileSuit, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
