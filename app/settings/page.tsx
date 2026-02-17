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
  Sun,
  Camera
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

type SettingsTab = 'profile' | 'account' | 'appearance' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Signed out", {
      description: "You have been successfully signed out.",
    });
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your public profile' },
    { id: 'account', label: 'Account', icon: Settings, description: 'Security and account settings' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the interface' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push notifications' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-6xl py-6 lg:py-10 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">Settings</h1>
          <p className="text-white/60 text-lg">
            Manage your account preferences and customize your experience.
          </p>
        </div>
        
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />

        <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0 space-y-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden group whitespace-nowrap",
                      isActive 
                        ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-300" : "text-white/40 group-hover:text-white/70")} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 lg:max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                {activeTab === 'profile' && (
                  <div className="glass-panel rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                      <h2 className="text-2xl font-bold text-white">Public Profile</h2>
                      <p className="text-white/50">This is how others will see you on the site.</p>
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                      <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white/10 shadow-2xl ring-4 ring-black/20">
                          <AvatarImage src="/avatars/01.png" alt="@user" />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">{user?.name || 'User'}</h3>
                        <div className="flex gap-2">
                           <Button variant="outline" className="glass-button h-9 text-xs border-white/20 bg-white/5 hover:bg-white/10">Change Avatar</Button>
                           <Button variant="ghost" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9">Remove</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6 max-w-xl relative z-10">
                      <div className="grid gap-2">
                        <Label htmlFor="username" className="text-white/80">Username</Label>
                        <Input 
                          id="username" 
                          defaultValue={user?.name || 'user_demo'} 
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                        />
                        <p className="text-[0.8rem] text-white/40">
                          This is your public display name. It can be your real name or a pseudonym.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="bio" className="text-white/80">Bio</Label>
                        <Input 
                          id="bio" 
                          placeholder="Tell us a little bit about yourself" 
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user?.email || 'user@example.com'} 
                          disabled 
                          className="bg-white/5 border-white/5 text-white/50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25">Save changes</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="glass-panel rounded-[2.5rem] p-8 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                      <p className="text-white/50">Update your account settings. Set your preferred language and timezone.</p>
                    </div>

                    <div className="grid gap-2 max-w-md">
                      <Label htmlFor="language" className="text-white/80">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl text-white">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="h-[1px] bg-white/10 w-full" />

                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-400" />
                        Danger Zone
                      </h3>
                      <div className="border border-red-500/20 rounded-2xl p-6 bg-red-500/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-red-400">Delete Account</p>
                            <p className="text-sm text-red-200/50">
                              Permanently delete your account and all of your content.
                            </p>
                          </div>
                          <Button variant="destructive" size="sm" className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30">Delete Account</Button>
                        </div>
                      </div>
                      
                      <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
                         <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-white">Sign Out</p>
                            <p className="text-sm text-white/50">
                              Sign out of your account on this device.
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleLogout} className="glass-button border-white/20">
                             <LogOut className="mr-2 h-4 w-4" />
                             Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="glass-panel rounded-[2.5rem] p-8 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Appearance</h2>
                      <p className="text-white/50">Customize the interface. Automatically switch between day and night themes.</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-white/80">Theme Preference</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div 
                          className={cn(
                            "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 flex flex-col items-center gap-3",
                            theme === 'light' 
                              ? "border-blue-400 bg-white/10 shadow-[0_0_20px_rgba(96,165,250,0.2)]" 
                              : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                          )}
                          onClick={() => setTheme('light')}
                        >
                          <div className="p-4 rounded-full bg-white text-black mb-2 shadow-lg">
                            <Sun className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white">Light</span>
                        </div>
                        <div 
                          className={cn(
                            "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 flex flex-col items-center gap-3",
                            theme === 'dark' 
                              ? "border-blue-400 bg-white/10 shadow-[0_0_20px_rgba(96,165,250,0.2)]" 
                              : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                          )}
                          onClick={() => setTheme('dark')}
                        >
                          <div className="p-4 rounded-full bg-slate-950 text-white mb-2 shadow-lg border border-white/10">
                            <Moon className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white">Dark</span>
                        </div>
                        <div 
                          className={cn(
                            "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 flex flex-col items-center gap-3",
                            theme === 'system' 
                              ? "border-blue-400 bg-white/10 shadow-[0_0_20px_rgba(96,165,250,0.2)]" 
                              : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                          )}
                          onClick={() => setTheme('system')}
                        >
                          <div className="p-4 rounded-full bg-gradient-to-br from-white to-slate-900 text-slate-800 mb-2 shadow-lg">
                            <Laptop className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white">System</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="glass-panel rounded-[2.5rem] p-8 space-y-8">
                     <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Notifications</h2>
                      <p className="text-white/50">Configure how you receive alerts and updates.</p>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider">Email Preferences</h4>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Label htmlFor="marketing" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="text-white font-medium">Marketing emails</span>
                            <span className="font-normal text-white/50 text-sm">Receive emails about new products, features, and more.</span>
                          </Label>
                          <Switch id="marketing" className="data-[state=checked]:bg-blue-500" />
                        </div>
                        <div className="flex items-center justify-between space-x-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Label htmlFor="social" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="text-white font-medium">Social emails</span>
                            <span className="font-normal text-white/50 text-sm">Receive emails for friend requests, follows, and more.</span>
                          </Label>
                          <Switch id="social" defaultChecked className="data-[state=checked]:bg-blue-500" />
                        </div>
                        <div className="flex items-center justify-between space-x-2 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-70">
                          <Label htmlFor="security" className="flex flex-col space-y-1">
                            <span className="text-white font-medium">Security emails</span>
                            <span className="font-normal text-white/50 text-sm">Receive emails about your account activity and security.</span>
                          </Label>
                          <Switch id="security" defaultChecked disabled className="data-[state=checked]:bg-green-500/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}