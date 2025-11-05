
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinearWizard, WizardStep } from '@/components/common/linear-wizard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWarmerForm } from './hooks/useWarmerForm';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { MessagesStep } from './steps/MessagesStep';
import { SettingsStep } from './steps/SettingsStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { ReviewStep } from './steps/ReviewStep';

const CreateWarmer: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    isEditing,
    fromVerifier,
    handleChange,
    handleScheduleChange,
    handleMediaFrequencyChange,
    handleSubmit
  } = useWarmerForm();

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Warmer" : "Create New Warmer"}
        description={isEditing 
          ? "Update your existing WhatsApp warmer configuration" 
          : "Set up an automated warming strategy for your WhatsApp accounts"
        }
        actions={
          <Button 
            variant="outline" 
            onClick={() => navigate('/warmers')}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Warmers
          </Button>
        }
      />

      {fromVerifier && formData.targetNumbers && formData.targetNumbers.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-500" />
          <AlertDescription>
            {formData.targetNumbers.length} verified numbers imported from WhatsApp Verifier.
          </AlertDescription>
        </Alert>
      )}

      <LinearWizard 
        totalSteps={5} 
        initialStep={0}
        stepTitles={[
          "Informações Básicas", 
          "Mensagens", 
          "Configurações", 
          "Agendamento", 
          "Revisão"
        ]}
      >
        {/* Step 1: Basic Information */}
        <WizardStep step={0}>
          <BasicInfoStep 
            formData={formData}
            handleChange={handleChange}
            isEditing={isEditing}
          />
        </WizardStep>

        {/* Step 2: Messages */}
        <WizardStep step={1}>
          <MessagesStep 
            formData={formData}
            handleChange={handleChange}
            handleMediaFrequencyChange={handleMediaFrequencyChange}
          />
        </WizardStep>

        {/* Step 3: Settings */}
        <WizardStep step={2}>
          <SettingsStep 
            formData={formData}
            handleChange={handleChange}
            handleScheduleChange={handleScheduleChange}
          />
        </WizardStep>

        {/* Step 4: Scheduling */}
        <WizardStep step={3}>
          <SchedulingStep 
            formData={formData}
            handleScheduleChange={handleScheduleChange}
          />
        </WizardStep>

        {/* Step 5: Review */}
        <WizardStep step={4}>
          <ReviewStep 
            formData={formData}
            isEditing={isEditing}
            handleSubmit={handleSubmit}
          />
        </WizardStep>
      </LinearWizard>
    </div>
  );
};

export default CreateWarmer;
