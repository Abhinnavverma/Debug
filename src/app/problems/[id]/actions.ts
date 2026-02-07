'use server';

import {
  analyzeCandidateSkills,
  type AnalyzeCandidateSkillsOutput,
} from '@/ai/flows/analyze-candidate-debug-skills';
import {
  provideLearnerDebuggingFeedback,
  type LearnerDebuggingFeedbackOutput,
} from '@/ai/flows/provide-learner-debugging-feedback';
import type { Problem } from '@/lib/data';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import type { Attempt, PreAttemptData } from '@/types/analytics';

const formSchema = z.object({
  diagnosis: z.string().min(10, { message: 'Diagnosis must be at least 10 characters.' }),
  nextSteps: z.string().min(10, { message: 'Next steps must be at least 10 characters.' }),
});

export type FormState = {
  feedback?: AnalyzeCandidateSkillsOutput;
  learnerFeedback?: LearnerDebuggingFeedbackOutput;
  error?: string;
  fieldErrors?: {
    diagnosis?: string[];
    nextSteps?: string[];
  }
};

async function saveAttempt(attemptData: Omit<Attempt, 'createdAt'>) {
  const attempt: Attempt = {
    ...attemptData,
    createdAt: new Date().toISOString(),
  };

  try {
    await db.collection('attempts').add(attempt);
  } catch (error) {
    console.error('Failed to save attempt to Firestore:', error);
  }
}


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
  const totalTimeSpent = Number(formData.get('totalTimeSpent'));

  const preAttemptData: PreAttemptData = {
    background: formData.get('background') as PreAttemptData['background'],
    experience: formData.get('experience') as PreAttemptData['experience'],
    prodExperience: formData.get('prodExperience') as PreAttemptData['prodExperience'],
  }

  try {
    const [feedback, learnerFeedback] = await Promise.all([
      analyzeCandidateSkills({
        problemDescription: problem.description,
        evaluationRubric: problem.evaluationRubric,
        diagnosis,
        nextSteps,
        interactionData,
      }),
      provideLearnerDebuggingFeedback({
        problemDescription: problem.description,
        diagnosis,
        nextSteps,
        interactionData,
      }),
    ]);

    // Save analytics data — properly awaited so no data is silently lost
    await saveAttempt({
      problemId: problem.id,
      ...preAttemptData,
      totalTimeSpent,
      feedback,
    });

    return { feedback, learnerFeedback };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get feedback from AI. Please try again.' };
  }
}
