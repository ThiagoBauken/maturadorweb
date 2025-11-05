import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { BulkSenderProvider, useBulkSender } from './hooks/useBulkSender';
import { RealTimeMessagingProvider } from './providers/RealTimeMessagingProvider';
import { StepNavigator } from './components/StepNavigator';
import { AIVariationDialog } from './components/AIVariationDialog';
import { ContextBanners } from './components/ContextBanners';
import { HeaderActions } from './components/HeaderActions';
import { NewProjectDialog } from './components/NewProjectDialog';
import { StepContent } from './components/StepContent';
import { useStepNavigation } from './hooks/useStepNavigation';
import { toast } from 'sonner';
import { campaignData } from '@/components/campaigns/CampaignData';

// Isolate the RealTimeMessagingProvider to make it reusable from Dashboard
export function BulkSenderWithRealTimeMessaging({ children }: { children: React.ReactNode }) {
  const {
    activeSessions,
    sendingInProgress,
    currentSendingId,
    updateContactStatus,
    updateMessageReadStatus,
    updateMessageResponseStatus
  } = useBulkSender();

  // Create adapter functions to handle type mismatches
  const adaptUpdateContactStatus = (historyId: string, phoneNumber: string, sent: boolean, error?: string) => {
    updateContactStatus(historyId, phoneNumber, { sent, error });
  };
  
  const adaptUpdateMessageReadStatus = (historyId: string, phoneNumber: string, read: boolean) => {
    updateMessageReadStatus(historyId, phoneNumber, read);
  };
  
  const adaptUpdateMessageResponseStatus = (historyId: string, phoneNumber: string, responded: boolean, sentiment?: string) => {
    updateMessageResponseStatus(historyId, phoneNumber, responded, sentiment as any);
  };

  // Don't pass extra props to RealTimeMessagingProvider that aren't defined in its type
  return (
    <RealTimeMessagingProvider>
      {children}
    </RealTimeMessagingProvider>
  );
}

