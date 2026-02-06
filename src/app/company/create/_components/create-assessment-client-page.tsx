'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { problems } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';

type SelectionMode = 'manual' | 'random';

export function CreateAssessmentClientPage() {
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('manual');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(1);
  const [tags, setTags] = useState('');

  const handleProblemToggle = (problemId: string, checked: boolean) => {
    setSelectedProblems((prev) =>
      checked ? [...prev, problemId] : prev.filter((id) => id !== problemId)
    );
  };
  
  const allTags = [...new Set(problems.flatMap(p => p.tags))];

  const handleSubmit = () => {
    // In a real app, this would save the assessment to a database
    // and redirect to the assessment page.
    console.log({
      title: assessmentTitle,
      mode: selectionMode,
      ...(selectionMode === 'manual' && { problems: selectedProblems }),
      ...(selectionMode === 'random' && {
        count: numQuestions,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    });
    // For now, we can just show an alert and stay on the page.
    alert('Assessment created! Check the console for details.');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Assessment</CardTitle>
          <CardDescription>
            Configure a new debugging challenge for your candidates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assessment-title">Assessment Title</Label>
            <Input
              id="assessment-title"
              placeholder="e.g., Backend Engineering Assessment"
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
            />
          </div>

          <Tabs
            value={selectionMode}
            onValueChange={(value) => setSelectionMode(value as SelectionMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Selection</TabsTrigger>
              <TabsTrigger value="random">Random Generation</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Problems</CardTitle>
                  <CardDescription>
                    Choose the specific problems you want to include.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {problems.map((problem) => (
                    <div key={problem.id} className="flex items-start space-x-3 rounded-md border p-4">
                      <Checkbox
                        id={`problem-${problem.id}`}
                        checked={selectedProblems.includes(problem.id)}
                        onCheckedChange={(checked) =>
                          handleProblemToggle(problem.id, !!checked)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`problem-${problem.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {problem.title}
                        </label>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="random" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Random Problems</CardTitle>
                  <CardDescription>
                    Define criteria to automatically generate a problem set.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="num-questions">Number of Questions</Label>
                    <Input
                      id="num-questions"
                      type="number"
                      min="1"
                      max={problems.length}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Filter by Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., database, performance"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                     <div className="text-xs text-muted-foreground pt-1">
                      Available tags: {allTags.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Create Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
