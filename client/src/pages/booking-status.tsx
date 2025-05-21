import { BookingStatusCard } from "@/components/booking/BookingStatusCard";

export default function BookingStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Управление бронированием</h1>
      <div className="max-w-4xl mx-auto">
        <BookingStatusCard />
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Для проверки статуса бронирования введите номер бронирования и телефон, указанный при бронировании.</p>
        <p className="mt-2">Здесь вы можете связаться с персоналом или отменить свое бронирование.</p>
      </div>
    </div>
  );
}