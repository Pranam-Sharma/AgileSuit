export interface Role {
    id: string;
    name: string;
    level: number;
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
    organizationId: string;
    teamIds: string[];
}
