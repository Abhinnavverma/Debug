'use server';

/**
 * @fileOverview Analyzes learner interaction data and provides personalized feedback.
 *
 * - provideLearnerDebuggingFeedback - A function that analyzes debugging interaction data and provides feedback.
 * - LearnerDebuggingFeedbackInput - The input type for the provideLearnerDebuggingFeedback function.
 * - LearnerDebuggingFeedbackOutput - The return type for the provideLearnerDebuggingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearnerDebuggingFeedbackInputSchema = z.object({
  interactionData: z
    .string()
    .describe(
      'A string containing the learner interaction data, including time spent per log section, navigation order, log highlights, answer revisions, and missed signals.'
    ),
  problemDescription: z.string().describe('A description of the debugging problem.'),
  diagnosis: z.string().describe('The learner diagnosis of the problem.'),
  nextSteps: z.string().describe('The next steps proposed by the learner.'),
});
export type LearnerDebuggingFeedbackInput = z.infer<
  typeof LearnerDebuggingFeedbackInputSchema
>;

const LearnerDebuggingFeedbackOutputSchema = z.object({
  strengths: z.string().describe('Highlights of the learner’s strengths.'),
  areasForImprovement: z
    .string()
    .describe('Areas where the learner can improve their debugging skills.'),
  blindSpots: z.string().describe('Potential blind spots the learner may have.'),
  overallFeedback: z.string().describe('Overall feedback on the learner debugging performance'),
});
export type LearnerDebuggingFeedbackOutput = z.infer<
  typeof LearnerDebuggingFeedbackOutputSchema
>;

export async function provideLearnerDebuggingFeedback(
  input: LearnerDebuggingFeedbackInput
): Promise<LearnerDebuggingFeedbackOutput> {
  return provideLearnerDebuggingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learnerDebuggingFeedbackPrompt',
  input: {schema: LearnerDebuggingFeedbackInputSchema},
  output: {schema: LearnerDebuggingFeedbackOutputSchema},
  prompt: `You are an expert AI debugging coach. Your goal is to analyze a learner's debugging process, not just their final answer. You will be given a description of the problem, the learner's diagnosis and proposed next steps, and a detailed log of their interactions with the debugging environment.

Use all of this information to provide personalized feedback.

**Problem Description**: {{{problemDescription}}}

**Learner's Diagnosis**: {{{diagnosis}}}

**Learner's Proposed Next Steps**: {{{nextSteps}}}

**Learner's Interaction Telemetry**: {{{interactionData}}}
The interaction data is a JSON object containing the following fields:
- \`timeSpentPerSection\`: Time in seconds spent on each log tab.
- \`navigationOrder\`: The sequence of tabs the learner visited.
- \`logHighlights\`: Portions of logs the learner highlighted.
- \`answerRevisions\`: The number of times the diagnosis and next steps were edited.
- \`missedSignals\`: Critical log lines that were not highlighted or investigated.

**Your Task**:
Analyze the learner's reasoning and methodology based on the telemetry.

Provide feedback in the following format:

**Strengths**: What did the learner do well? Did they follow a logical path? Did they correctly identify key signals?

**Areas for Improvement**: Where could their process be more efficient? Did they jump to conclusions? Did they spend too much time on irrelevant logs (based on \`timeSpentPerSection\`)? Mention specific investigative steps they missed.

**Blind Spots**: What critical information did the learner ignore or misinterpret? Use the \`navigationOrder\` and \`missedSignals\` to identify logs they didn't check or signals they overlooked.

**Overall Feedback**: A summary of their debugging judgment and whether their approach was systematic or haphazard.
`,
});

const provideLearnerDebuggingFeedbackFlow = ai.defineFlow(
  {
    name: 'provideLearnerDebuggingFeedbackFlow',
    inputSchema: LearnerDebuggingFeedbackInputSchema,
    outputSchema: LearnerDebuggingFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
