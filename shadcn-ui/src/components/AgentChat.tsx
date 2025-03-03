// src/components/AgentChat.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  id: number;
  agent: string;
  content: string;
  timestamp: Date;
}

export const AgentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      agent: 'Naruto',
      content: 'Hello! I am your Team Leader. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        agent: 'User',
        content: input,
        timestamp: new Date(),
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 mb-4",
              message.agent === 'User' && "flex-row-reverse"
            )}
          >
            <Avatar className="w-8 h-8">
              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                {message.agent[0]}
              </div>
            </Avatar>
            <div className={cn(
              "rounded-lg p-3 max-w-[80%]",
              message.agent === 'User' ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <div className="font-medium mb-1">{message.agent}</div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
};