import { Housing } from "@/lib/types";

interface ConfirmationStepProps {
  housing: Housing;
  name: string;
  phone: string;
  people: string;
  checkIn: string;
  checkOut: string;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  crisisAcknowledged: boolean;
  setCrisisAcknowledged: (acknowledged: boolean) => void;
  formErrors: {[key: string]: string | undefined};
}

export function ConfirmationStep({
  housing,
  name,
  phone,
  people,
  checkIn,
  checkOut,
  termsAccepted,
  setTermsAccepted,
  crisisAcknowledged,
  setCrisisAcknowledged,
  formErrors
}: ConfirmationStepProps) {
  return (
    <div className="booking-step active">
      <h3 className="font-medium mb-3">Подтверждение бронирования</h3>
      <p className="text-sm text-secondary mb-4">
        Пожалуйста, проверьте информацию перед подтверждением бронирования.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium mb-2">Детали бронирования</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary">Место</span>
            <span className="font-medium">{housing.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Адрес</span>
            <span className="font-medium">{housing.location} (точный адрес будет отправлен после подтверждения)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Даты</span>
            <span className="font-medium">{checkIn} - {checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Количество человек</span>
            <span className="font-medium">{people} человек</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Контактное лицо</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Телефон</span>
            <span className="font-medium">{phone}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium mb-2">Важная информация</h4>
        <ul className="space-y-1 text-sm">
          <li className="flex">
            <span className="text-blue-600 mt-1 mr-2">•</span>
            <span>После подтверждения бронирования вам позвонит координатор для уточнения деталей.</span>
          </li>
          <li className="flex">
            <span className="text-blue-600 mt-1 mr-2">•</span>
            <span>Точный адрес будет сообщен только после подтверждения бронирования для обеспечения безопасности.</span>
          </li>
          <li className="flex">
            <span className="text-blue-600 mt-1 mr-2">•</span>
            <span>Проживание бесплатное, но мы просим бережно относиться к имуществу.</span>
          </li>
        </ul>
      </div>
      
      <div className="mb-4">
        <div className="flex items-start mb-2">
          <div className="flex items-center h-5 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
          </div>
          <label htmlFor="terms" className="ml-2 text-sm">
            Я согласен с <a href="#" className="text-accent hover:underline">правилами проживания</a> и <a href="#" className="text-accent hover:underline">политикой конфиденциальности</a>.
          </label>
        </div>
        {formErrors.termsAccepted && <span className="text-red-500 text-sm">{formErrors.termsAccepted}</span>}
        
        <div className="flex items-start">
          <div className="flex items-center h-5 mt-1">
            <input
              type="checkbox"
              id="crisis"
              checked={crisisAcknowledged}
              onChange={() => setCrisisAcknowledged(!crisisAcknowledged)}
              className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
          </div>
          <label htmlFor="crisis" className="ml-2 text-sm">
            Я подтверждаю, что нахожусь в кризисной ситуации, связанной с домашним насилием, и нуждаюсь в безопасном жилье.
          </label>
        </div>
        {formErrors.crisisAcknowledged && <span className="text-red-500 text-sm">{formErrors.crisisAcknowledged}</span>}
      </div>
    </div>
  );
}