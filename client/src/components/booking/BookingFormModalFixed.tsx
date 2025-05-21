import { useState } from "react";
import { X, User, Calendar, Check } from "lucide-react";
import { Housing, BookingRequest } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookingFormModalProps {
  show: boolean;
  housing: Housing;
  onClose: () => void;
  onConfirm: () => void;
}

interface BookingFormData {
  name: string;
  phone: string;
  people: string;
  specialNeeds: string;
  checkIn: string;
  checkOut: string;
  termsAccepted: boolean;
  crisisAcknowledged: boolean;
}

export default function BookingFormModal({ show, housing, onClose, onConfirm }: BookingFormModalProps) {
  // Always define all hooks at the top level
  const [currentStep, setCurrentStep] = useState(1);
  const { register, watch, handleSubmit, control, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      name: "",
      phone: "",
      people: "1",
      specialNeeds: "",
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      termsAccepted: false,
      crisisAcknowledged: false,
    }
  });
  
  const { toast } = useToast();
  
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      return apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: () => {
      // Invalidate bookings query to refresh the bookings list
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      onConfirm(); // Move to success screen
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

  const onSubmit = (data: BookingFormData) => {
    console.log("Form submitted with data:", data);
    
    // Make sure terms and crisis acknowledgment are accepted
    if (!data.termsAccepted || !data.crisisAcknowledged) {
      toast({
        title: "Ошибка формы",
        description: "Пожалуйста, подтвердите все необходимые пункты перед отправкой",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert form data to API request format
      const bookingRequest: BookingRequest = {
        housingId: housing.id,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guestName: data.name,
        guestPhone: data.phone,
        guestCount: parseInt(data.people), // Convert string to number
        specialNeeds: data.specialNeeds || undefined,
      };
      
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

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Render null if show is false, but do this after all hooks are defined
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
            onClick={() => onClose()}
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
        
        <form onSubmit={handleSubmit(onSubmit)}>
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
                      {...register("name", { required: true })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <span className="text-red-500 text-sm">Необходимо указать имя</span>}
                  </div>
                  <div>
                    <Label className="mb-1">Телефон</Label>
                    <Input 
                      type="tel" 
                      placeholder="+7 (___) ___-__-__"
                      {...register("phone", { required: true })}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <span className="text-red-500 text-sm">Необходимо указать телефон</span>}
                  </div>
                  <div>
                    <Label className="mb-1">Количество человек</Label>
                    <Controller
                      name="people"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          defaultValue={field.value} 
                          onValueChange={field.onChange}
                        >
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
                      )}
                    />
                  </div>
                  <div>
                    <Label className="mb-1">Особые потребности</Label>
                    <Textarea 
                      placeholder="Укажите, если у вас есть особые потребности (например, доступность для инвалидных колясок, аллергии и т.д.)"
                      {...register("specialNeeds")}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    onClick={() => goToStep(2)}
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
                        {...register("checkIn", { required: true })}
                        className={errors.checkIn ? "border-red-500" : ""}
                      />
                      {errors.checkIn && <span className="text-red-500 text-sm">Необходимо выбрать дату заезда</span>}
                    </div>
                    <div>
                      <Label className="mb-1">Дата выезда</Label>
                      <Input 
                        type="date" 
                        {...register("checkOut", { required: true })}
                        className={errors.checkOut ? "border-red-500" : ""}
                      />
                      {errors.checkOut && <span className="text-red-500 text-sm">Необходимо выбрать дату выезда</span>}
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
                    type="button"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    onClick={() => goToStep(3)}
                  >
                    Далее <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
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
                      <span className="font-medium">{watch("checkIn")} - {watch("checkOut")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Количество человек</span>
                      <span className="font-medium">{watch("people")} человек</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Контактное лицо</span>
                      <span className="font-medium">{watch("name")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Телефон</span>
                      <span className="font-medium">{watch("phone")}</span>
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
                    <Controller
                      name="termsAccepted"
                      control={control}
                      render={({ field }) => (
                        <Checkbox 
                          id="terms" 
                          className="mt-1"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label htmlFor="terms" className="ml-2 text-sm">
                      Я согласен с <a href="#" className="text-accent hover:underline">правилами проживания</a> и <a href="#" className="text-accent hover:underline">политикой конфиденциальности</a>.
                    </label>
                  </div>
                  {errors.termsAccepted && <span className="text-red-500 text-sm">Необходимо принять правила проживания</span>}
                  
                  <div className="flex items-start">
                    <Controller
                      name="crisisAcknowledged"
                      control={control}
                      render={({ field }) => (
                        <Checkbox 
                          id="crisis" 
                          className="mt-1"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label htmlFor="crisis" className="ml-2 text-sm">
                      Я подтверждаю, что нахожусь в кризисной ситуации, связанной с домашним насилием, и нуждаюсь в безопасном жилье.
                    </label>
                  </div>
                  {errors.crisisAcknowledged && <span className="text-red-500 text-sm">Необходимо подтвердить данный пункт</span>}
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