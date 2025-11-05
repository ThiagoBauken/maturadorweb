
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeekdaySelector, DAYS_OF_WEEK, type Day } from '@/components/common/schedule';
import { TimeRangePicker, TimeRange } from '@/components/common/schedule';
import { toast } from 'sonner';
import { ChevronLeft, Flame, Zap, Plus, Calendar, Clock, Users, Smartphone, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { VerificationData } from '@/components/verifier/types';
import { StandardWarmerConfig } from '@/components/warmers/StandardWarmerConfig';

// Define types
interface MediaFrequency {
  images: number;
  videos: number;
  audios: number;
  stickers: number;
}

interface WarmerFormData {
  name: string;
  description: string;
  type: 'number-to-number' | 'number-to-group';
  targetCount: number | null;
  messageTemplates: string[];
  days: Day[];
  timeRanges: TimeRange[];
  enableEmojis: boolean;
  enableTypingIndicator: boolean;
  accounts: string[];
  verifiedNumbers: VerificationData[];
  groupName?: string;
  mediaEnabled: boolean;
  mediaTypes: string[];
  mediaFrequency: MediaFrequency;
  aiEnabled: boolean;
  aiProvider: string;
  aiReplyPercentage: number;
}

// Mock data for account selection
const availableAccounts = [
  { id: '1', name: 'Main Account', phone: '+5511999998888', status: 'connected' },
  { id: '2', name: 'Support Account', phone: '+5511977776666', status: 'connected' },
  { id: '3', name: 'Sales Team', phone: '+5511955554444', status: 'disconnected' },
];

export default function StandardWarmer() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  const isEditing = !!editId;
  
  // Initialize form with default values
  const [formData, setFormData] = useState<WarmerFormData>({
    name: queryParams.get('name') || '',
    description: '',
    type: (queryParams.get('subType') as 'number-to-number' | 'number-to-group') || 'number-to-number',
    targetCount: null,
    messageTemplates: ['Hi! How are you doing today?', 'Hello, just checking in!'],
    days: DAYS_OF_WEEK.slice(0, 5) as Day[], // Monday to Friday by default
    timeRanges: [{ start: '09:00', end: '17:00' }],
    enableEmojis: true,
    enableTypingIndicator: true,
    accounts: [],
    verifiedNumbers: [],
    groupName: '',
    mediaEnabled: true,
    mediaTypes: ['image', 'sticker'],
    mediaFrequency: {
      images: 2,
      videos: 1,
      audios: 1,
      stickers: 3
    },
    aiEnabled: false,
    aiProvider: 'deepseek',
    aiReplyPercentage: 60
  });
  
  // For progress visualization
  const [previewProgress, setPreviewProgress] = useState(0);
  
  // State for handling time range conflicts
  const [timeRangeError, setTimeRangeError] = useState<string | null>(null);
  
  // Load data if editing an existing warmer
  useEffect(() => {
    if (isEditing && editId) {
      // In a real app, this would fetch the warmer data from an API
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          name: 'Edited Standard Warmer',
          description: 'This warmer was edited',
          accounts: ['1'],
          groupName: prev.type === 'number-to-group' ? 'Marketing Team Group' : undefined,
        }));
        toast.success('Warmer data loaded successfully');
      }, 500);
    }
  }, [isEditing, editId]);
  
  // Initialize verification numbers if coming from verifier
  useEffect(() => {
    const fromVerifier = queryParams.get('from') === 'verifier';
    
    if (fromVerifier) {
      try {
        const verifiedNumbersJson = localStorage.getItem('verified_numbers');
        if (verifiedNumbersJson) {
          const parsedNumbers = JSON.parse(verifiedNumbersJson);
          setFormData(prev => ({
            ...prev,
            verifiedNumbers: parsedNumbers,
            targetCount: parsedNumbers.length
          }));
          toast.success(`${parsedNumbers.length} verified numbers imported successfully`);
          // Clean up localStorage after using the data
          localStorage.removeItem('verified_numbers');
        }
      } catch (error) {
        console.error('Error loading verified numbers:', error);
      }
    }
    
    // For preview progress animation
    const interval = setInterval(() => {
      setPreviewProgress(prev => (prev < 100 ? prev + 1 : 0));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [queryParams]);
  
  // Handle form field changes
  const handleChange = (field: keyof WarmerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Add new message template
  const addMessageTemplate = () => {
    setFormData(prev => ({
      ...prev,
      messageTemplates: [...prev.messageTemplates, '']
    }));
  };
  
  // Update specific message template
  const updateMessageTemplate = (index: number, value: string) => {
    const newTemplates = [...formData.messageTemplates];
    newTemplates[index] = value;
    handleChange('messageTemplates', newTemplates);
  };
  
  // Remove message template
  const removeMessageTemplate = (index: number) => {
    if (formData.messageTemplates.length <= 1) return;
    const newTemplates = formData.messageTemplates.filter((_, i) => i !== index);
    handleChange('messageTemplates', newTemplates);
  };
  
  // Handle days change from the WeekdaySelector
  const handleDaysChange = (days: Day[]) => {
    handleChange('days', days);
  };

  // Add new time range
  const addTimeRange = () => {
    // Default new time range (1 hour after the last one)
    const lastTimeRange = formData.timeRanges[formData.timeRanges.length - 1];
    const start = lastTimeRange ? 
      (parseInt(lastTimeRange.end.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : 
      '09:00';
    const endHour = parseInt(start.split(':')[0]) + 1;
    const end = endHour.toString().padStart(2, '0') + ':00';
    
    const newTimeRange = { start, end };
    
    // Check for time range conflicts
    const hasConflict = checkTimeRangeConflict(newTimeRange, formData.timeRanges);
    
    if (hasConflict) {
      setTimeRangeError('Time range conflicts with an existing range');
      toast.error('Cannot add time range: conflicts with existing time ranges');
      return;
    }
    
    setTimeRangeError(null);
    handleChange('timeRanges', [...formData.timeRanges, newTimeRange]);
  };
  
  // Update specific time range
  const updateTimeRange = (index: number, timeRange: TimeRange) => {
    // Check for time range conflicts
    const otherRanges = formData.timeRanges.filter((_, i) => i !== index);
    const hasConflict = checkTimeRangeConflict(timeRange, otherRanges);
    
    if (hasConflict) {
      setTimeRangeError('Time range conflicts with an existing range');
      toast.error('Time range conflicts with an existing range');
      return;
    }
    
    setTimeRangeError(null);
    const newTimeRanges = [...formData.timeRanges];
    newTimeRanges[index] = timeRange;
    handleChange('timeRanges', newTimeRanges);
  };
  
  // Remove time range
  const removeTimeRange = (index: number) => {
    if (formData.timeRanges.length <= 1) return;
    const newTimeRanges = formData.timeRanges.filter((_, i) => i !== index);
    handleChange('timeRanges', newTimeRanges);
    setTimeRangeError(null);
  };
  
  // Check for time range conflicts
  const checkTimeRangeConflict = (newRange: TimeRange, existingRanges: TimeRange[]): boolean => {
    const newStart = timeToMinutes(newRange.start);
    const newEnd = timeToMinutes(newRange.end);
    
    if (newStart >= newEnd) return true; // Invalid range (end before start)
    
    return existingRanges.some(range => {
      const rangeStart = timeToMinutes(range.start);
      const rangeEnd = timeToMinutes(range.end);
      
      // Check for overlaps
      return (
        (newStart >= rangeStart && newStart < rangeEnd) || // New start is within existing range
        (newEnd > rangeStart && newEnd <= rangeEnd) || // New end is within existing range
        (newStart <= rangeStart && newEnd >= rangeEnd) // New range completely contains existing range
      );
    });
  };
  
  // Convert time string to minutes for easier comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    return hours * 60 + minutes;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (formData.name.trim() === '') {
      toast.error('Please enter a warmer name');
      return;
    }
    
    if (formData.accounts.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    if (formData.type === 'number-to-group' && !formData.groupName) {
      toast.error('Please enter a group name');
      return;
    }
    
    // In a real app, this would save to an API
    console.log('Warmer created/updated:', formData);
    toast.success(isEditing ? 'Warmer updated successfully!' : 'Warmer created successfully!');
    navigate('/warmers');
  };

  // Handle media frequency change
  const handleMediaFrequencyChange = (type: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFrequency: {
        ...prev.mediaFrequency,
        [type]: value
      }
    }));
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Standard Warmer" : "Create Standard Warmer"}
        description={isEditing 
          ? "Update your simplified warming strategy" 
          : "Set up a simplified warming strategy for your WhatsApp accounts"
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warmer-type">Warmer Type</Label>
                <RadioGroup 
                  id="warmer-type" 
                  value={formData.type}
                  onValueChange={(value: 'number-to-number' | 'number-to-group') => handleChange('type', value)}
                  className="flex flex-col space-y-3"
                  disabled={isEditing}
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="number-to-number" id="type-standard" />
                    <Label htmlFor="type-standard" className="font-normal cursor-pointer flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-500" />
                      Number-to-Number Warmer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="number-to-group" id="type-group" />
                    <Label htmlFor="type-group" className="font-normal cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Group Warmer
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Warmer Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Main Account Warmer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the purpose of this warmer"
                  rows={2}
                />
              </div>
              
              {formData.type === 'number-to-group' && (
                <div className="space-y-2">
                  <Label htmlFor="groupName">WhatsApp Group Name</Label>
                  <Input 
                    id="groupName" 
                    value={formData.groupName}
                    onChange={(e) => handleChange('groupName', e.target.value)}
                    placeholder="Enter the exact name of the WhatsApp group"
                  />
                  <p className="text-sm text-muted-foreground">
                    The group must exist and your WhatsApp account must be a member
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>WhatsApp Account(s)</Label>
                {availableAccounts.map(account => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`account-${account.id}`}
                      checked={formData.accounts.includes(account.id)}
                      disabled={account.status !== 'connected'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleChange('accounts', [...formData.accounts, account.id]);
                        } else {
                          handleChange('accounts', formData.accounts.filter(id => id !== account.id));
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`account-${account.id}`} 
                      className={`font-normal cursor-pointer ${account.status !== 'connected' ? 'text-muted-foreground' : ''}`}
                    >
                      {account.name} ({account.phone})
                      {account.status !== 'connected' && ' - Disconnected'}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Verified Numbers Section */}
          {formData.verifiedNumbers.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Verified Numbers</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {formData.verifiedNumbers.length} numbers
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <p className="text-sm">
                    These verified numbers will be used in the warming process.
                  </p>
                </div>
                
                <div className="bg-muted rounded p-2 max-h-32 overflow-y-auto text-sm">
                  {formData.verifiedNumbers.slice(0, 5).map((number, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span>{number.phoneNumber}</span>
                      <span className="text-green-500">✓ Verified</span>
                    </div>
                  ))}
                  
                  {formData.verifiedNumbers.length > 5 && (
                    <div className="text-center text-muted-foreground mt-1">
                      + {formData.verifiedNumbers.length - 5} more numbers
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Standard Warmer Config */}
          <StandardWarmerConfig
            targetCount={formData.targetCount}
            onTargetCountChange={(count) => handleChange('targetCount', count)}
            useEmojis={formData.enableEmojis}
            onUseEmojisChange={(value) => handleChange('enableEmojis', value)}
            mediaEnabled={formData.mediaEnabled}
            onMediaEnabledChange={(value) => handleChange('mediaEnabled', value)}
            mediaTypes={formData.mediaTypes}
            onMediaTypesChange={(types) => handleChange('mediaTypes', types)}
            mediaFrequency={formData.mediaFrequency}
            onMediaFrequencyChange={handleMediaFrequencyChange}
            aiEnabled={formData.aiEnabled}
            onAiEnabledChange={(value) => handleChange('aiEnabled', value)}
            aiProvider={formData.aiProvider}
            onAiProviderChange={(value) => handleChange('aiProvider', value)}
            aiReplyPercentage={formData.aiReplyPercentage}
            onAiReplyPercentageChange={(value) => handleChange('aiReplyPercentage', value)}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Templates</Label>
                <div className="space-y-2">
                  {formData.messageTemplates.map((template, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={template}
                        onChange={(e) => updateMessageTemplate(index, e.target.value)}
                        placeholder="Message template"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        type="button"
                        onClick={() => removeMessageTemplate(index)}
                        disabled={formData.messageTemplates.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    type="button"
                    onClick={addMessageTemplate}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiple templates will be used randomly to appear more natural
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Active Days
                </Label>
                <WeekdaySelector 
                  selectedDays={formData.days}
                  onChange={handleDaysChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Ranges
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addTimeRange}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Range
                  </Button>
                </div>
                
                {timeRangeError && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 py-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-500">
                      {timeRangeError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {formData.timeRanges.map((timeRange, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <TimeRangePicker
                        value={timeRange}
                        onChange={(newTimeRange) => updateTimeRange(index, newTimeRange)}
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        type="button"
                        onClick={() => removeTimeRange(index)}
                        disabled={formData.timeRanges.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Behavior Settings</Label>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor="enable-typing" 
                      className="font-normal cursor-pointer"
                    >
                      Show typing indicator before sending
                    </Label>
                    <Checkbox 
                      id="enable-typing"
                      checked={formData.enableTypingIndicator}
                      onCheckedChange={(checked) => {
                        handleChange('enableTypingIndicator', !!checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/warmers')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? 'Update Warmer' : 'Create Warmer'}
            </Button>
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warmer Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {formData.type === 'number-to-group' ? (
                    <Users className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Smartphone className="h-5 w-5 text-blue-500" />
                  )}
                  <h3 className="font-medium">
                    {formData.name || 'Unnamed Warmer'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.description || 'No description provided'}
                </p>
                <div className="text-sm bg-muted p-2 rounded">
                  {formData.type === 'number-to-group' ? (
                    <div>Type: <span className="font-medium">Number to Group Warmer</span></div>
                  ) : (
                    <div>Type: <span className="font-medium">Number to Number Warmer</span></div>
                  )}
                  {formData.type === 'number-to-group' && formData.groupName && (
                    <div>Group: <span className="font-medium">{formData.groupName}</span></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 py-2 border-t border-b">
                <div className="flex justify-between text-sm">
                  <span>Target:</span>
                  <span className="font-medium">{formData.targetCount !== null ? `${formData.targetCount} messages` : 'Continuous'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Templates:</span>
                  <span className="font-medium">{formData.messageTemplates.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accounts:</span>
                  <span className="font-medium">{formData.accounts.length}</span>
                </div>
                {formData.verifiedNumbers.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Verified Numbers:</span>
                    <span className="font-medium text-green-500">
                      {formData.verifiedNumbers.length}
                    </span>
                  </div>
                )}
                {formData.mediaEnabled && (
                  <div className="flex justify-between text-sm">
                    <span>Media Types:</span>
                    <span className="font-medium">{formData.mediaTypes.length}</span>
                  </div>
                )}
                {formData.aiEnabled && (
                  <div className="flex justify-between text-sm">
                    <span>AI Replies:</span>
                    <span className="font-medium text-purple-500">{formData.aiReplyPercentage}%</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Schedule</Label>
                <div className="text-sm">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {DAYS_OF_WEEK.map(day => (
                      <span 
                        key={day}
                        className={`px-2 py-1 rounded-md text-xs ${
                          formData.days.includes(day) 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {formData.timeRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {range.start} - {range.end}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Expected Progress</Label>
                <div className="space-y-1">
                  <Progress value={previewProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Day 1</span>
                    <span>{formData.targetCount !== null ? `~${Math.ceil(formData.targetCount / 10)} days` : 'Continuous'}</span>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-primary/5 border-primary/10">
                <AlertDescription className="text-xs">
                  {formData.type === 'number-to-group' 
                    ? 'Group warmers send messages to a WhatsApp group at scheduled intervals.'
                    : 'Number-to-number warmers have WhatsApp accounts communicate with each other to warm them gradually and safely.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
