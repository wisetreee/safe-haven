import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";

interface PersonalInfoStepProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  people: string;
  setPeople: (people: string) => void;
  specialNeeds: string;
  setSpecialNeeds: (needs: string) => void;
  isLoggedIn: boolean;
  formErrors: {[key: string]: string | undefined};
}

export function PersonalInfoStep({
  name,
  setName,
  phone,
  setPhone,
  people,
  setPeople,
  specialNeeds,
  setSpecialNeeds,
  isLoggedIn,
  formErrors
}: PersonalInfoStepProps) {
  return (
    <div className="booking-step active">
      <h3 className="font-medium mb-3">Ваша информация</h3>
      {isLoggedIn ? (
        <div className="bg-green-50 p-3 rounded-md mb-4">
          <p className="text-sm text-green-800">
            ✓ Данные заполнены из вашего аккаунта. Вы можете изменить их при необходимости.
          </p>
        </div>
      ) : (
        <p className="text-sm text-secondary mb-4">
          Эта информация конфиденциальна и будет использована только для бронирования.
        </p>
      )}
      
      <div className="space-y-3 mb-4">
        <div>
          <Label className="mb-1">Имя</Label>
          <Input 
            type="text" 
            placeholder="Введите ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && <span className="text-red-500 text-sm">{formErrors.name}</span>}
        </div>
        <div>
          <Label className="mb-1">Телефон</Label>
          <Input 
            type="tel" 
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={formErrors.phone ? "border-red-500" : ""}
          />
          {formErrors.phone && <span className="text-red-500 text-sm">{formErrors.phone}</span>}
        </div>
        <div>
          <Label className="mb-1">Количество человек</Label>
          <Select value={people} onValueChange={setPeople}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите количество человек" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 человек</SelectItem>
              <SelectItem value="2">2 человека</SelectItem>
              <SelectItem value="3">3 человека</SelectItem>
              <SelectItem value="4">4 человека</SelectItem>
              <SelectItem value="5">5+ человек</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Особые потребности</Label>
          <Textarea 
            placeholder="Особые потребности или важная информация (необязательно)"
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}