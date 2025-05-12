import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface StepProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isLast?: boolean;
}

export function Step({
  icon,
  title,
  description,
  isCompleted = false,
  isActive = false,
  isLast = false,
}: StepProps) {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full z-10",
            isCompleted
              ? "bg-primary text-primary-foreground"
              : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-gray-200 text-gray-600"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : icon || (
            <Circle className="w-5 h-5" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 h-full my-1",
              isCompleted ? "bg-primary" : "bg-gray-200"
            )}
          />
        )}
      </div>
      <div className="ml-4 mt-1 pb-8">
        <h3
          className={cn(
            "font-medium",
            isCompleted || isActive ? "text-primary" : "text-gray-500"
          )}
        >
          {title}
        </h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}

interface StepperProps {
  steps: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <Step
          key={index}
          icon={step.icon}
          title={step.title}
          description={step.description}
          isCompleted={index < currentStep}
          isActive={index === currentStep}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
}