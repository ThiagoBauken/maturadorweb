
import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, Globe, Lock, User, Shield } from 'lucide-react';

// Define form schema for account settings
const accountFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." })
});

// Define form schema for security settings
const securityFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your new password." })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  
  // Account form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe",
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReport: true,
    newFeatures: true,
  });

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  // Account form submission
  const onAccountSubmit = (data: z.infer<typeof accountFormSchema>) => {
    toast.success("Account settings saved");
    console.log(data);
  };

  // Security form submission
  const onSecuritySubmit = (data: z.infer<typeof securityFormSchema>) => {
    toast.success("Password changed successfully");
    console.log(data);
    securityForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences" 
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Application</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll use this email to contact you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your username" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public username.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Change</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password should be at least 8 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Change Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h4 className="text-sm font-medium">Email Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.emailAlerts} 
                  onCheckedChange={() => handleNotificationChange('emailAlerts')} 
                />
              </div>
              
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h4 className="text-sm font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your devices
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.pushNotifications} 
                  onCheckedChange={() => handleNotificationChange('pushNotifications')} 
                />
              </div>
              
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h4 className="text-sm font-medium">Weekly Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary reports of your account activities
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.weeklyReport} 
                  onCheckedChange={() => handleNotificationChange('weeklyReport')} 
                />
              </div>
              
              <div className="flex items-center justify-between space-y-1">
                <div>
                  <h4 className="text-sm font-medium">New Features</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new features are released
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.newFeatures} 
                  onCheckedChange={() => handleNotificationChange('newFeatures')} 
                />
              </div>
              
              <Button 
                className="mt-4" 
                onClick={() => toast.success("Notification settings saved")}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Settings */}
        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Manage your application preferences and API settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <Input id="api-key" value="sk_live_xxxxxxxxxxxxxxxxxxxxx" readOnly />
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      navigator.clipboard.writeText("sk_live_xxxxxxxxxxxxxxxxxxxxx");
                      toast.success("API key copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key for integrating with WhatsApp Platform.
                </p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Debug Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging for troubleshooting
                    </p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Data Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically back up your data weekly
                    </p>
                  </div>
                  <Switch id="backup" defaultChecked />
                </div>
              </div>
              
              <Button 
                className="mt-4" 
                onClick={() => toast.success("Application settings saved")}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
