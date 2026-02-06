'use server';

import {
  provideLearnerDebuggingFeedback,
  type LearnerDebuggingFeedbackOutput,
} from '@/ai/flows/provide-learner-debugging-feedback';
import type { Problem } from '@/lib/data';
import { z } from 'zod';

const formSchema = z.object({
  diagnosis: z.string().min(10, { message: 'Diagnosis must be at least 10 characters.' }),
  nextSteps: z.string().min(10, { message: 'Next steps must be at least 10 characters.' }),
});

export type FormState = {
  feedback?: LearnerDebuggingFeedbackOutput;
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
    const feedback = await provideLearnerDebuggingFeedback({
      problemDescription: problem.description,
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
