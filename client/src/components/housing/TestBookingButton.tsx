import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { SAMPLE_HOUSINGS } from '@/lib/constants';
import { BookingRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function TestBookingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      return apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: () => {
      setIsLoading(false);
      // Force immediate invalidation and refetch of bookings
      queryClient.invalidateQueries({ 
        queryKey: ['/api/bookings'],
        refetchType: 'all'
      });
      toast({
        title: "Бронирование создано",
        description: "Ваше бронирование было успешно создано!",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Ошибка бронирования",
        description: "Не удалось создать бронирование. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error("Booking error:", error);
    }
  });

  const createTestBooking = () => {
    setIsLoading(true);
    
    // Use the first available housing from the sample data
    const housing = SAMPLE_HOUSINGS.find(h => h.availability === 'available');
    
    if (!housing) {
      toast({
        title: "Нет доступного жилья",
        description: "Не найдено доступное жилье для тестового бронирования.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Create a test booking request
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const bookingRequest = {
      housingId: housing.id,
      housingName: housing.name, // Add this field
      location: housing.location, // Add this field
      checkIn: today.toISOString().split('T')[0],
      checkOut: nextWeek.toISOString().split('T')[0],
      guestName: "Тестовый Пользователь",
      guestPhone: "+79001234567",
      guestCount: 2,
      specialNeeds: "Тестовое бронирование",
      status: "pending" // Add this field
    };
    
    // Submit the booking request
    createBookingMutation.mutate(bookingRequest);
  };

  return (
    <Button 
      onClick={createTestBooking}
      disabled={isLoading}
      className="mb-4 bg-accent"
    >
      {isLoading ? 'Создание...' : 'Создать тестовое бронирование'}
    </Button>
  );
}