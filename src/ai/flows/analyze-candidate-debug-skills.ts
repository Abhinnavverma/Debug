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
  prompt: `You are an expert AI analyst for a technical recruiting firm. Your task is to generate a concise, data-driven report on a candidate's debugging performance for a hiring manager.

You will be given the candidate's interaction telemetry, the problem description, and the official evaluation rubric.

**Candidate Interaction Telemetry**: {{{interactionData}}}
This JSON object contains:
- \`timeSpentPerSection\`: Time in seconds spent on each log tab.
- \`navigationOrder\`: The sequence of tabs the candidate visited.
- \`hesitationPoints\`: Not implemented yet, ignore.
- \`logHighlights\`: Portions of logs the candidate highlighted as important.
- \`answerRevisions\`: The number of times the candidate edited their diagnosis.

**Problem Description**: {{{problemDescription}}}

**Evaluation Rubric**: {{{evaluationRubric}}}

**Your Task**:
Generate a recruiter-ready report summarizing the candidate's performance. Focus on behavioral signals from the telemetry data. Do not provide code solutions.

The report should include the following sections:

**1. Root-Cause Accuracy:** Based on their final diagnosis, how accurately did they identify the core issue as described in the rubric?

**2. Debugging Judgment & Efficiency:**
- Analyze their \`navigationOrder\` and \`timeSpentPerSection\`. Was their investigation logical and efficient, or did they waste time on irrelevant services?
- How well did they distinguish signal from noise? Compare their \`logHighlights\` to the key signals in the rubric.

**3. Behavioral Patterns:**
- What does their interaction pattern suggest? (e.g., "Systematic and methodical", "Relies on brute-force checks", "Quick to form a hypothesis, but re-evaluates based on new data").
- Use \`answerRevisions\` to comment on their confidence and adaptability.

**4. Identified Blind Spots:** What critical information or service logs did the candidate fail to investigate or connect?

**5. Overall Recommendation (1-2 sentences):** A concise summary of the candidate's debugging skill level for a recruiter.`,
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
