import { problems } from '@/lib/data';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-foreground">
            Debugging Practice & Assessment
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            Sharpen your debugging skills with realistic production scenarios.
            Built for both learners and hiring managers.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {problems.map((problem) => (
            <Card key={problem.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{problem.title}</CardTitle>
                <CardDescription className="pt-2 line-clamp-3 h-[72px]">{problem.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/problems/${problem.id}`}>
                    Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
