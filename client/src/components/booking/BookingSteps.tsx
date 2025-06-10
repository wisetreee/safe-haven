import { User, Calendar, Check } from "lucide-react";

interface BookingStepsProps {
  currentStep: number;
  isLoggedIn: boolean;
}

export function BookingSteps({ currentStep, isLoggedIn }: BookingStepsProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
            <User className="h-4 w-4" />
          </div>
          <span className={`text-xs ${currentStep >= 1 ? 'text-accent' : 'text-gray-500'}`}>Информация</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
           <div className="h-1 bg-accent" style={{ width: currentStep >= 2 ? '100%' : '0%' }}></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
            <Calendar className="h-4 w-4" />
          </div>
          <span className={`text-xs ${currentStep >= 2 ? 'text-accent' : 'text-gray-500'}`}>Даты</span>
        </div>
        
        {/* Show account step only for non-logged-in users */}
        {!isLoggedIn && (
          <>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-1 bg-accent" style={{ width: currentStep >= 3 ? '100%' : '0%' }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
                <User className="h-4 w-4" />
              </div>
              <span className={`text-xs ${currentStep >= 3 ? 'text-accent' : 'text-gray-500'}`}>Аккаунт</span>
            </div>
          </>
        )}
        
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className="h-1 bg-accent" style={{ width: (isLoggedIn ? currentStep >= 3 : currentStep >= 4) ? '100%' : '0%' }}></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 ${(isLoggedIn ? currentStep >= 3 : currentStep >= 4) ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
            <Check className="h-4 w-4" />
          </div>
          <span className={`text-xs ${(isLoggedIn ? currentStep >= 3 : currentStep >= 4) ? 'text-accent' : 'text-gray-500'}`}>Подтверждение</span>
        </div>
      </div>
    </div>
  );
}