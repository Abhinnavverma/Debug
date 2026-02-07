'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { PreAttemptData } from '@/types/analytics';

interface PreAttemptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PreAttemptData) => void;
}

export function PreAttemptDialog({ isOpen, onClose, onSubmit }: PreAttemptDialogProps) {
  const [background, setBackground] = useState<PreAttemptData['background'] | ''>('');
  const [experience, setExperience] = useState<PreAttemptData['experience'] | ''>('');
  const [prodExperience, setProdExperience] = useState<PreAttemptData['prodExperience'] | ''>('');
  
  const canSubmit = background && experience && prodExperience;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({ background, experience, prodExperience });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Before you start...</DialogTitle>
          <DialogDescription>
            Help us with our research by answering a few quick questions about your background.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label>What's your primary background?</Label>
            <RadioGroup value={background} onValueChange={(value) => setBackground(value as PreAttemptData['background'])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LeetCode/CP-heavy" id="bg-cp" />
                <Label htmlFor="bg-cp">LeetCode/CP-heavy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Backend/Systems" id="bg-backend" />
                <Label htmlFor="bg-backend">Backend/Systems</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Fullstack" id="bg-fullstack" />
                <Label htmlFor="bg-fullstack">Fullstack</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Student" id="bg-student" />
                <Label htmlFor="bg-student">Student</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label>Years of professional experience?</Label>
            <RadioGroup value={experience} onValueChange={(value) => setExperience(value as PreAttemptData['experience'])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-1" id="exp-0-1" />
                <Label htmlFor="exp-0-1">0 - 1 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-3" id="exp-1-3" />
                <Label htmlFor="exp-1-3">1 - 3 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3+" id="exp-3+" />
                <Label htmlFor="exp-3+">3+ years</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label>Prior production debugging experience?</Label>
            <RadioGroup value={prodExperience} onValueChange={(value) => setProdExperience(value as PreAttemptData['prodExperience'])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="prod-yes" />
                <Label htmlFor="prod-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="prod-no" />
                <Label htmlFor="prod-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Start Challenge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
