'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  LogOut, 
  Mail, 
  Globe, 
  Smartphone,
  Laptop,
  Moon,
  Sun
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'account' | 'appearance' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your public profile' },
    { id: 'account', label: 'Account', icon: Settings, description: 'Security and account settings' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the interface' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push notifications' },
  ];

  return (
    <div className="container max-w-6xl py-6 lg:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      
      <Separator />

      <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0 space-y-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                    activeTab === item.id 
                      ? "bg-secondary text-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 lg:max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>
                        This is how others will see you on the site.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="/avatars/01.png" alt="@user" />
                          <AvatarFallback className="text-lg">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" defaultValue={user?.username || 'user_demo'} />
                          <p className="text-[0.8rem] text-muted-foreground">
                            This is your public display name. It can be your real name or a pseudonym.
                          </p>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input id="bio" placeholder="Tell us a little bit about yourself" />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user?.email || 'user@example.com'} disabled />
                          <p className="text-[0.8rem] text-muted-foreground">
                            You can manage verified email addresses in your <button className="text-primary hover:underline" onClick={() => setActiveTab('account')}>email settings</button>.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Update your account settings. Set your preferred language and timezone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground">
                          This is the language that will be used in the dashboard.
                        </p>
                      </div>
                      
                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Danger Zone</h3>
                        <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/10">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-destructive">Delete Account</p>
                              <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all of your content.
                              </p>
                            </div>
                            <Button variant="destructive" size="sm">Delete Account</Button>
                          </div>
                        </div>
                        
                        <div className="border border-border rounded-lg p-4">
                           <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Sign Out</p>
                              <p className="text-sm text-muted-foreground">
                                Sign out of your account on this device.
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={logout}>
                               <LogOut className="mr-2 h-4 w-4" />
                               Sign Out
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize the appearance of the app. Automatically switch between day and night themes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div 
                            className={cn(
                              "cursor-pointer items-center rounded-md border-2 p-1 hover:bg-accent hover:text-accent-foreground",
                              theme === 'light' ? "border-primary" : "border-muted"
                            )}
                            onClick={() => setTheme('light')}
                          >
                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                            </div>
                            <span className="block w-full p-2 text-center font-normal">Light</span>
                          </div>
                          <div 
                            className={cn(
                              "cursor-pointer items-center rounded-md border-2 p-1 hover:bg-accent hover:text-accent-foreground",
                              theme === 'dark' ? "border-primary" : "border-muted"
                            )}
                            onClick={() => setTheme('dark')}
                          >
                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                            </div>
                            <span className="block w-full p-2 text-center font-normal">Dark</span>
                          </div>
                          <div 
                            className={cn(
                              "cursor-pointer items-center rounded-md border-2 p-1 hover:bg-accent hover:text-accent-foreground",
                              theme === 'system' ? "border-primary" : "border-muted"
                            )}
                            onClick={() => setTheme('system')}
                          >
                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                            </div>
                            <span className="block w-full p-2 text-center font-normal">System</span>
                          </div>
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                          Select the theme for the dashboard.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>
                        Configure how you receive notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Email Notifications</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="marketing" className="flex flex-col space-y-1">
                              <span>Marketing emails</span>
                              <span className="font-normal text-muted-foreground">Receive emails about new products, features, and more.</span>
                            </Label>
                            <Switch id="marketing" />
                          </div>
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="social" className="flex flex-col space-y-1">
                              <span>Social emails</span>
                              <span className="font-normal text-muted-foreground">Receive emails for friend requests, follows, and more.</span>
                            </Label>
                            <Switch id="social" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="security" className="flex flex-col space-y-1">
                              <span>Security emails</span>
                              <span className="font-normal text-muted-foreground">Receive emails about your account activity and security.</span>
                            </Label>
                            <Switch id="security" defaultChecked disabled />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}