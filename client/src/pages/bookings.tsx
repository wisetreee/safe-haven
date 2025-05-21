import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import TabNavigation from "@/components/layout/TabNavigation";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { Booking } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TestBookingButton from "@/components/housing/TestBookingButton";

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    refetchInterval: 1000, // Automatically refetch every second
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately
  });

  const { toast } = useToast();

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest('POST', `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Бронирование отменено",
        description: "Ваше бронирование было успешно отменено",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отмены",
        description: "Не удалось отменить бронирование. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error("Cancel booking error:", error);
    }
  });

  const cancelBooking = (id: number) => {
    cancelMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pb-20">
        <TabNavigation />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <TabNavigation />
      
      <h1 className="text-2xl font-medium my-4">Мои бронирования</h1>
      
      <TestBookingButton />
      
      <div className="space-y-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{booking.housingName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  booking.status === "confirmed" 
                    ? "bg-green-100 text-green-800" 
                    : booking.status === "pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-red-100 text-red-800"
                }`}>
                  {booking.status === "confirmed" 
                    ? "Подтверждено" 
                    : booking.status === "pending" 
                      ? "Ожидает подтверждения" 
                      : "Отменено"}
                </span>
              </div>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm flex items-center text-secondary">
                    <Calendar className="mr-2 h-4 w-4" />
                    {booking.checkIn} — {booking.checkOut}
                  </p>
                  <p className="text-sm flex items-center text-secondary mt-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    {booking.location}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-secondary mt-1">
                    <strong>Номер бронирования:</strong> {booking.bookingNumber}
                  </p>
                  <p className="text-sm flex items-center text-secondary mt-1">
                    <Clock className="mr-2 h-4 w-4" />
                    Забронировано: {booking.bookingDate}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm">
                  <strong>Контактный телефон:</strong> +7 (800) 123-45-67
                </div>
                
                {booking.status !== "cancelled" && (
                  <button 
                    className="text-red-500 hover:underline text-sm flex items-center"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Отменить бронирование
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="text-secondary mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-xl font-medium">У вас пока нет бронирований</h3>
            </div>
            <p className="text-secondary mb-4">
              Найдите подходящее жилье на карте и забронируйте его
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
