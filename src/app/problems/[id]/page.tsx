import { problems } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProblemClientPage } from './_components/problem-client-page';

export async function generateStaticParams() {
  return problems.map((problem) => ({
    id: problem.id,
  }));
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = problems.find((p) => p.id === id);

  if (!problem) {
    notFound();
  }

  return <ProblemClientPage problem={problem} />;
}
