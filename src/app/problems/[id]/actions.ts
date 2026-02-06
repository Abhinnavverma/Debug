'use server';

import {
  analyzeCandidateSkills,
  type AnalyzeCandidateSkillsOutput,
} from '@/ai/flows/analyze-candidate-debug-skills';
import type { Problem } from '@/lib/data';
import { z } from 'zod';

const formSchema = z.object({
  diagnosis: z.string().min(10, { message: 'Diagnosis must be at least 10 characters.' }),
  nextSteps: z.string().min(10, { message: 'Next steps must be at least 10 characters.' }),
});

export type FormState = {
  feedback?: AnalyzeCandidateSkillsOutput;
  error?: string;
  fieldErrors?: {
    diagnosis?: string[];
    nextSteps?: string[];
  }
};

export async function getFeedback(
  problem: Problem,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    diagnosis: formData.get('diagnosis'),
    nextSteps: formData.get('nextSteps'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Please correct the errors in the form.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { diagnosis, nextSteps } = validatedFields.data;
  const interactionData = formData.get('interactionData') as string || '{}';

  try {
    const feedback = await analyzeCandidateSkills({
      problemDescription: problem.description,
      evaluationRubric: problem.evaluationRubric,
      diagnosis,
      nextSteps,
      interactionData,
    });
    return { feedback };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get feedback from AI. Please try again.' };
  }
}
