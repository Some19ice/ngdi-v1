"use client"

import { useState } from "react"
import GeneralInfoForm from "@/app/metadata/add/components/general-info-form"
import TechnicalDetailsForm from "@/app/metadata/add/components/technical-details-form"
import AccessInfoForm from "@/app/metadata/add/components/access-info-form"

export function MetadataForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-1/3 text-center ${
              currentStep >= step ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                currentStep >= step ? "bg-primary text-white" : "bg-muted"
              }`}
            >
              {step}
            </div>
            <span className="text-sm">
              {["General", "Technical", "Access"][step - 1]}
            </span>
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <GeneralInfoForm onNext={handleNext} initialData={formData} />
      )}
      {currentStep === 2 && (
        <TechnicalDetailsForm
          onNext={handleNext}
          onBack={handleBack}
          initialData={formData}
        />
      )}
      {currentStep === 3 && (
        <AccessInfoForm onBack={handleBack} initialData={formData} />
      )}
    </div>
  )
}
