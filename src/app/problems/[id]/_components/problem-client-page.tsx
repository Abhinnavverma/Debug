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
import { useFormStatus } from 'react-dom';
import { getFeedback, type FormState } from '../actions';
import { useActionState, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  FileCode,
  Lightbulb,
  Milestone,
  GaugeCircle,
  LocateFixed,
  Signal,
  ListChecks,
  Rocket,
  Info,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PreAttemptDialog } from './PreAttemptDialog';
import type { PreAttemptData } from '@/types/analytics';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Analyzing...' : 'Analyze Debugging Reasoning'}
    </Button>
  );
}

function Scorecard({
  score,
  title,
  icon: Icon,
}: {
  score: number;
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h4 className="font-medium">{title}</h4>
        <span className="ml-auto font-semibold">{score}/10</span>
      </div>
      <Progress value={score * 10} />
    </div>
  );
}

export function ProblemClientPage({ problem }: { problem: Problem }) {
  const initialState: FormState = { feedback: undefined, error: undefined, fieldErrors: {} };
  const getFeedbackWithProblem = getFeedback.bind(null, problem);
  const [state, formAction] = useActionState(getFeedbackWithProblem, initialState);

  const { toast } = useToast();
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPreAttemptDialogOpen, setIsPreAttemptDialogOpen] = useState(true);
  const [preAttemptData, setPreAttemptData] = useState<PreAttemptData | null>(null);

  // Interaction tracking state
  const startTimeRef = useRef(Date.now());
  const [tabChanges, setTabChanges] = useState<{ tab: string; timestamp: number }[]>([]);
  const diagnosisRevisionsRef = useRef(0);
  const nextStepsRevisionsRef = useRef(0);

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, state.fieldErrors, toast]);
  
  const handleTabChange = (tab: string) => {
    setTabChanges(prev => [...prev, { tab, timestamp: Date.now() }]);
  };

  const handleDiagnosisChange = () => {
    diagnosisRevisionsRef.current += 1;
  };

  const handleNextStepsChange = () => {
    nextStepsRevisionsRef.current += 1;
  };
  
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const end = Date.now();
    const events = [
      { tab: problem.logs[0].service, timestamp: startTimeRef.current },
      ...tabChanges,
      { tab: 'submit', timestamp: end }
    ];

    let totalTimeSpent = (end - startTimeRef.current) / 1000;

    const timeSpentPerSection: { [key: string]: number } = {};
    for (let i = 0; i < events.length - 1; i++) {
        const currentEvent = events[i];
        const nextEvent = events[i+1];
        const duration = (nextEvent.timestamp - currentEvent.timestamp) / 1000;
        if (currentEvent.tab !== 'submit') {
          timeSpentPerSection[currentEvent.tab] = (timeSpentPerSection[currentEvent.tab] || 0) + duration;
        }
    }

    const navigationOrder = events.map(e => e.tab).slice(0, -1);

    const interactionData = {
        timeSpentPerSection,
        navigationOrder,
        highlights: [], // This feature is not implemented on the client yet
        answerRevisions: diagnosisRevisionsRef.current + nextStepsRevisionsRef.current,
        missedSignals: [], // This feature is not implemented on the client yet
    };

    (e.currentTarget.elements.namedItem('interactionData') as HTMLInputElement).value = JSON.stringify(interactionData);
    (e.currentTarget.elements.namedItem('totalTimeSpent') as HTMLInputElement).value = totalTimeSpent.toString();

    if (preAttemptData) {
        (e.currentTarget.elements.namedItem('background') as HTMLInputElement).value = preAttemptData.background;
        (e.currentTarget.elements.namedItem('experience') as HTMLInputElement).value = preAttemptData.experience;
        (e.currentTarget.elements.namedItem('prodExperience') as HTMLInputElement).value = preAttemptData.prodExperience;
    }
  };

  const verdictColor =
    state.feedback?.verdict === 'Ready to Ship Independently'
      ? 'text-green-600'
      : state.feedback?.verdict === 'Requires Support'
      ? 'text-amber-600'
      : 'text-red-600';


  return (
    <>
    <PreAttemptDialog
        isOpen={isPreAttemptDialogOpen}
        onClose={() => setIsPreAttemptDialogOpen(false)}
        onSubmit={(data) => {
          setPreAttemptData(data);
          setIsPreAttemptDialogOpen(false);
          startTimeRef.current = Date.now(); // Start timer after form submission
        }}
      />
    <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 py-8", {
        'blur-sm pointer-events-none': isPreAttemptDialogOpen,
      })}>
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
              <Tabs defaultValue={problem.logs[0].service} onValueChange={handleTabChange}>
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
            <form action={formAction} onSubmit={onFormSubmit}>
              <CardContent className="space-y-4">
                <input type="hidden" name="interactionData" />
                <input type="hidden" name="totalTimeSpent" />
                <input type="hidden" name="background" />
                <input type="hidden" name="experience" />
                <input type="hidden" name="prodExperience" />

                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium mb-1">Your Diagnosis</label>
                  <Textarea id="diagnosis" name="diagnosis" rows={4} placeholder="e.g., The latency appears to be caused by..." onChange={handleDiagnosisChange} />
                  {state.fieldErrors?.diagnosis && <p className="text-sm text-destructive mt-1">{state.fieldErrors.diagnosis[0]}</p>}
                </div>
                <div>
                  <label htmlFor="nextSteps" className="block text-sm font-medium mb-1">Proposed Next Steps</label>
                  <Textarea id="nextSteps" name="nextSteps" rows={4} placeholder="e.g., First, I would check the database query performance..." onChange={handleNextStepsChange}/>
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
                <CardTitle className="flex items-center gap-2">
                  <GaugeCircle /> AI Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Shipping Readiness Score
                  </h3>
                  <div className="relative">
                    <p className="text-7xl font-bold">
                      {state.feedback.shippingReadinessScore}
                    </p>
                  </div>
                  <p className={cn('text-xl font-semibold', verdictColor)}>
                    {state.feedback.verdict}
                  </p>
                </div>
                <div className="space-y-6">
                  <Scorecard
                    score={state.feedback.scorecard.investigativeEngagement}
                    title="Investigative Engagement"
                    icon={LocateFixed}
                  />
                  <Scorecard
                    score={state.feedback.scorecard.signalDetection}
                    title="Signal Detection"
                    icon={Signal}
                  />
                  <Scorecard
                    score={state.feedback.scorecard.hypothesisFormation}
                    title="Hypothesis Formation"
                    icon={Lightbulb}
                  />
                  <Scorecard
                    score={state.feedback.scorecard.debuggingDiscipline}
                    title="Debugging Discipline"
                    icon={ListChecks}
                  />
                  <Scorecard
                    score={state.feedback.scorecard.decisionReadiness}
                    title="Decision Readiness"
                    icon={Rocket}
                  />
                </div>
              </CardContent>
              <CardFooter className='flex-col items-start gap-4'>
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="justification">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Analysis Justification</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {state.feedback.justification}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Separator />
                <Button onClick={() => setShowExplanation(true)} disabled={showExplanation}>
                  <Milestone className="mr-2" />
                  Unlock Official Explanation
                </Button>
              </CardFooter>
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
    </>
  );
}
