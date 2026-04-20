export const PRICING_TIERS = {
    STARTER: {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 9,
        maxUsers: 3,
        features: ['Basic Sprints', 'Simple Retrospectives']
    },
    TEAM: {
        id: 'team',
        name: 'Team',
        priceMonthly: 29,
        maxUsers: 20,
        features: ['Everything in Starter', 'Advanced Analytics', 'RBAC']
    },
    BUSINESS: {
        id: 'business',
        name: 'Business',
        priceMonthly: 79,
        maxUsers: 100,
        features: ['Everything in Team', 'Custom Workflows', 'Audit Logs']
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        priceMonthly: null, // Custom pricing
        maxUsers: Infinity,
        features: ['Unlimited everything', 'Dedicated success manager', 'SSO']
    }
};
