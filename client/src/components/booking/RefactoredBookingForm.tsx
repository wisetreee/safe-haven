import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Housing, BookingRequest, User as UserType } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookingSteps } from "./BookingSteps";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { DateSelectionStep } from "./DateSelectionStep";
import { AccountCreationStep } from "./AccountCreationStep";
import { ConfirmationStep } from "./ConfirmationStep";

interface BookingFormModalProps {
  show: boolean;
  housing: Housing;
  onClose: () => void;
  onConfirm: (bookingInfo?: {
    id?: number;
    bookingNumber?: string;
    accountInfo?: {username: string, password: string};
  }) => void;
}

export default function RefactoredBookingForm({ show, housing, onClose, onConfirm }: BookingFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("1");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string | undefined}>({});
  const [wantAccount, setWantAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const { toast } = useToast();

  // Check for current user session
  const { data: authData, isError } = useQuery<{user: UserType}>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 60000,
  });
  
  const currentUser = authData?.user;
  const isLoggedIn = !!currentUser && !isError;

  // Auto-populate form with user data when logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setCurrentStep(1);
    }
  }, [isLoggedIn, currentUser]);

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      return apiRequest('/api/bookings', 'POST', bookingData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/bookings'],
        refetchType: 'all' 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/auth/current-user'],
        refetchType: 'all' 
      });
      
      toast({
        title: "Бронирование создано",
        description: "Ваше бронирование успешно создано и ожидает подтверждения",
        variant: "default",
      });
      
      onConfirm({
        id: response.id,
        bookingNumber: response.bookingNumber,
        accountInfo: response.account
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка бронирования",
        description: "Не удалось создать бронирование. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error("Booking error:", error);
    }
  });

  const registerUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('/api/auth/register', 'POST', userData);
    },
    onSuccess: (data) => {
      toast({
        title: "Аккаунт создан",
        description: "Ваш аккаунт успешно создан",
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Ошибка регистрации",
        description: "Не удалось создать аккаунт. Возможно, это имя пользователя уже занято.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
      return null;
    }
  });

  const goToStep = (step: number) => {
    if (isLoggedIn && step === 3) {
      setCurrentStep(4);
    } else if (isLoggedIn && currentStep === 2 && step === 4) {
      setCurrentStep(4);
    } else {
      setCurrentStep(step);
    }
  };

  const validateCurrentStep = () => {
    const errors: {[key: string]: string} = {};
    
    if (currentStep === 1) {
      if (!name) errors.name = "Необходимо указать имя";
      if (!phone) errors.phone = "Необходимо указать телефон";
    }
    
    if (currentStep === 2) {
      if (!checkIn) errors.checkIn = "Необходимо выбрать дату заезда";
      if (!checkOut) errors.checkOut = "Необходимо выбрать дату выезда";
    }
    
    if (currentStep === 3 && !isLoggedIn) {
      if (!wantAccount && !hasExistingAccount) {
        errors.accountRequired = "Необходимо либо создать аккаунт, либо войти в существующий";
      }
      
      if (wantAccount) {
        if (!password) errors.password = "Необходимо указать пароль";
        if (password && password.length < 6) errors.password = "Пароль должен содержать минимум 6 символов";
      }
      
      if (hasExistingAccount) {
        if (!loginUsername) errors.loginUsername = "Введите имя пользователя или телефон";
        if (!loginPassword) errors.loginPassword = "Введите пароль";
      }
    }
    
    // Only validate terms on the final confirmation step
    if ((currentStep === 3 && isLoggedIn) || (currentStep === 4 && !isLoggedIn)) {
      if (!termsAccepted) errors.termsAccepted = "Необходимо принять правила проживания";
      if (!crisisAcknowledged) errors.crisisAcknowledged = "Необходимо подтвердить данный пункт";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log("Form submitted:", { currentStep, isLoggedIn, wantAccount, hasExistingAccount, password, loginUsername, loginPassword });
    
    if (!validateCurrentStep()) {
      console.log("Validation failed:", formErrors);
      return;
    }
    
    if (currentStep === 3 && !isLoggedIn && !wantAccount && !hasExistingAccount) {
      setFormErrors({
        ...formErrors,
        accountRequired: "Необходимо либо создать аккаунт, либо войти в существующий"
      });
      return;
    }
    
    const finalStep = isLoggedIn ? 3 : 4;
    if (currentStep < finalStep) {
      goToStep(currentStep + 1);
      return;
    }
    
    try {
      let userId = null;
      
      if (isLoggedIn && currentUser) {
        userId = currentUser.id;
      } 
      else if (wantAccount && password && !hasExistingAccount) {
        try {
          const random = Math.floor(10000 + Math.random() * 90000);
          const phoneUsername = `id${random}`;
          
          const userData = {
            username: phoneUsername,
            password,
            name,
            phone,
            role: "user"
          };
          
          try {
            const result = await registerUserMutation.mutateAsync(userData);
            if (result && result.user && result.user.id) {
              userId = result.user.id;
            }
          } catch (regError) {
            const errorMessage = regError instanceof Error ? regError.message : '';
            
            if (errorMessage.includes('уже занято')) {
              try {
                const loginResult = await apiRequest('/api/auth/login', 'POST', {
                  username: phoneUsername,
                  password: password
                });
                
                if (loginResult && loginResult.user && loginResult.user.id) {
                  userId = loginResult.user.id;
                  toast({
                    title: "Вход выполнен",
                    description: "Бронирование будет привязано к существующему аккаунту",
                    variant: "default",
                  });
                }
              } catch (loginError) {
                console.error("Failed to login with existing account:", loginError);
              }
            } else {
              toast({
                title: "Внимание",
                description: "Не удалось создать аккаунт, но бронирование будет продолжено без привязки к аккаунту",
                variant: "default",
              });
            }
          }
        } catch (error) {
          console.error("Error registering user:", error);
        }
      }
      else if (hasExistingAccount && loginUsername && loginPassword) {
        try {
          const loginResult = await apiRequest('/api/auth/login', 'POST', {
            username: loginUsername,
            password: loginPassword
          });
          
          if (loginResult && loginResult.user && loginResult.user.id) {
            userId = loginResult.user.id;
            
            if (loginResult.user.name && !name) {
              setName(loginResult.user.name);
            }
            
            toast({
              title: "Успешный вход",
              description: "Бронирование будет привязано к вашему аккаунту",
              variant: "default",
            });
            
            queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
          }
        } catch (loginError) {
          console.error("Failed to login with existing account:", loginError);
          toast({
            title: "Ошибка входа",
            description: "Неверное имя пользователя или пароль",
            variant: "destructive",
          });
          
          return;
        }
      }
      
      const bookingRequest: any = {
        housingId: housing.id,
        housingName: housing.name,
        location: housing.location,
        checkIn,
        checkOut,
        guestName: name,
        guestPhone: phone,
        guestCount: parseInt(people || "1"),
        specialNeeds: specialNeeds || undefined,
        status: "pending"
      };
      
      if (typeof userId === 'number') {
        bookingRequest.userId = userId;
      }
      
      console.log("Submitting booking request:", bookingRequest);
      
      createBookingMutation.mutate(bookingRequest);
    } catch (error) {
      console.error("Error preparing booking request:", error);
      toast({
        title: "Ошибка формирования запроса",
        description: "Пожалуйста, проверьте введенные данные и попробуйте снова",
        variant: "destructive",
      });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-medium">Бронирование жилья</h2>
          <button 
            type="button"
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <BookingSteps currentStep={currentStep} isLoggedIn={isLoggedIn} />
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {currentStep === 1 && (
              <PersonalInfoStep
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                people={people}
                setPeople={setPeople}
                specialNeeds={specialNeeds}
                setSpecialNeeds={setSpecialNeeds}
                isLoggedIn={isLoggedIn}
                formErrors={formErrors}
              />
            )}

            {currentStep === 2 && (
              <DateSelectionStep
                checkIn={checkIn}
                setCheckIn={setCheckIn}
                checkOut={checkOut}
                setCheckOut={setCheckOut}
                formErrors={formErrors}
              />
            )}

            {currentStep === 3 && !isLoggedIn && (
              <AccountCreationStep
                wantAccount={wantAccount}
                setWantAccount={setWantAccount}
                hasExistingAccount={hasExistingAccount}
                setHasExistingAccount={setHasExistingAccount}
                password={password}
                setPassword={setPassword}
                loginUsername={loginUsername}
                setLoginUsername={setLoginUsername}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                phone={phone}
                formErrors={formErrors}
              />
            )}

            {((currentStep === 3 && isLoggedIn) || (currentStep === 4 && !isLoggedIn)) && (
              <ConfirmationStep
                housing={housing}
                name={name}
                phone={phone}
                people={people}
                checkIn={checkIn}
                checkOut={checkOut}
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
                crisisAcknowledged={crisisAcknowledged}
                setCrisisAcknowledged={setCrisisAcknowledged}
                formErrors={formErrors}
              />
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button 
              type="button"
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onClose();
                }
              }}
            >
              {currentStep === 1 ? 'Отмена' : 'Назад'}
            </button>
            
            <button 
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? 'Загрузка...' : 
               (currentStep === (isLoggedIn ? 3 : 4) ? 'Подтвердить бронирование' : 'Далее')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}