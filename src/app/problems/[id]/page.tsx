import { problems } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProblemClientPage } from './_components/problem-client-page';

export async function generateStaticParams() {
  return problems.map((problem) => ({
    id: problem.id,
  }));
}

export default function ProblemPage({ params }: { params: { id: string } }) {
  const problem = problems.find((p) => p.id === params.id);

  if (!problem) {
    notFound();
  }

  return <ProblemClientPage problem={problem} />;
}
