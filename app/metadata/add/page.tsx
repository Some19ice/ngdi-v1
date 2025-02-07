"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GeneralInfoForm from "./components/general-info-form";
import TechnicalDetailsForm from "./components/technical-details-form";
import AccessInfoForm from "./components/access-info-form";
import { Steps } from "./components/steps";

export default function AddMetadataPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Add Metadata
          </h1>

          <div className="mb-8">
            <Steps currentStep={currentStep} />
          </div>

          <Card className="p-6">
            {currentStep === 1 && <GeneralInfoForm />}
            {currentStep === 2 && <TechnicalDetailsForm />}
            {currentStep === 3 && <AccessInfoForm />}

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === totalSteps}
              >
                Next
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}