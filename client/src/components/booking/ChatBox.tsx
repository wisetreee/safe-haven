import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Booking, Message, SendMessageRequest, UserRole } from "@/lib/types";

interface ChatBoxProps {
  booking: Booking;
}

export function ChatBox({ booking }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user (if logged in)
  const { data: authData } = useQuery<{user: any}>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false
  });
  
  const currentUser = authData?.user;
  const isStaff = currentUser && currentUser.role === 'staff';

  // Fetch message history
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/bookings', booking.id, 'messages'],
    enabled: !!booking,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessageRequest) => {
      return await apiRequest(`/api/bookings/${booking.id}/messages`, 'POST', messageData);
    },
    onSuccess: () => {
      // Clear input field
      setMessage("");
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', booking.id, 'messages'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить сообщение. Попробуйте еще раз."
      });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Determine sender info based on authentication
    let senderName = isStaff && currentUser
      ? currentUser.name 
      : booking.guestName;
    
    let senderId = isStaff && currentUser ? currentUser.id : 0;
    let senderRole = isStaff ? ('staff' as UserRole) : ('user' as UserRole);
    
    const messageData: SendMessageRequest = {
      bookingId: booking.id,
      senderId,
      senderName,
      senderRole,
      content: message.trim()
    };
    
    // Send message via API
    sendMessageMutation.mutate(messageData);
  };

  return (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-grow pr-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-t-accent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            <div>
              <p>Сообщений пока нет</p>
              <p className="text-sm mt-1">Начните общение по поводу бронирования</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg: Message) => {
              const isCurrentUser = 
                (isStaff && msg.senderRole === 'staff') || 
                (!isStaff && msg.senderRole === 'user');
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[80%] rounded-lg px-4 py-2 
                      ${isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">
                        {msg.senderName}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form 
        className="mt-4 flex items-center gap-2"
        onSubmit={handleSendMessage}
      >
        <Input
          placeholder="Напишите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sendMessageMutation.isPending}
          className="flex-grow"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || sendMessageMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}