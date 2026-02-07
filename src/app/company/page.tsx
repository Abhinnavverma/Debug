import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

type Assessment = {
  title: string;
  problemIds: string[];
  mode: string;
  createdAt: string;
};

async function getAssessments(): Promise<{ id: string; data: Assessment }[]> {
  try {
    const snapshot = await db
      .collection('assessments')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as Assessment }));
  } catch {
    return [];
  }
}

export default async function CompanyDashboardPage() {
  const assessments = await getAssessments();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <Building className="h-16 w-16 mx-auto text-primary" />
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-foreground">
          Company Portal
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Create and manage debugging assessments for your candidates.
        </p>
      </div>

      <div className="mt-12 max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>
                {assessments.length === 0
                  ? 'Create your first assessment to get started.'
                  : `${assessments.length} assessment${assessments.length === 1 ? '' : 's'} created`}
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/company/create">
                <Plus className="mr-2 h-4 w-4" /> New
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.map(({ id, data }) => (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{data.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.problemIds.length} problem{data.problemIds.length === 1 ? '' : 's'} · Created {new Date(data.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{data.mode}</Badge>
              </div>
            ))}
            {assessments.length === 0 && (
              <Button asChild className="w-full" variant="outline">
                <Link href="/company/create">Create New Assessment</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
