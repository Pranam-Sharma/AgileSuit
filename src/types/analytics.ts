export interface SprintVelocity {
    sprintId: string;
    plannedPoints: number;
    completedPoints: number;
    carriedOverPoints: number;
}

export interface SprintHealth {
    sprintId: string;
    healthScore: number; // 0-100
    riskFactors: string[];
}
