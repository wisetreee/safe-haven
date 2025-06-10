import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateSelectionStepProps {
  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;
  formErrors: {[key: string]: string | undefined};
}

export function DateSelectionStep({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  formErrors
}: DateSelectionStepProps) {
  return (
    <div className="booking-step active">
      <h3 className="font-medium mb-3">Выберите даты</h3>
      <p className="text-sm text-secondary mb-4">
        Укажите даты вашего предполагаемого проживания.
      </p>
      
      <div className="space-y-3 mb-4">
        <div>
          <Label className="mb-1">Дата заезда</Label>
          <Input 
            type="date" 
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={formErrors.checkIn ? "border-red-500" : ""}
          />
          {formErrors.checkIn && <span className="text-red-500 text-sm">{formErrors.checkIn}</span>}
        </div>
        <div>
          <Label className="mb-1">Дата выезда</Label>
          <Input 
            type="date" 
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={formErrors.checkOut ? "border-red-500" : ""}
          />
          {formErrors.checkOut && <span className="text-red-500 text-sm">{formErrors.checkOut}</span>}
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md text-sm">
        <p className="font-medium mb-1">💡 Важная информация</p>
        <p>Проживание предоставляется на временной основе. Стандартный период - от нескольких дней до нескольких недель.</p>
      </div>
    </div>
  );
}