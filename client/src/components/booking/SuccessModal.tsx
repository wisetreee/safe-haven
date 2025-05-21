import { Check, Phone, Mail, User, Key } from "lucide-react";

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  bookingId?: number;
  bookingNumber?: string;
  accountInfo?: {
    username: string;
    password: string;
  };
}

export default function SuccessModal({ 
  show, 
  onClose,
  bookingId, 
  bookingNumber,
  accountInfo
}: SuccessModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <div className="mb-4 text-green-500 flex justify-center">
          <Check className="h-16 w-16" />
        </div>
        <h3 className="text-xl font-medium mb-2">Бронирование подтверждено!</h3>
        <p className="text-secondary mb-4">
          Ваша заявка на бронирование принята. В ближайшее время с вами свяжется координатор для уточнения деталей.
        </p>
        <p className="text-sm text-secondary mb-4">
          Номер бронирования: <span className="font-medium">{bookingNumber || `BR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`}</span>
        </p>
        
        {accountInfo && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 text-left">
            <h4 className="font-medium text-yellow-800 mb-2">Данные для входа в аккаунт</h4>
            <p className="text-sm mb-1">
              <User className="h-4 w-4 inline-block text-yellow-600 mr-2" /> 
              Имя пользователя: <span className="font-medium">{accountInfo.username}</span>
            </p>
            <p className="text-sm mb-2">
              <Key className="h-4 w-4 inline-block text-yellow-600 mr-2" /> 
              Пароль: <span className="font-medium">{accountInfo.password}</span>
            </p>
            <p className="text-xs text-gray-600">
              Сохраните эту информацию. Она потребуется для входа в систему и доступа к вашим бронированиям.
            </p>
          </div>
        )}
        
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-left">
          <p className="text-sm mb-1">
            <Phone className="h-4 w-4 inline-block text-accent mr-2" /> 
            Телефон экстренной связи: <span className="font-medium">+7 (800) 123-45-67</span>
          </p>
          <p className="text-sm">
            <Mail className="h-4 w-4 inline-block text-accent mr-2" /> 
            Email для вопросов: <span className="font-medium">help@безопасныйдом.рф</span>
          </p>
        </div>
        <button 
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 w-full"
          onClick={onClose}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
