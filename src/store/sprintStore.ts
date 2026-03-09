import { create } from 'zustand';
import type { Sprint } from '@/types/sprint';

interface SprintState {
    activeSprint: Sprint | null;
    sprints: Sprint[];
    isLoading: boolean;
    setActiveSprint: (sprint: Sprint | null) => void;
    setSprints: (sprints: Sprint[]) => void;
}

export const useSprintStore = create<SprintState>((set) => ({
    activeSprint: null,
    sprints: [],
    isLoading: false,
    setActiveSprint: (sprint) => set({ activeSprint: sprint }),
    setSprints: (sprints) => set({ sprints }),
}));
