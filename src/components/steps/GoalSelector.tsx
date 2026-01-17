"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DreamRole, DREAM_ROLES } from "@/lib/types";

interface GoalSelectorProps {
  selectedGoal: DreamRole | null;
  onSelectGoal: (goal: DreamRole) => void;
  onBack: () => void;
  onContinue: () => void;
  fileName?: string;
}

export function GoalSelector({
  selectedGoal,
  onSelectGoal,
  onBack,
  onContinue,
  fileName,
}: GoalSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground mb-2">
          Analyzing: <span className="text-foreground">{fileName}</span>
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          What&apos;s your dream role?
        </h2>
        <p className="text-muted-foreground">
          Be honest. We&apos;ll tell you if it&apos;s realistic.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {(Object.entries(DREAM_ROLES) as [DreamRole, { label: string; description: string }][]).map(
          ([key, { label, description }]) => (
            <Card
              key={key}
              onClick={() => onSelectGoal(key)}
              className={`
                p-4 cursor-pointer transition-all border-2
                ${
                  selectedGoal === key
                    ? "border-[#6366f1] bg-[#6366f1]/5"
                    : "border-border hover:border-muted-foreground"
                }
              `}
            >
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Card>
          )
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedGoal}
          className="flex-1 h-12 bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition-all glow-hover disabled:opacity-50"
        >
          Roast Me
        </Button>
      </div>
    </motion.div>
  );
}
