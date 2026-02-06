'use server';

/**
 * @fileOverview Analyzes candidate debugging interaction data and generates a metric-driven scorecard.
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
      'A stringified JSON object containing the candidate interaction data during the debugging session, including time spent per log section, navigation order, and answer revisions.'
    ),
  problemDescription: z.string().describe('A description of the debugging problem.'),
  evaluationRubric: z.string().describe('The evaluation rubric for the debugging problem.'),
  diagnosis: z.string().describe("The candidate's final diagnosis of the root cause."),
  nextSteps: z.string().describe("The candidate's proposed next steps to fix the issue."),
});
export type AnalyzeCandidateSkillsInput = z.infer<typeof AnalyzeCandidateSkillsInputSchema>;

const ScorecardSchema = z.object({
  investigativeEngagement: z
    .number()
    .min(0)
    .max(10)
    .describe(
      'Score (0-10) for how thoroughly the candidate explored different logs and data sources. High scores for checking relevant logs, low scores for ignoring key services.'
    ),
  signalDetection: z
    .number()
    .min(0)
    .max(10)
    .describe(
      'Score (0-10) for the ability to identify critical signals (key error messages, warnings) amidst noise. Penalize for getting distracted by red herrings.'
    ),
  hypothesisFormation: z
    .number()
    .min(0)
    .max(10)
    .describe(
      'Score (0-10) for the speed and quality of forming a diagnosis based on evidence. Higher scores for accuracy and connecting multiple data points.'
    ),
  debuggingDiscipline: z
    .number()
    .min(0)
    .max(10)
    .describe(
      'Score (0-10) for the systematic and methodical nature of the investigation. Analyze navigationOrder and timeSpentPerSection. Random clicking gets a low score.'
    ),
  decisionReadiness: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Score (0-10) for the confidence and correctness of the proposed next steps. Do their next steps logically follow from their diagnosis?"
    ),
});

const AnalyzeCandidateSkillsOutputSchema = z.object({
  scorecard: ScorecardSchema,
  shippingReadinessScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'A weighted composite score (0-100) indicating overall readiness. Calculated as: (InvestigativeEngagement * 0.15) + (SignalDetection * 0.3) + (HypothesisFormation * 0.25) + (DebuggingDiscipline * 0.15) + (DecisionReadiness * 0.15). The result is then multiplied by 10.'
    ),
  verdict: z
    .enum(['Ready to Ship Independently', 'Requires Support', 'Not Ready for Production Work'])
    .describe(
      'A clear, final recommendation based on the shippingReadinessScore: >75 is Ready, 40-75 is Requires Support, <40 is Not Ready.'
    ),
  justification: z
    .string()
    .describe(
      'A concise, evidence-based justification for the scores, referencing specific telemetry data like navigation order, time spent, and comparing diagnosis to the rubric.'
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
  prompt: `You are an expert AI analyst for a tech company, tasked with creating a metric-driven scorecard for an engineering candidate's debugging performance.

**Your Goal:** Generate a numerical scorecard and a concise justification based on the provided data. Do NOT write long paragraphs. Be quantitative and base your analysis on the telemetry.

**Candidate Interaction Telemetry**: {{{interactionData}}}
- \`timeSpentPerSection\`: Time in seconds on each log tab.
- \`navigationOrder\`: Sequence of tabs visited.
- \`answerRevisions\`: Number of times the diagnosis/plan was edited.

**Problem Description**: {{{problemDescription}}}
**Evaluation Rubric**: {{{evaluationRubric}}}
**Candidate's Diagnosis**: {{{diagnosis}}}
**Candidate's Next Steps**: {{{nextSteps}}}

**Analysis Instructions:**

1.  **Generate Scores (0-10):**
    *   **Investigative Engagement:** Did they check the right logs? Compare \`navigationOrder\` to the services mentioned in the rubric.
    *   **Signal Detection:** Did they find the key error message? The rubric states the critical signal. How long did it take them to find it based on \`timeSpentPerSection\` in the relevant log?
    *   **Hypothesis Formation:** How accurate was their \`diagnosis\` compared to the rubric?
    *   **Debugging Discipline:** Was their \`navigationOrder\` logical or random? Did they waste time on irrelevant services?
    *   **Decision Readiness:** Do their \`nextSteps\` logically follow from their diagnosis and address the root cause from the rubric?

2.  **Calculate Shipping Readiness Score (0-100):**
    *   Use the formula: \`((InvestigativeEngagement * 0.15) + (SignalDetection * 0.3) + (HypothesisFormation * 0.25) + (DebuggingDiscipline * 0.15) + (DecisionReadiness * 0.15)) * 10\`.
    *   Round to the nearest whole number.

3.  **Determine Verdict:**
    *   **> 75:** "Ready to Ship Independently"
    *   **40-75:** "Requires Support"
    *   **< 40:** "Not Ready for Production Work"

4.  **Write Justification:**
    *   Provide a **brief** (2-3 sentences) justification for the scores.
    *   Reference specific data points, e.g., "Wasted 80% of time in the wrong service," or "Immediately identified the 'index' warning in user-database logs."

**Output Format:** Strictly adhere to the JSON schema for the scorecard, readiness score, verdict, and justification.`,
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
