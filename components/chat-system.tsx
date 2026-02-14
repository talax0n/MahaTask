'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/use-chat';
import { useSocial } from '@/hooks/use-social';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Hash, Search, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ChatSystemProps {
  userId: string;
}

export function ChatSystem({ userId }: ChatSystemProps) {
  const { 
    groups, 
    createGroup, 
    refreshGroups 
  } = useSocial();
  
  const { 
    messages, 
    loadGroupMessages, 
    sendMessage, 
    loading: chatLoading 
  } = useChat();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  // Load messages when group changes
  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMessages(selectedGroupId);
    }
  }, [selectedGroupId, loadGroupMessages]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    const group = await createGroup({ name: newGroupName });
    if (group) {
      setNewGroupName('');
      setIsCreateGroupOpen(false);
      setSelectedGroupId(group.id);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (selectedGroupId) {
      await sendMessage(content, selectedGroupId);
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-4 p-4 overflow-hidden">
      {/* Sidebar - Groups List */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 flex flex-col gap-4 bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a study group to collaborate with your peers.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. CS101 Study Group"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No groups found
              </div>
            ) : (
              filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                    selectedGroupId === group.id 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "hover:bg-secondary/50 text-foreground/80 hover:text-foreground"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarFallback className={cn(
                      "text-xs font-medium",
                      selectedGroupId === group.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}>
                      {group.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group.members?.length || 0} members
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-sm overflow-hidden relative"
      >
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-background/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedGroup.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg leading-none">{selectedGroup.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Active now
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 {/* Additional header actions can go here */}
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Users className="h-5 w-5" />
                 </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
                <ChatMessages 
                    messages={messages} 
                    currentUserId={userId} 
                    isLoading={chatLoading} 
                />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/40 backdrop-blur-md border-t border-border/40">
              <ChatInput onSend={handleSendMessage} isLoading={chatLoading} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">No Chat Selected</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a group from the sidebar to start chatting or create a new one to invite your friends.
              </p>
            </div>
            <Button onClick={() => setIsCreateGroupOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Group
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}