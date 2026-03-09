export interface Team {
    id: string;
    name: string;
    departmentId?: string;
    organizationId: string;
    memberCount: number;
}

export interface Department {
    id: string;
    name: string;
    organizationId: string;
    teamCount: number;
}
