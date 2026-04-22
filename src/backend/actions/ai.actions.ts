'use server';

import { ai } from '@/integrations/ai/genkit';
import { z } from 'zod';

/**
 * Parses a natural language command into a structured P0 story.
 * Example: "Inject P0: Payment gateway down" -> { title: "Payment gateway down", description: "Critical P0 issue identified via command palette." }
 */
export async function parseP0CommandAction(input: string) {
  try {
    const { output } = await ai.generate({
      prompt: `You are a technical product manager. Parse the following command into a high-impact P0 story title and a brief description.
      The command might start with "Inject P0:" or just be a description of a bug.
      
      Command: "${input}"
      
      Return a JSON object with:
      - title: A concise, professional title (CLEANED: remove any [MAJOR], P0, etc. tags from the user's input).
      - description: A short description of the issue.
      - priority: One of "low", "medium", "high", or "critical".
        - Map keywords (Case-insensitive):
          - "crash", "outage", "broken auth", "emergency", "fatal", "blocker", "p0", "p1" -> "critical".
          - "major", "broken feature", "p2", "high" -> "high".
          - "medium", "p3", "bug", "issue" -> "medium".
          - "typo", "color", "minor", "trivial", "low", "p4", "cosmetic" -> "low".
        - Map explicit tags anywhere in text:
          - [CRITICAL], [BLOCKER], P0, P1 -> "critical".
          - [MAJOR], [HIGH], P2 -> "high".
          - [MEDIUM], [BUG], P3 -> "medium".
          - [MINOR], [TRIVIAL], [LOW], [COSMETIC], P4 -> "low".
      - targetSprintName: If mentioned, extract it. Otherwise null.
      - targetSprintNumber: If mentioned, extract it. Otherwise null.
      - estimatedPoints: An integer estimate (1, 2, 3, 5, 8). 
        - CRITICAL: If the user explicitly mentions a point value (e.g., "5 points"), use it. Otherwise predict based on technical complexity.
      
      CRITICAL: A P0/Critical priority can still be a 1-point fix (e.g., a typo in a legal header). Base points ONLY on technical complexity unless specified.`,
      output: {
        schema: z.object({
          title: z.string(),
          description: z.string(),
          priority: z.enum(['low', 'medium', 'high', 'critical']),
          estimatedPoints: z.number().int(),
          targetSprintName: z.string().nullable(),
          targetSprintNumber: z.string().nullable(),
        }),
      },
    });

    return { success: true, data: output };
  } catch (error) {
    console.error('AI Parsing Error:', error);
    return { 
      success: false, 
      error: 'Failed to parse command',
      data: { 
        title: input.replace(/^Inject P0:\s*/i, ''), 
        description: 'Critical issue injected via command palette.',
        estimatedPoints: 5 
      } 
    };
  }
}

/**
 * Analyzes the current sprint load and recommends the best story to drop to the backlog.
 */
export async function getCapacitySwapRecommendationAction(stories: any[], newPoints: number, capacity: number) {
  try {
    // Filter out the stories that are already done or blocked if we want, 
    // but usually we want to drop something from the 'todo' or 'backlog' that was planned for this sprint.
    const candidates = stories.filter(s => s.status !== 'done');

    const { output } = await ai.generate({
      prompt: `The sprint is currently over capacity and a new P0 emergency has been injected.
      
      New P0 Load: ${newPoints} SP
      Sprint Capacity: ${capacity} SP
      Current Stories in Sprint: ${JSON.stringify(candidates.map(s => ({ id: s.id, title: s.title, priority: s.priority, points: s.story_points, status: s.status })))}
      
      Analyze the list and recommend ONE story to move back to the backlog to absorb the ${newPoints} SP impact.
      RULES:
      1. Never recommend dropping a 'critical' or 'high' priority story if 'medium' or 'low' ones exist.
      2. Prefer dropping stories with status 'todo' over 'in_progress'.
      3. Try to match the story points of the recommended drop to the new P0 points if possible.
      
      Return a JSON object with:
      - storyId: The ID of the recommended story.
      - reason: A short, punchy reason for the manager (e.g., "Lowest priority with matching point value").`,
      output: {
        schema: z.object({
          storyId: z.string(),
          reason: z.string(),
        }),
      },
    });

    return { success: true, recommendation: output };
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return { success: false, error: 'Failed to get recommendation' };
  }
}
