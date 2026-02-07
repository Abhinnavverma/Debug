'use server';

import { db } from '@/lib/firebase-admin';

type CreateAssessmentInput = {
  title: string;
  problemIds: string[];
  mode: string;
};

export async function createAssessment(input: CreateAssessmentInput): Promise<{ id: string }> {
  const docRef = await db.collection('assessments').add({
    ...input,
    createdAt: new Date().toISOString(),
  });

  return { id: docRef.id };
}