// BulkSenderContent is the main component that renders the bulk sender interface
function BulkSenderContent() {
  const navigate = useNavigate();
  const { 
    setSelectedContacts,
    setRecipientListText,
    projectName,
    setMessageText,
    setProjectName
  } = useBulkSender();
  
  const {
    currentStep,
    steps,
    canProceed,
    goToNextStep,
    goToPreviousStep,
    goToStep
  } = useStepNavigation();
  
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [processedImport, setProcessedImport] = useState(false);
  
  const location = useLocation();
  const params = useParams();
  const queryParams = new URLSearchParams(location.search);
  const fromCampaign = queryParams.get('from') === 'campaign';
  const fromVerifier = queryParams.get('from') === 'verifier';
  const campaignIdFromQuery = queryParams.get('id');
  const campaignIdFromParams = params.campaignId;
  const campaignId = campaignIdFromParams || campaignIdFromQuery;

  // Load campaign by ID from URL param
  useEffect(() => {
    if (campaignId && !processedImport) {
      try {
        // First try to get from campaignData
        const campaign = campaignData.find(c => c.id === campaignId);
        
        if (campaign) {
          setProjectName(campaign.name);
          toast.success(`Loaded campaign: ${campaign.name}`);
          
          if (campaign.message) {
            setMessageText(campaign.message);
          }
          
          if (Array.isArray(campaign.recipientList) && campaign.recipientList.length > 0) {
            setSelectedContacts(campaign.recipientList);
            setRecipientListText(campaign.recipientList.join('\n'));
            goToStep('options');
          } else {
            goToStep('recipients');
          }
          
          // Mark as processed to prevent infinite loop
          setProcessedImport(true);
        } else {
          // If not found, check localStorage as a fallback
          const campaignJson = localStorage.getItem('campaign_to_bulk_sender');
          
          if (campaignJson) {
            const storedCampaign = JSON.parse(campaignJson);
            
            if (storedCampaign.name) {
              setProjectName(storedCampaign.name);
              toast.success(`Loaded campaign: ${storedCampaign.name}`);
            }
            
            if (storedCampaign.message) {
              setMessageText(storedCampaign.message);
            }
            
            if (Array.isArray(storedCampaign.contacts) && storedCampaign.contacts.length > 0) {
              setSelectedContacts(storedCampaign.contacts);
              setRecipientListText(storedCampaign.contacts.join('\n'));
              goToStep('options');
            } else {
              goToStep('recipients');
            }
            
            // Mark as processed to prevent infinite loop
            setProcessedImport(true);
            
            // Clear localStorage to prevent re-importing on refresh
            localStorage.removeItem('campaign_to_bulk_sender');
          } else if (campaignId) {
            toast.error(`Campaign with ID ${campaignId} not found`);
          }
        }
      } catch (error) {
        console.error('Error loading campaign data:', error);
        toast.error('Failed to load campaign data');
      }
    }
  }, [campaignId, setSelectedContacts, setRecipientListText, setMessageText, setProjectName, processedImport, goToStep]);

  // Effect to handle verified numbers import
  useEffect(() => {
    if (fromVerifier && !processedImport) {
      try {
        const verifiedNumbersJson = localStorage.getItem('verified_numbers');
        if (verifiedNumbersJson) {
          const parsedNumbers = JSON.parse(verifiedNumbersJson);
          
          // Determine how to handle the verified numbers
          if (Array.isArray(parsedNumbers) && parsedNumbers.length > 0) {
            if (parsedNumbers[0].phoneNumber) {
              // It's an array of verification data objects
              const phoneNumbers = parsedNumbers.map((item) => item.phoneNumber);
              setSelectedContacts(phoneNumbers);
              setRecipientListText(phoneNumbers.join('\n'));
              
              // Mark as processed to prevent infinite loop
              setProcessedImport(true);
              
              // Clear localStorage to prevent re-importing on refresh
              localStorage.removeItem('verified_numbers');
              
              // Only navigate if currently on message step
              if (currentStep === 'message') {
                // Use setTimeout to ensure state updates have completed
                setTimeout(() => {
                  goToStep('recipients');
                }, 100);
              }
            } else {
              // It's just an array of phone numbers
              setSelectedContacts(parsedNumbers);
              setRecipientListText(parsedNumbers.join('\n'));
              
              // Mark as processed to prevent infinite loop
              setProcessedImport(true);
              
              // Clear localStorage to prevent re-importing on refresh
              localStorage.removeItem('verified_numbers');
              
              // Only navigate if currently on message step
              if (currentStep === 'message') {
                // Use setTimeout to ensure state updates have completed
                setTimeout(() => {
                  goToStep('recipients');
                }, 100);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading verified numbers:', error);
      }
    }
  }, [fromVerifier, setSelectedContacts, setRecipientListText, goToStep, currentStep, processedImport]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Bulk Sender - ${steps.find(step => step.id === currentStep)?.label}`}
        description={projectName ? `Project: ${projectName}` : "Send messages to multiple WhatsApp contacts"}
        actions={
          <HeaderActions
            currentStep={currentStep}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
            isNewProjectDialogOpen={isNewProjectDialogOpen}
            setIsNewProjectDialogOpen={setIsNewProjectDialogOpen}
            canProceed={canProceed}
          />
        }
      />
      
      <ContextBanners 
        fromCampaign={fromCampaign} 
        fromVerifier={fromVerifier} 
      />
      
      <StepNavigator 
        steps={steps} 
        currentStep={currentStep} 
        onChange={(step) => goToStep(step as typeof currentStep)} 
      />
      
      <StepContent step={currentStep} />
      
      <AIVariationDialog />
      
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        projectName={projectName}
      />
    </div>
  );
}

// Main exported component with providers
export default function BulkSender() {
  return (
    <BulkSenderProvider>
      <BulkSenderWithRealTimeMessaging>
        <BulkSenderContent />
      </BulkSenderWithRealTimeMessaging>
    </BulkSenderProvider>
  );
}
