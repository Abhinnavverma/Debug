'use server';

import {
  analyzeCandidateSkills,
  type AnalyzeCandidateSkillsOutput,
} from '@/ai/flows/analyze-candidate-debug-skills';
import type { Problem } from '@/lib/data';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import type { Attempt, PreAttemptData } from '@/types/analytics';

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

async function saveAttempt(attemptData: Omit<Attempt, 'createdAt'>) {
    const attempt: Attempt = {
        ...attemptData,
        createdAt: new Date().toISOString()
    };

    try {
        const filePath = path.join(process.cwd(), 'src/lib/analytics-data.json');
        let attempts: Attempt[] = [];
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            attempts = JSON.parse(data);
        } catch (readError) {
            // File might not exist yet, which is fine.
            if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.error('Failed to read analytics data file:', readError);
            }
        }
        
        attempts.push(attempt);

        await fs.writeFile(filePath, JSON.stringify(attempts, null, 2));

    } catch (error) {
        console.error('Failed to save attempt:', error);
        // We don't want to block the user feedback for a failed analytics save.
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
    const feedback = await analyzeCandidateSkills({
      problemDescription: problem.description,
      evaluationRubric: problem.evaluationRubric,
      diagnosis,
      nextSteps,
      interactionData,
    });
    
    // Save analytics data in the background, don't block response
    saveAttempt({
        problemId: problem.id,
        ...preAttemptData,
        totalTimeSpent,
        feedback,
    });

    return { feedback };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get feedback from AI. Please try again.' };
  }
}
