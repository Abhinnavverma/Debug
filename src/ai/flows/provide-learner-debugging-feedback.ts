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
  prompt: `You are an AI debugging coach. Analyze the learner's interaction data, problem description, diagnosis, and next steps to provide personalized feedback.

Problem Description: {{{problemDescription}}}

Learner Diagnosis: {{{diagnosis}}}

Learner Next Steps: {{{nextSteps}}}

Interaction Data: {{{interactionData}}}

Provide feedback in the following format:

Strengths: Highlights of the learner’s strengths.

Areas for Improvement: Areas where the learner can improve their debugging skills.

Blind Spots: Potential blind spots the learner may have.

Overall Feedback: Overall feedback on the learner debugging performance.
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
