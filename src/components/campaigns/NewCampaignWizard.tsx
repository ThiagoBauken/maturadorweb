
import React, { useState } from 'react';
import { LinearWizard, WizardStep, WizardNavigation, WizardSummary } from '@/components/common/linear-wizard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NewCampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewCampaignWizard: React.FC<NewCampaignWizardProps> = ({
  open,
  onOpenChange
}) => {
  // Campaign details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Delay settings
  const [delayRange, setDelayRange] = useState([30, 120]);
  
  // Schedule settings
  const [scheduleType, setScheduleType] = useState('all-day');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  
  // Message settings
  const [messageText, setMessageText] = useState('');
  const [generateVariations, setGenerateVariations] = useState(false);
  const [variationsCount, setVariationsCount] = useState(3);

  // Available sessions (mock data)
  const availableSessions = [
    { id: 1, name: 'Session 1', status: 'active' },
    { id: 2, name: 'Session 2', status: 'active' },
    { id: 3, name: 'Session 3', status: 'active' }
  ];
  
  // Selected sessions
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const handleSessionToggle = (sessionId: number) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleComplete = () => {
    toast.success('Campaign created successfully!');
    onOpenChange(false);
    
    // Reset form
    setName('');
    setDescription('');
    setDelayRange([30, 120]);
    setScheduleType('all-day');
    setStartTime('09:00');
    setEndTime('18:00');
    setMessageText('');
    setGenerateVariations(false);
    setVariationsCount(3);
    setSelectedSessions([]);
  };

  // Step titles for the wizard
  const stepTitles = [
    'Basic Info', 
    'Delay', 
    'Schedule', 
    'Message', 
    'Sessions', 
    'Review'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up your WhatsApp messaging campaign step by step
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <LinearWizard 
            totalSteps={6} 
            stepTitles={stepTitles}
          >
            {/* Step 1: Basic Information */}
            <WizardStep step={0}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input 
                    id="campaign-name" 
                    placeholder="Enter a name for your campaign" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-description">Description (optional)</Label>
                  <Textarea 
                    id="campaign-description" 
                    placeholder="Describe your campaign purpose" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <WizardNavigation 
                disableNext={!name.trim()} 
                nextLabel="Continue"
              />
            </WizardStep>
            
            {/* Step 2: Delay Configuration */}
            <WizardStep step={1}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Message Delay</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set the minimum and maximum delay between messages (in seconds)
                  </p>
                  
                  <div className="space-y-4">
                    <Slider 
                      value={delayRange} 
                      min={10} 
                      max={300}
                      step={5}
                      onValueChange={setDelayRange} 
                    />
                    
                    <div className="flex justify-between">
                      <div>
                        <Label htmlFor="min-delay">Minimum</Label>
                        <div className="text-sm font-medium">{delayRange[0]} seconds</div>
                      </div>
                      <div>
                        <Label htmlFor="max-delay">Maximum</Label>
                        <div className="text-sm font-medium">{delayRange[1]} seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <WizardNavigation />
            </WizardStep>
            
            {/* Step 3: Schedule Configuration */}
            <WizardStep step={2}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Campaign Schedule</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure when your campaign should run
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-type">Schedule Type</Label>
                      <Select 
                        value={scheduleType} 
                        onValueChange={setScheduleType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-day">All Day (24/7)</SelectItem>
                          <SelectItem value="business-hours">Business Hours</SelectItem>
                          <SelectItem value="custom">Custom Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {scheduleType !== 'all-day' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input 
                            id="start-time" 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input 
                            id="end-time" 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <WizardNavigation />
            </WizardStep>
            
            {/* Step 4: Message Configuration */}
            <WizardStep step={3}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Message Content</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compose the message you want to send
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-text">Message Text</Label>
                      <Textarea 
                        id="message-text" 
                        placeholder="Enter your message content"
                        rows={6}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="generate-variations" 
                        checked={generateVariations}
                        onCheckedChange={(checked) => 
                          setGenerateVariations(checked === true)
                        }
                      />
                      <Label 
                        htmlFor="generate-variations"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Generate message variations to avoid detection
                      </Label>
                    </div>
                    
                    {generateVariations && (
                      <div className="space-y-2">
                        <Label htmlFor="variations-count">Number of variations</Label>
                        <Select 
                          value={variationsCount.toString()} 
                          onValueChange={(val) => setVariationsCount(parseInt(val))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 variations</SelectItem>
                            <SelectItem value="5">5 variations</SelectItem>
                            <SelectItem value="10">10 variations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <WizardNavigation disableNext={!messageText.trim()} />
            </WizardStep>
            
            {/* Step 5: Session Selection */}
            <WizardStep step={4}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Select Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which WhatsApp sessions to use for sending
                  </p>
                  
                  <div className="space-y-4">
                    {availableSessions.map(session => (
                      <div key={session.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent">
                        <Checkbox 
                          id={`session-${session.id}`} 
                          checked={selectedSessions.includes(session.id)}
                          onCheckedChange={() => handleSessionToggle(session.id)}
                        />
                        <Label 
                          htmlFor={`session-${session.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{session.name}</div>
                          <div className="text-xs text-muted-foreground">Status: {session.status}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <WizardNavigation disableNext={selectedSessions.length === 0} />
            </WizardStep>
            
            {/* Step 6: Review */}
            <WizardStep step={5}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Review Your Campaign</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Confirm your campaign configuration before creating
                  </p>
                  
                  <WizardSummary
                    title="Campaign Summary"
                    description="Review the details of your campaign"
                    items={[
                      { label: 'Campaign Name', value: name },
                      { label: 'Description', value: description || 'N/A' },
                      { label: 'Delay Range', value: `${delayRange[0]} - ${delayRange[1]} seconds` },
                      { label: 'Schedule', value: scheduleType === 'all-day' 
                        ? 'All Day (24/7)' 
                        : `${startTime} - ${endTime}` 
                      },
                      { label: 'Sessions', value: `${selectedSessions.length} selected` },
                      { label: 'Message Variations', value: generateVariations 
                        ? `${variationsCount} variations` 
                        : 'No variations' 
                      }
                    ]}
                  />
                </div>
              </div>
              <WizardNavigation 
                completeLabel="Create Campaign"
                onComplete={handleComplete}
              />
            </WizardStep>
          </LinearWizard>
        </div>
      </DialogContent>
    </Dialog>
  );
};
