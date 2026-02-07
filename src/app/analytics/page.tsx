import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { promises as fs } from 'fs';
import path from 'path';
import type { Attempt } from '@/types/analytics';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';

async function getAnalyticsData(): Promise<Attempt[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/analytics-data.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const attempts = JSON.parse(data);
    // Sort by most recent first
    return attempts.sort((a: Attempt, b: Attempt) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to read analytics data:', error);
    return [];
  }
}

export default async function AnalyticsPage() {
  const attempts = await getAnalyticsData();

  const getVerdictVariant = (verdict: string) => {
    switch (verdict) {
      case 'Ready to Ship Independently':
        return 'default';
      case 'Requires Support':
        return 'secondary';
      case 'Not Ready for Production Work':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Experiment Analytics</CardTitle>
          <CardDescription className="flex items-center gap-2 pt-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            This page is for internal use only and should be protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Prod. Debug Exp.</TableHead>
                  <TableHead className="text-right">Readiness Score</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead className="text-right">Time (s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{attempt.problemId}</TableCell>
                    <TableCell>{attempt.background}</TableCell>
                    <TableCell>{attempt.experience} yrs</TableCell>
                    <TableCell>{attempt.prodExperience}</TableCell>
                    <TableCell className="text-right font-mono">{attempt.feedback.shippingReadinessScore}</TableCell>
                    <TableCell>
                      <Badge variant={getVerdictVariant(attempt.feedback.verdict)}>
                        {attempt.feedback.verdict}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{Math.round(attempt.totalTimeSpent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {attempts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No attempt data recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
