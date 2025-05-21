import { useState } from "react";
import { X, User, Calendar, Check } from "lucide-react";
import { Housing, BookingRequest } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function SimpleBookingForm({ show, housing, onClose, onConfirm }: BookingFormModalProps) {
  // All hooks need to be declared at the top level
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Existing account login state
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [bookingNumber, setBookingNumber] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<{username: string, password: string} | undefined>();
  const [bookingId, setBookingId] = useState<number | undefined>();
  
  const { toast } = useToast();
  
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      return apiRequest('/api/bookings', 'POST', bookingData);
    },
    onSuccess: (response) => {
      // Force immediate invalidation and refetch of bookings query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/bookings'],
        refetchType: 'all' 
      });
      
      // Store booking details and account info if available
      setBookingId(response.id);
      setBookingNumber(response.bookingNumber);
      
      // If credentials were generated during booking, store them
      if (response.account) {
        setAccountInfo({
          username: response.account.username,
          password: response.account.password
        });
      }
      
      // Show success notification
      toast({
        title: "Бронирование создано",
        description: "Ваше бронирование успешно создано и ожидает подтверждения",
        variant: "default",
      });
      
      // Pass the booking info and credentials to the success screen
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
  
  const goToStep = (step: number) => {
    setCurrentStep(step);
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
    
    if (currentStep === 3) {
      // User account validation
      if (wantAccount) {
        // No need to validate username anymore since we're using phone number
        if (!password) errors.password = "Необходимо указать пароль";
        if (password && password.length < 6) errors.password = "Пароль должен содержать минимум 6 символов";
      }
      
      // Validate existing account login
      if (hasExistingAccount) {
        if (!loginUsername) errors.loginUsername = "Введите имя пользователя или телефон";
        if (!loginPassword) errors.loginPassword = "Введите пароль";
      }
    }
    
    if (currentStep === 4) {
      if (!termsAccepted) errors.termsAccepted = "Необходимо принять правила проживания";
      if (!crisisAcknowledged) errors.crisisAcknowledged = "Необходимо подтвердить данный пункт";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // New mutation for user registration
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
      
      // Refresh auth state to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // The actual user data is returned directly
      return data;
    },
    onError: (error) => {
      toast({
        title: "Ошибка регистрации",
        description: "Не удалось создать аккаунт. Возможно, это имя пользователя уже занято.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
      // Don't throw the error, just return null to allow continuing as a guest
      return null;
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 4) {
      goToStep(currentStep + 1);
      return;
    }
    
    try {
      let userId = null;
      
      // Option 1: If user wants to create a new account
      if (wantAccount && password && !hasExistingAccount) {
        try {
          // Generate a more unique username with random component
          const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
          const phoneUsername = `id${random}`;
          
          // Set the username in the state so it's available for the form
          setUsername(phoneUsername);
          
          const userData = {
            username: phoneUsername,
            password,
            name,
            phone,
            role: "user"
          };
          
          // Try to register the user
          try {
            const result = await registerUserMutation.mutateAsync(userData);
            if (result && result.user && result.user.id) {
              userId = result.user.id; // Extract the numeric user ID
            }
          } catch (regError) {
            // Check if error message indicates username already exists
            const errorMessage = regError instanceof Error ? regError.message : '';
            
            if (errorMessage.includes('уже занято')) {
              // If the username is taken, try logging in with these credentials
              // This handles cases where the user is registering with a phone they've used before
              try {
                const loginResult = await apiRequest('/api/auth/login', 'POST', {
                  username: phoneUsername,
                  password: password
                });
                
                if (loginResult && loginResult.user && loginResult.user.id) {
                  userId = loginResult.user.id;
                  // Show success message for login instead
                  toast({
                    title: "Вход выполнен",
                    description: "Бронирование будет привязано к существующему аккаунту",
                    variant: "default",
                  });
                }
              } catch (loginError) {
                console.error("Failed to login with existing account:", loginError);
                // Just continue with booking without user account
              }
            } else {
              // For other registration errors, allow booking to continue but show a warning
              toast({
                title: "Внимание",
                description: "Не удалось создать аккаунт, но бронирование будет продолжено без привязки к аккаунту",
                variant: "default",
              });
            }
          }
        } catch (error) {
          console.error("Error registering user:", error);
          // Continue with anonymous booking if registration fails
        }
      }
      
      // Option 2: If user wants to login with existing account
      if (hasExistingAccount && loginUsername && loginPassword) {
        try {
          const loginResult = await apiRequest('/api/auth/login', 'POST', {
            username: loginUsername,
            password: loginPassword
          });
          
          if (loginResult && loginResult.user && loginResult.user.id) {
            userId = loginResult.user.id;
            
            // Automatically update the name field to match the logged-in user
            if (loginResult.user.name && !name) {
              setName(loginResult.user.name);
            }
            
            // Show success message
            toast({
              title: "Успешный вход",
              description: "Бронирование будет привязано к вашему аккаунту",
              variant: "default",
            });
            
            // Refresh auth state
            queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
          }
        } catch (loginError) {
          console.error("Failed to login with existing account:", loginError);
          toast({
            title: "Ошибка входа",
            description: "Неверное имя пользователя или пароль",
            variant: "destructive",
          });
          
          // Return early to prevent proceeding with the booking
          return;
        }
      }
      
      // Convert form data to API request format
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
      
      // Only add userId if we actually have one (a number)
      if (typeof userId === 'number') {
        bookingRequest.userId = userId;
      }
      
      console.log("Submitting booking request:", bookingRequest);
      
      // Submit booking request to API
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
        
        {/* Progress indicator */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
                <User className="h-4 w-4" />
              </div>
              <span className={`text-xs ${currentStep >= 1 ? 'text-accent' : 'text-gray-500'}`}>Информация</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-1 bg-accent" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
                <Calendar className="h-4 w-4" />
              </div>
              <span className={`text-xs ${currentStep >= 2 ? 'text-accent' : 'text-gray-500'}`}>Даты</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-1 bg-accent" style={{ width: currentStep === 3 ? '100%' : '0%' }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center mb-1`}>
                <Check className="h-4 w-4" />
              </div>
              <span className={`text-xs ${currentStep >= 3 ? 'text-accent' : 'text-gray-500'}`}>Подтверждение</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="booking-step active">
                <h3 className="font-medium mb-3">Ваша информация</h3>
                <p className="text-sm text-secondary mb-4">
                  Эта информация конфиденциальна и будет использована только для бронирования.
                </p>
                
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
                        <SelectItem value="4">4+ человека</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1">Особые потребности</Label>
                    <Textarea 
                      placeholder="Укажите, если у вас есть особые потребности (например, доступность для инвалидных колясок, аллергии и т.д.)"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                  >
                    Далее <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Date Selection */}
            {currentStep === 2 && (
              <div className="booking-step active">
                <h3 className="font-medium mb-3">Выберите даты проживания</h3>
                <p className="text-sm text-secondary mb-4">
                  Максимальный срок бронирования - 14 дней. При необходимости вы сможете продлить проживание.
                </p>
                
                <div className="mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Доступность</h4>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      <div className="text-xs text-center font-medium">Пн</div>
                      <div className="text-xs text-center font-medium">Вт</div>
                      <div className="text-xs text-center font-medium">Ср</div>
                      <div className="text-xs text-center font-medium">Чт</div>
                      <div className="text-xs text-center font-medium">Пт</div>
                      <div className="text-xs text-center font-medium">Сб</div>
                      <div className="text-xs text-center font-medium">Вс</div>
                      
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">15</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">16</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">17</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">18</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">19</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">20</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">21</div>
                      
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">22</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">23</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">24</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">25</div>
                      <div className="h-8 bg-green-100 rounded-sm flex items-center justify-center text-xs">26</div>
                      <div className="h-8 bg-yellow-100 rounded-sm flex items-center justify-center text-xs">27</div>
                      <div className="h-8 bg-yellow-100 rounded-sm flex items-center justify-center text-xs">28</div>
                    </div>
                    <div className="flex text-xs space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 mr-1"></div>
                        <span>Доступно</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-100 mr-1"></div>
                        <span>Мало мест</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 mr-1"></div>
                        <span>Нет мест</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={() => goToStep(1)}
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Назад
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                  >
                    Далее <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Confirmation */}
            {/* New Step 3: Optional Account Creation */}
            {currentStep === 3 && (
              <div className="booking-step active">
                <h3 className="font-medium mb-3">Создание аккаунта (по желанию)</h3>
                <p className="text-sm text-secondary mb-4">
                  Создание аккаунта позволит вам видеть все ваши бронирования и упростит общение с сотрудниками. Это не обязательно.
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-col space-y-4">
                    {/* Option 1: Create new account */}
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="create-account" 
                        checked={wantAccount && !hasExistingAccount}
                        onCheckedChange={(checked) => {
                          setWantAccount(checked === true);
                          if (checked === true) {
                            setHasExistingAccount(false);
                          }
                        }}
                      />
                      <div className="space-y-1 leading-none">
                        <Label
                          htmlFor="create-account"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Я хочу создать аккаунт
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Создание аккаунта позволит вам легко отслеживать ваши бронирования
                        </p>
                      </div>
                    </div>
                    
                    {/* Option 2: Login with existing account */}
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="existing-account" 
                        checked={hasExistingAccount}
                        onCheckedChange={(checked) => {
                          setHasExistingAccount(checked === true);
                          if (checked === true) {
                            setWantAccount(false);
                          }
                        }}
                      />
                      <div className="space-y-1 leading-none">
                        <Label
                          htmlFor="existing-account"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Войти в аккаунт
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Если у вас уже есть аккаунт, войдите для привязки бронирования
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show create account form */}
                  {wantAccount && !hasExistingAccount && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label className="mb-1">Информация об аккаунте</Label>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          <p>Ваш телефон <strong>{phone}</strong> будет использован как имя пользователя</p>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1">Пароль</Label>
                        <Input 
                          type="password" 
                          placeholder="Введите пароль"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={formErrors.password ? "border-red-500" : ""}
                        />
                        {formErrors.password && <span className="text-red-500 text-sm">{formErrors.password}</span>}
                      </div>
                    </div>
                  )}
                  
                  {/* Show login form */}
                  {hasExistingAccount && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label className="mb-1">Имя пользователя или телефон</Label>
                        <Input 
                          type="text" 
                          placeholder="Введите имя пользователя или телефон"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className={formErrors.loginUsername ? "border-red-500" : ""}
                        />
                        {formErrors.loginUsername && <span className="text-red-500 text-sm">{formErrors.loginUsername}</span>}
                      </div>
                      <div>
                        <Label className="mb-1">Пароль</Label>
                        <Input 
                          type="password" 
                          placeholder="Введите пароль"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={formErrors.loginPassword ? "border-red-500" : ""}
                        />
                        {formErrors.loginPassword && <span className="text-red-500 text-sm">{formErrors.loginPassword}</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={() => goToStep(2)}
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Назад
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                  >
                    Далее <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
            
            {/* Final Step: Confirmation */}
            {currentStep === 4 && (
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
                      <i className="fas fa-info-circle text-accent mt-1 mr-2"></i>
                      <span>После подтверждения бронирования вам позвонит координатор для уточнения деталей.</span>
                    </li>
                    <li className="flex">
                      <i className="fas fa-info-circle text-accent mt-1 mr-2"></i>
                      <span>Точный адрес будет сообщен только после подтверждения бронирования для обеспечения безопасности.</span>
                    </li>
                    <li className="flex">
                      <i className="fas fa-info-circle text-accent mt-1 mr-2"></i>
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
                        onChange={() => {
                          setTermsAccepted(!termsAccepted);
                          // Clear error when checked
                          if (!termsAccepted) {
                            const newErrors = {...formErrors};
                            delete newErrors.termsAccepted;
                            setFormErrors(newErrors);
                          }
                        }}
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
                        onChange={() => {
                          setCrisisAcknowledged(!crisisAcknowledged);
                          // Clear error when checked
                          if (!crisisAcknowledged) {
                            const newErrors = {...formErrors};
                            delete newErrors.crisisAcknowledged;
                            setFormErrors(newErrors);
                          }
                        }}
                        className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
                      />
                    </div>
                    <label htmlFor="crisis" className="ml-2 text-sm">
                      Я подтверждаю, что нахожусь в кризисной ситуации, связанной с домашним насилием, и нуждаюсь в безопасном жилье.
                    </label>
                  </div>
                  {formErrors.crisisAcknowledged && <span className="text-red-500 text-sm">{formErrors.crisisAcknowledged}</span>}
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={() => goToStep(2)}
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Назад
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? 'Отправка...' : 'Забронировать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}