import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import Link from 'next/link';

export default function CompanyDashboardPage() {
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

      <div className="mt-12 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>
              Create a new assessment to evaluate candidates' debugging skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/company/create">Create New Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
