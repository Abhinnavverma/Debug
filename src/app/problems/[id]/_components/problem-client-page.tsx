'use client';

import type { Problem } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFormState, useFormStatus } from 'react-dom';
import { getFeedback, type FormState } from '../actions';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FileCode, Lightbulb, AlertTriangle, BrainCircuit, CheckCircle, Milestone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Analyzing...' : 'Get AI Feedback'}
    </Button>
  );
}

export function ProblemClientPage({ problem }: { problem: Problem }) {
  const initialState: FormState = { feedback: undefined, error: undefined, fieldErrors: {} };
  const getFeedbackWithProblem = getFeedback.bind(null, problem);
  const [state, formAction] = useFormState(getFeedbackWithProblem, initialState);

  const { toast } = useToast();
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, state.fieldErrors, toast]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-1 mb-8 lg:mb-0">
          <Card className="sticky top-24 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">{problem.title}</CardTitle>
              <CardDescription className="pt-2">{problem.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">System Overview</h3>
              <p className="text-sm text-muted-foreground">{problem.systemOverview}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileCode /> Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={problem.logs[0].service}>
                <TabsList>
                  {problem.logs.map((log) => (
                    <TabsTrigger key={log.service} value={log.service}>
                      {log.service}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {problem.logs.map((log) => (
                  <TabsContent key={log.service} value={log.service}>
                    <pre className="bg-muted p-4 rounded-lg text-sm text-muted-foreground overflow-auto max-h-[400px]">
                      <code>{log.content}</code>
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-8 shadow-md">
            <CardHeader>
              <CardTitle>Diagnosis & Plan</CardTitle>
              <CardDescription>
                Based on the logs, what do you think the root cause is, and what are your proposed next steps?
              </CardDescription>
            </CardHeader>
            <form action={formAction}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium mb-1">Your Diagnosis</label>
                  <Textarea id="diagnosis" name="diagnosis" rows={4} placeholder="e.g., The latency appears to be caused by..." />
                  {state.fieldErrors?.diagnosis && <p className="text-sm text-destructive mt-1">{state.fieldErrors.diagnosis[0]}</p>}
                </div>
                <div>
                  <label htmlFor="nextSteps" className="block text-sm font-medium mb-1">Proposed Next Steps</label>
                  <Textarea id="nextSteps" name="nextSteps" rows={4} placeholder="e.g., First, I would check the database query performance..." />
                  {state.fieldErrors?.nextSteps && <p className="text-sm text-destructive mt-1">{state.fieldErrors.nextSteps[0]}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          </Card>

          {state.feedback && (
            <Card className="mt-8 bg-gradient-to-br from-card to-secondary/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI Feedback Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={['overall', 'strengths', 'improvement', 'blind-spots']} className="w-full">
                  <AccordionItem value="overall">
                    <AccordionTrigger className='font-semibold'>Overall Feedback</AccordionTrigger>
                    <AccordionContent>{state.feedback.overallFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="strengths">
                    <AccordionTrigger className='font-semibold text-green-600'><CheckCircle className="mr-2"/>Strengths</AccordionTrigger>
                    <AccordionContent>{state.feedback.strengths}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="improvement">
                    <AccordionTrigger className='font-semibold text-amber-600'><AlertTriangle className="mr-2"/>Areas for Improvement</AccordionTrigger>
                    <AccordionContent>{state.feedback.areasForImprovement}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="blind-spots">
                    <AccordionTrigger className='font-semibold text-red-600'><AlertTriangle className="mr-2"/>Blind Spots</AccordionTrigger>
                    <AccordionContent>{state.feedback.blindSpots}</AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Separator className="my-6" />
                <Button onClick={() => setShowExplanation(true)} disabled={showExplanation}>
                  <Lightbulb className="mr-2" />
                  Unlock Official Explanation
                </Button>
              </CardContent>
            </Card>
          )}

          {showExplanation && (
             <Card className="mt-8 border-accent shadow-accent/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-accent flex items-center gap-2"><Milestone /> Official Explanation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Correct Reasoning</h3>
                        <p className="text-muted-foreground">{problem.explanation.reasoning}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Red Herrings</h3>
                        <p className="text-muted-foreground">{problem.explanation.redHerrings}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Senior-Level Intuition</h3>
                        <p className="text-muted-foreground">{problem.explanation.seniorIntuition}</p>
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
