
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBulkSender } from '../hooks/useBulkSender';
import { toast } from 'sonner';
import { MediaAttachment } from './MediaAttachment';
import { BasicMessageTab } from './message/BasicMessageTab';
import { VariationsTab } from './message/VariationsTab';
import { MessagePreview } from './message/MessagePreview';
import { ProjectNameField } from './message/ProjectNameField';

export function MessageSection() {
  const { 
    messageTemplates, 
    messageText,
    messageVariation,
    messageVariationPercentage,
    typingDelay,
    addMessageTemplate,
    updateMessageTemplate,
    removeMessageTemplate,
    setMessageText,
    setMessageVariation,
    setMessageVariationPercentage,
    setTypingDelay,
    projectName,
    setProjectName,
    savedMessageDrafts,
    saveMessageDraft,
    activeDraftId,
    showAiDialog,
    setShowAiDialog,
    generateAiMessageVariations,
    aiVariationsCount,
    setAiVariationsCount,
    isGeneratingMessages,
    mediaUrl,
    mediaType
  } = useBulkSender();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [showSavedDrafts, setShowSavedDrafts] = useState(false);
  
  const handleGenerateVariations = () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message first');
      return;
    }
    
    setShowAiDialog(true);
  };
  
  const handleSaveDraft = () => {
    const hasMedia = mediaUrl && mediaType !== 'none';
    const hasMessageContent = messageTemplates.some(template => template.trim().length > 0);
    const hasContent = hasMessageContent || hasMedia;
    
    if (!hasContent) {
      toast.error('Cannot save an empty message draft. Please add text or media content.');
      return;
    }
    
    if (!projectName) {
      toast.error('Please enter a project name before saving');
      return;
    }
    
    saveMessageDraft();
  };

  // Since useBulkSender doesn't directly support parameters for these functions,
  // we need to adapt our approach
  const handleLoadDraft = () => {
    // In a real implementation, we would need to adjust the API
    // For now, we'll show a message that this feature needs adjustment
    toast.error('Draft loading functionality needs to be implemented properly');
  };
  
  const handleDeleteDraft = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    // In a real implementation, we would need to adjust the API
    // For now, we'll show a message that this feature needs adjustment
    toast.error('Draft deletion functionality needs to be implemented properly');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Message</CardTitle>
              <CardDescription>
                Compose your message or create variations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectNameField projectName={projectName} setProjectName={setProjectName} />
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Message</TabsTrigger>
                  <TabsTrigger value="variations">Message Variations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="pt-4">
                  <BasicMessageTab 
                    messageText={messageText}
                    setMessageText={setMessageText}
                    typingDelay={typingDelay}
                    setTypingDelay={setTypingDelay}
                    handleGenerateVariations={handleGenerateVariations}
                    handleSaveDraft={handleSaveDraft}
                    setShowSavedDrafts={setShowSavedDrafts}
                    showSavedDrafts={showSavedDrafts}
                    isGeneratingMessages={isGeneratingMessages}
                  />
                </TabsContent>
                
                <TabsContent value="variations" className="pt-4">
                  <VariationsTab 
                    messageVariation={messageVariation}
                    setMessageVariation={setMessageVariation}
                    messageVariationPercentage={messageVariationPercentage}
                    setMessageVariationPercentage={setMessageVariationPercentage}
                    messageTemplates={messageTemplates}
                    updateMessageTemplate={updateMessageTemplate}
                    removeMessageTemplate={removeMessageTemplate}
                    addMessageTemplate={addMessageTemplate}
                    handleGenerateVariations={handleGenerateVariations}
                    aiVariationsCount={aiVariationsCount}
                    setAiVariationsCount={setAiVariationsCount}
                    isGeneratingMessages={isGeneratingMessages}
                    setShowAiDialog={setShowAiDialog}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <MediaAttachment />
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
              <CardDescription>
                How your message will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessagePreview
                activeTab={activeTab}
                messageText={messageText}
                messageTemplates={messageTemplates}
                showSavedDrafts={showSavedDrafts}
                savedMessageDrafts={savedMessageDrafts}
                activeDraftId={activeDraftId}
                handleLoadDraft={handleLoadDraft}
                handleDeleteDraft={handleDeleteDraft}
                saveMessageDraft={handleSaveDraft}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
