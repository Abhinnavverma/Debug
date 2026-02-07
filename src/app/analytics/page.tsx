import { db } from '@/lib/firebase-admin';
import type { Attempt } from '@/types/analytics';
import { AnalyticsDashboard } from './_components/analytics-dashboard';

export const dynamic = 'force-dynamic';

async function getAnalyticsData(): Promise<Attempt[]> {
  try {
    const snapshot = await db
      .collection('attempts')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => doc.data() as Attempt);
  } catch (error) {
    console.error('Failed to read analytics data from Firestore:', error);
    return [];
  }
}

export default async function AnalyticsPage() {
  const attempts = await getAnalyticsData();
  return <AnalyticsDashboard attempts={attempts} />;
}
