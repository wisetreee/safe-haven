import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Calendar, Home as HomeIcon, Phone, MessageSquare, Search } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { Booking, BookingStatus } from "@/lib/types";

// Function to check booking status by booking number and phone
async function checkBookingStatus(bookingNumber: string, phone: string): Promise<Booking | null> {
  try {
    const response = await fetch(`/api/bookings/check?bookingNumber=${encodeURIComponent(bookingNumber)}&phone=${encodeURIComponent(phone)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Бронирование не найдено");
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking booking:", error);
    return null;
  }
}

export function BookingStatusCard() {
  const [bookingNumber, setBookingNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [guestName, setGuestName] = useState("");
  const { toast } = useToast();

  const handleCheckStatus = async () => {
    if (!bookingNumber || !phone) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите номер бронирования и телефон",
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkBookingStatus(bookingNumber, phone);
      if (result) {
        setBooking(result);
        setGuestName(result.guestName);
      } else {
        toast({
          variant: "destructive",
          title: "Бронирование не найдено",
          description: "Пожалуйста, проверьте введенные данные и попробуйте снова",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить статус бронирования",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Ожидает подтверждения
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Подтверждено
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Отменено
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Проверка статуса бронирования</CardTitle>
      </CardHeader>
      <CardContent>
        {!booking ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="bookingNumber" className="text-sm font-medium">
                  Номер бронирования
                </label>
                <Input
                  id="bookingNumber"
                  placeholder="Введите номер бронирования"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Номер телефона
                </label>
                <Input
                  id="phone"
                  placeholder="Введите номер телефона"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button disabled={isChecking} onClick={handleCheckStatus}>
                {isChecking ? "Проверка..." : "Проверить статус"}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-semibold">{booking.housingName}</h3>
                <p className="text-sm text-muted-foreground">{booking.location}</p>
              </div>
              <div>{getStatusBadge(booking.status)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Даты</h4>
                    <p className="text-sm">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Информация о госте</h4>
                    <p className="text-sm">
                      {booking.guestName} • {booking.guestCount} чел.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="w-full">
                  <h4 className="text-sm font-medium mb-2">Связаться с персоналом</h4>
                  <Separator className="my-3" />
                  <ChatInterface booking={booking} userName={guestName} isStaff={false} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setBooking(null);
                  setBookingNumber("");
                  setPhone("");
                }}
              >
                Проверить другое бронирование
              </Button>
              {booking.status === "pending" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Вы уверены, что хотите отменить это бронирование?")) {
                      fetch(`/api/bookings/${booking.id}/cancel`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      })
                        .then((response) => {
                          if (response.ok) {
                            toast({
                              title: "Бронирование отменено",
                              description: "Ваше бронирование было успешно отменено",
                            });
                            setBooking({
                              ...booking,
                              status: "cancelled",
                            });
                          } else {
                            throw new Error("Не удалось отменить бронирование");
                          }
                        })
                        .catch((error) => {
                          toast({
                            variant: "destructive",
                            title: "Ошибка",
                            description: error.message,
                          });
                        });
                    }
                  }}
                >
                  Отменить бронирование
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}