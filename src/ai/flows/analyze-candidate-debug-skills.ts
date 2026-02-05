'use server';

/**
 * @fileOverview Analyzes candidate debugging interaction data and generates a recruiter-ready report.
 *
 * - analyzeCandidateSkills - A function that analyzes candidate debugging skills.
 * - AnalyzeCandidateSkillsInput - The input type for the analyzeCandidateSkills function.
 * - AnalyzeCandidateSkillsOutput - The return type for the analyzeCandidateSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCandidateSkillsInputSchema = z.object({
  interactionData: z
    .string()
    .describe(
      'A stringified JSON object containing the candidate interaction data during the debugging session, including time spent per log section, navigation order, hesitation points, log highlights, answer revisions, and missed signals.'
    ),
  problemDescription: z.string().describe('A description of the debugging problem.'),
  evaluationRubric: z.string().describe('The evaluation rubric for the debugging problem.'),
});
export type AnalyzeCandidateSkillsInput = z.infer<typeof AnalyzeCandidateSkillsInputSchema>;

const AnalyzeCandidateSkillsOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A recruiter-ready report summarizing the candidate’s root-cause accuracy, debugging judgment, behavioral patterns, and blind spots.'
    ),
});
export type AnalyzeCandidateSkillsOutput = z.infer<typeof AnalyzeCandidateSkillsOutputSchema>;

export async function analyzeCandidateSkills(
  input: AnalyzeCandidateSkillsInput
): Promise<AnalyzeCandidateSkillsOutput> {
  return analyzeCandidateSkillsFlow(input);
}

const analyzeCandidateSkillsPrompt = ai.definePrompt({
  name: 'analyzeCandidateSkillsPrompt',
  input: {schema: AnalyzeCandidateSkillsInputSchema},
  output: {schema: AnalyzeCandidateSkillsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing candidate debugging skills based on their interaction data during a debugging session.

  Analyze the following interaction data, problem description, and evaluation rubric to generate a concise, recruiter-ready report.

  Interaction Data: {{{interactionData}}}
  Problem Description: {{{problemDescription}}}
  Evaluation Rubric: {{{evaluationRubric}}}

  The report should summarize the candidate’s:
  - Root-cause accuracy
  - Debugging judgment
  - Behavioral patterns (e.g., systematic vs. haphazard approach)
  - Blind spots (what the candidate failed to identify)

  Focus on actionable insights that would be valuable to a recruiter.`,
});

const analyzeCandidateSkillsFlow = ai.defineFlow(
  {
    name: 'analyzeCandidateSkillsFlow',
    inputSchema: AnalyzeCandidateSkillsInputSchema,
    outputSchema: AnalyzeCandidateSkillsOutputSchema,
  },
  async input => {
    const {output} = await analyzeCandidateSkillsPrompt(input);
    return output!;
  }
);
