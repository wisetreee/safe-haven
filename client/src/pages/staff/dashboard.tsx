import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  User,
  Calendar,
  Home as HomeIcon,
  Phone 
} from "lucide-react";

import { Booking, BookingStatus } from "@/lib/types";
import { ChatInterface } from "../../components/booking/ChatInterface";

export default function StaffDashboard() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const queryClient = useQueryClient();
  
  // Check if user is logged in and is staff
  const { data: authData, isLoading: authLoading } = useQuery<{user: any}>({
    queryKey: ['/api/auth/current-user'],
    retry: false
  });
  
  const currentUser = authData?.user;
  const isStaff = currentUser && currentUser.role === 'staff';
  
  // Fetch all bookings for staff
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/staff/bookings'],
    enabled: !!isStaff,
  });
  
  // If user is not authenticated or not staff, redirect to home
  if (!authLoading && !isStaff) {
    return <Redirect to="/" />;
  }
  
  const filteredBookings = bookings?.filter((booking: Booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  }) || [];
  
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Ожидает</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Подтверждено</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Отменено</Badge>;
      default:
        return null;
    }
  };
  
  if (authLoading || bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-t-accent rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Панель управления</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Бронирования</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="pending" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Ожидают ({
                    bookings.filter(b => b.status === 'pending').length || 0
                  })</TabsTrigger>
                  <TabsTrigger value="confirmed">Подтвержденные ({
                    bookings.filter(b => b.status === 'confirmed').length || 0
                  })</TabsTrigger>
                  <TabsTrigger value="cancelled">Отмененные ({
                    bookings.filter(b => b.status === 'cancelled').length || 0
                  })</TabsTrigger>
                  <TabsTrigger value="all">Все ({bookings.length || 0})</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Бронирований не найдено
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking: Booking) => (
                        <div 
                          key={booking.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            selectedBooking?.id === booking.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-border hover:border-accent/50'
                          }`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <h3 className="font-medium">{booking.housingName}</h3>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{booking.bookingNumber}</span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.guestName} • {booking.guestCount} чел.</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.guestPhone}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{new Date(booking.checkIn).toLocaleDateString('ru-RU')} - {new Date(booking.checkOut).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className="flex items-center">
                              <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex mt-3 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Сообщения
                            </Button>
                            
                            {booking.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Implement confirmation functionality
                                    if (confirm("Вы уверены, что хотите подтвердить это бронирование?")) {
                                      fetch(`/api/bookings/${booking.id}/confirm`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include'
                                      })
                                      .then(response => {
                                        if (response.ok) {
                                          // Refresh booking list
                                          queryClient.invalidateQueries({ queryKey: ['/api/staff/bookings'] });
                                        } else {
                                          throw new Error('Не удалось подтвердить бронирование');
                                        }
                                      })
                                      .catch(error => {
                                        console.error('Error confirming booking:', error);
                                        alert('Ошибка: ' + error.message);
                                      });
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Подтвердить
                                </Button>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const reason = prompt("Укажите причину отклонения (необязательно):");
                                    if (confirm("Вы уверены, что хотите отклонить это бронирование?")) {
                                      fetch(`/api/bookings/${booking.id}/reject`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({ reason })
                                      })
                                      .then(response => {
                                        if (response.ok) {
                                          // Refresh booking list
                                          queryClient.invalidateQueries({ queryKey: ['/api/staff/bookings'] });
                                        } else {
                                          throw new Error('Не удалось отклонить бронирование');
                                        }
                                      })
                                      .catch(error => {
                                        console.error('Error rejecting booking:', error);
                                        alert('Ошибка: ' + error.message);
                                      });
                                    }
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {selectedBooking ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Информация и чат
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Информация о госте</h3>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        <div className="flex items-start space-x-2">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>{selectedBooking.guestName}</p>
                            <p className="text-muted-foreground">{selectedBooking.guestPhone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Статус</h3>
                      <div className="p-3 bg-muted rounded-md text-sm flex items-center space-x-2">
                        {getStatusBadge(selectedBooking.status)}
                        <div className="ml-2">
                          <p>Бронирование #{selectedBooking.bookingNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Детали бронирования</h3>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>Даты: {new Date(selectedBooking.checkIn).toLocaleDateString()} - {new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <HomeIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p>{selectedBooking.housingName}</p>
                            <p className="text-muted-foreground">{selectedBooking.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-1">
                    <Separator className="my-4" />
                    <ChatInterface booking={selectedBooking} isStaff={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Выберите бронирование, чтобы увидеть детали</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}