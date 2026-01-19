"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DreamRole, DREAM_ROLES, ROLE_CATEGORIES, RoleCategory } from "@/lib/types";

interface GoalSelectorProps {
  selectedGoal: DreamRole | null;
  onSelectGoal: (goal: DreamRole) => void;
  onBack: () => void;
  onContinue: () => void;
  fileName?: string;
}

// Group roles by category in order of ambition
const ROLE_ORDER: { category: RoleCategory; roles: DreamRole[] }[] = [
  { category: "executive", roles: ["founder", "vp-product"] },
  { category: "bigtech", roles: ["l7-faang", "l6-faang"] },
  { category: "startup", roles: ["cpo-startup", "cpo-enterprise"] },
  { category: "ic", roles: ["ic-senior"] },
];

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

      <div className="space-y-6 mb-8">
        {ROLE_ORDER.map(({ category, roles }) => {
          const categoryInfo = ROLE_CATEGORIES[category];
          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${categoryInfo.color}`}>
                  {categoryInfo.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Roles in Category */}
              <div className={`grid gap-3 ${roles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {roles.map((roleKey) => {
                  const role = DREAM_ROLES[roleKey];
                  const isSelected = selectedGoal === roleKey;

                  return (
                    <Card
                      key={roleKey}
                      onClick={() => onSelectGoal(roleKey)}
                      className={`
                        p-4 cursor-pointer transition-all border-2 group
                        ${isSelected
                          ? `${categoryInfo.borderColor} ${categoryInfo.bgColor} border-2`
                          : "border-border hover:border-muted-foreground"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{role.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-semibold ${isSelected ? categoryInfo.color : 'text-foreground'}`}>
                            {role.label}
                          </p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-5 h-5 rounded-full ${categoryInfo.bgColor} flex items-center justify-center`}
                          >
                            <svg className={`w-3 h-3 ${categoryInfo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
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
          className="flex-1 h-14 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
        >
          🔥 Roast Me
        </Button>
      </div>
    </motion.div>
  );
}
