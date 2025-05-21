import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Booking, Message, SendMessageRequest, UserRole } from "@/lib/types";

interface ChatInterfaceProps {
  booking: Booking;
  userName?: string; // For guest users
  isStaff?: boolean;
}

export function ChatInterface({ booking, userName, isStaff = false }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: userName || booking.guestName,
    isStaff
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user if logged in (for staff)
  const { data: authData } = useQuery<{user: any}>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isStaff
  });
  
  // Update userInfo if authData changes
  useEffect(() => {
    if (authData?.user && isStaff) {
      setUserInfo({
        name: authData.user.name,
        isStaff: true
      });
    }
  }, [authData, isStaff]);

  // Fetch message history
  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['/api/bookings', booking.id, 'messages'],
    enabled: !!booking,
    refetchInterval: 10000 // Auto-refresh every 10 seconds
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
    
    const messageData: SendMessageRequest = {
      bookingId: booking.id,
      senderId: isStaff && authData?.user ? authData.user.id : 0,
      senderName: userInfo.name,
      senderRole: isStaff ? 'staff' as UserRole : 'user' as UserRole,
      content: message.trim()
    };
    
    // Send message via API
    sendMessageMutation.mutate(messageData);
  };

  // Group messages by date
  const groupedMessages: Record<string, Message[]> = {};
  messages.forEach((msg: Message) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex flex-col h-[400px] md:h-[550px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Переписка по бронированию #{booking.bookingNumber}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <ScrollArea className="flex-grow pr-4 border rounded-md mb-3 p-3">
        {isLoading && messages.length === 0 ? (
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
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 mt-1">
                  <Separator className="flex-grow" />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(date), 'd MMMM', { locale: ru })}
                  </span>
                  <Separator className="flex-grow" />
                </div>
                
                {msgs.map((msg: Message) => {
                  const isCurrentUser = 
                    (isStaff && msg.senderRole === 'staff') || 
                    (!isStaff && msg.senderRole === 'user');
                  const isSystemMessage = msg.senderName === "Система";
                  
                  if (isSystemMessage) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="max-w-[90%] rounded-lg px-3 py-1.5 bg-muted/50 text-xs text-center">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }
                  
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
                            {msg.senderRole === 'staff' && !isStaff && (
                              <span className="ml-1 text-xs opacity-80">(сотрудник)</span>
                            )}
                          </span>
                          <span className="text-xs opacity-70">
                            {format(new Date(msg.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form 
        className="flex items-center gap-2"
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