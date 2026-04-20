export const APP_CONFIG = {
    name: 'AgileSuit',
    description: 'The operating system for Agile teams',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: 'support@agilesuit.com',
    auth: {
        sessionDurationDays: 7,
    }
};
