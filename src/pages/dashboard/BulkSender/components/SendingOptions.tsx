
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useBulkSender } from "../hooks/useBulkSender";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useSessions } from "../hooks/useSessions";
import { WhatsAppSession } from "../models/whatsapp";
import { RefreshCcw, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { TimezoneSelector } from "./TimezoneSelector";
import { format } from "date-fns";

export function SendingOptions() {
  const {
    minInterval,
    setMinInterval,
    maxInterval,
    setMaxInterval,
    useRandomInterval,
    setUseRandomInterval,
    numberRotation,
    setNumberRotation,
    rotationMode,
    setRotationMode,
    maxDailyMessages,
    setMaxDailyMessages,
    scheduleEnabled,
    setScheduleEnabled,
    scheduleTime,
    setScheduleTime,
    scheduleDate,
    setScheduleDate,
    timezone,
    setTimezone,
    activeSessions,
    setActiveSessions,
    timeSlots,
    setTimeSlots
  } = useBulkSender();

  const { availableSessions, isLoading, refreshSessions } = useSessions();
  const [selectAll, setSelectAll] = useState(false);
  const [minIntervalInput, setMinIntervalInput] = useState(minInterval.toString());
  const [maxIntervalInput, setMaxIntervalInput] = useState(maxInterval.toString());
  const [maxDailyMessagesInput, setMaxDailyMessagesInput] = useState(maxDailyMessages.toString());
  const [newStartTime, setNewStartTime] = useState("08:00");
  const [newEndTime, setNewEndTime] = useState("18:00");

  // Handle select all sessions
  useEffect(() => {
    if (selectAll) {
      const connectedSessions = availableSessions
        .filter(session => session.status === 'connected')
        .map(session => session.id);
      setActiveSessions(connectedSessions);
    }
  }, [selectAll, availableSessions, setActiveSessions]);

  // Update selectAll state when active sessions change
  useEffect(() => {
    const connectedSessions = availableSessions
      .filter(session => session.status === 'connected')
      .map(session => session.id);
    
    setSelectAll(
      connectedSessions.length > 0 && 
      connectedSessions.every(id => activeSessions.includes(id))
    );
  }, [activeSessions, availableSessions]);

  // Update input fields when slider values change
  useEffect(() => {
    setMinIntervalInput(minInterval.toString());
    setMaxIntervalInput(maxInterval.toString());
  }, [minInterval, maxInterval]);

  // Update maxDailyMessagesInput when maxDailyMessages changes
  useEffect(() => {
    setMaxDailyMessagesInput(maxDailyMessages.toString());
  }, [maxDailyMessages]);

  const handleRefresh = () => {
    refreshSessions();
    toast.success("Sessions refreshed");
  };

  const toggleSession = (sessionId: string) => {
    if (activeSessions.includes(sessionId)) {
      setActiveSessions(activeSessions.filter(id => id !== sessionId));
    } else {
      setActiveSessions([...activeSessions, sessionId]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const connectedSessions = availableSessions
        .filter(session => session.status === 'connected')
        .map(session => session.id);
      setActiveSessions(connectedSessions);
    } else {
      setActiveSessions([]);
    }
  };

  const handleMinIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 5 && value < maxInterval) {
      setMinInterval(value);
      setMinIntervalInput(value.toString());
    } else {
      setMinIntervalInput(event.target.value);
    }
  };

  const handleMaxIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > minInterval) {
      setMaxInterval(value);
      setMaxIntervalInput(value.toString());
    } else {
      setMaxIntervalInput(event.target.value);
    }
  };

  const handleMaxDailyMessagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1) {
      setMaxDailyMessages(value);
      setMaxDailyMessagesInput(value.toString());
    } else {
      setMaxDailyMessagesInput(event.target.value);
    }
  };

  const handleIntervalSliderChange = (values: number[]) => {
    if (values.length === 2) {
      setMinInterval(values[0]);
      setMaxInterval(values[1]);
      setMinIntervalInput(values[0].toString());
      setMaxIntervalInput(values[1].toString());
    }
  };

  const handleAddTimeSlot = () => {
    const newTimeSlot = {
      id: Date.now().toString(),
      startTime: newStartTime,
      endTime: newEndTime
    };
    setTimeSlots([...timeSlots, newTimeSlot]);
    toast.success("Time slot added");
  };

  const handleRemoveTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const generateBusinessWeekSchedule = () => {
    // Create 9-5 business hours for Mon-Fri
    const businessHours = [
      { id: "mon-1", startTime: "09:00", endTime: "12:00" },
      { id: "mon-2", startTime: "13:00", endTime: "17:00" },
      { id: "tue-1", startTime: "09:00", endTime: "12:00" },
      { id: "tue-2", startTime: "13:00", endTime: "17:00" },
      { id: "wed-1", startTime: "09:00", endTime: "12:00" },
      { id: "wed-2", startTime: "13:00", endTime: "17:00" },
      { id: "thu-1", startTime: "09:00", endTime: "12:00" },
      { id: "thu-2", startTime: "13:00", endTime: "17:00" },
      { id: "fri-1", startTime: "09:00", endTime: "12:00" },
      { id: "fri-2", startTime: "13:00", endTime: "17:00" },
    ];
    setTimeSlots(businessHours);
    toast.success("Business week schedule generated");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sending Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Message Interval</Label>
              <p className="text-sm text-muted-foreground">
                Set the time between messages (in seconds)
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="number"
                  min="5"
                  className="w-20"
                  value={minIntervalInput}
                  onChange={handleMinIntervalChange}
                  onBlur={() => {
                    const value = parseInt(minIntervalInput);
                    if (!isNaN(value) && value >= 5 && value < maxInterval) {
                      setMinInterval(value);
                    } else {
                      setMinIntervalInput(minInterval.toString());
                    }
                  }}
                />
                <span className="text-sm">to</span>
                <Input
                  type="number"
                  min={minInterval + 1}
                  className="w-20"
                  value={maxIntervalInput}
                  onChange={handleMaxIntervalChange}
                  onBlur={() => {
                    const value = parseInt(maxIntervalInput);
                    if (!isNaN(value) && value > minInterval) {
                      setMaxInterval(value);
                    } else {
                      setMaxIntervalInput(maxInterval.toString());
                    }
                  }}
                />
                <span className="text-sm">seconds</span>
              </div>
              
              <Slider 
                value={[minInterval, maxInterval]}
                min={5}
                max={600}
                step={1}
                onValueChange={handleIntervalSliderChange}
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="number-rotation" 
                checked={numberRotation} 
                onCheckedChange={setNumberRotation} 
              />
              <div>
                <Label htmlFor="number-rotation" className="font-medium">Number Rotation</Label>
                <p className="text-sm text-muted-foreground">
                  Send messages to random contacts instead of in sequence
                </p>
              </div>
            </div>
            
            {numberRotation && (
              <div className="pl-7 space-y-3">
                <RadioGroup 
                  value={rotationMode} 
                  onValueChange={(value) => setRotationMode(value as 'switch' | 'all-together' | 'sequential')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="switch" id="rotation-switch" />
                    <Label htmlFor="rotation-switch">Switch between sessions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all-together" id="rotation-all" />
                    <Label htmlFor="rotation-all">All Together (use all sessions simultaneously with random delays)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sequential" id="rotation-sequential" />
                    <Label htmlFor="rotation-sequential">Sequential (use sessions in order)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">Maximum Daily Messages</Label>
            <p className="text-sm text-muted-foreground">
              Set a limit on how many messages to send per day
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min="1"
                className="w-20"
                value={maxDailyMessagesInput}
                onChange={handleMaxDailyMessagesChange}
                onBlur={() => {
                  const value = parseInt(maxDailyMessagesInput);
                  if (!isNaN(value) && value >= 1) {
                    setMaxDailyMessages(value);
                  } else {
                    setMaxDailyMessagesInput(maxDailyMessages.toString());
                  }
                }}
              />
              <span className="text-sm">messages per day</span>
            </div>
            <Slider 
              value={[maxDailyMessages]} 
              min={10} 
              max={500} 
              step={1} 
              onValueChange={(value) => {
                setMaxDailyMessages(value[0]);
                setMaxDailyMessagesInput(value[0].toString());
              }} 
              className="mt-2"
            />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">WhatsApp Sessions</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Select which WhatsApp accounts will be used to send messages
            </p>
            
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="select-all" 
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Select All</Label>
            </div>
            
            <div className="space-y-2">
              {availableSessions.map((session: WhatsAppSession) => (
                <div 
                  key={session.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    session.status === 'connected' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {session.status === 'connected' && (
                      <Checkbox 
                        id={`session-${session.id}`}
                        checked={activeSessions.includes(session.id)}
                        onCheckedChange={() => toggleSession(session.id)}
                      />
                    )}
                    <div>
                      <p className="font-medium">{session.name}</p>
                      <p className="text-xs text-muted-foreground">{session.phone || 'No phone number'}</p>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    session.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {session.status}
                  </div>
                </div>
              ))}
              
              {availableSessions.length === 0 && !isLoading && (
                <div className="p-4 text-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">No WhatsApp sessions available</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.href = '/dashboard/sessions'}
                  >
                    Add WhatsApp Session
                  </Button>
                </div>
              )}
              
              {isLoading && (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">Loading sessions...</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Settings Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Schedule Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="schedule-enabled" 
                  checked={scheduleEnabled} 
                  onCheckedChange={setScheduleEnabled} 
                />
                <div>
                  <Label htmlFor="schedule-enabled" className="font-medium">Schedule sending for later</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a specific date and time to start sending messages
                  </p>
                </div>
              </div>
              
              {scheduleEnabled && (
                <div className="pl-7 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-date">Date</Label>
                      <Input 
                        id="schedule-date" 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input 
                        id="schedule-time" 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <TimezoneSelector 
                    value={timezone} 
                    onChange={setTimezone}
                    showCurrentTime={true}
                  />
                  
                  {scheduleDate && scheduleTime && (
                    <div className="text-sm text-muted-foreground">
                      Messages will be sent {format(new Date(`${scheduleDate}T${scheduleTime}`), "PP 'at' p")} ({timezone})
                    </div>
                  )}
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Advanced Time Slots</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateBusinessWeekSchedule}
                      >
                        Generate Business Week Schedule
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Define specific time slots when messages can be sent
                    </p>
                    
                    <div className="space-y-2">
                      <Label>Active Time Slots</Label>
                      
                      {timeSlots.length === 0 ? (
                        <div className="p-3 border rounded-md text-sm text-muted-foreground">
                          No time slots added. Messages will be sent at any time.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {timeSlots.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between p-2 border rounded-md">
                              <span>{slot.startTime} - {slot.endTime}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTimeSlot(slot.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input 
                            id="start-time" 
                            type="time" 
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input 
                            id="end-time" 
                            type="time" 
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="secondary"
                            onClick={handleAddTimeSlot}
                            className="mb-0.5"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
