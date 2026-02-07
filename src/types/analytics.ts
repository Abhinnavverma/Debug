import { AnalyzeCandidateSkillsOutput } from "@/ai/flows/analyze-candidate-debug-skills";

export type PreAttemptData = {
  background: 'LeetCode/CP-heavy' | 'Backend/Systems' | 'Fullstack' | 'Student';
  experience: '0-1' | '1-3' | '3+';
  prodExperience: 'Yes' | 'No';
};

export type Attempt = PreAttemptData & {
  problemId: string;
  totalTimeSpent: number; // in seconds
  feedback: AnalyzeCandidateSkillsOutput;
  createdAt: string; // ISO string
};
