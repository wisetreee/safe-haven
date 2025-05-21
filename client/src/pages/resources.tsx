import TabNavigation from "@/components/layout/TabNavigation";
import { Phone, FileText, HelpCircle, ExternalLink, MapPin } from "lucide-react";

export default function Resources() {
  return (
    <div className="container mx-auto px-4 pb-20">
      <TabNavigation />
      
      <h1 className="text-2xl font-medium my-4">Ресурсы помощи</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-3 text-primary">Экстренная помощь</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-accent mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Всероссийский телефон доверия для женщин</p>
                <p className="text-lg font-bold">8 800 7000 600</p>
                <p className="text-sm text-secondary">Круглосуточно, анонимно, бесплатно</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-accent mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Экстренная психологическая помощь</p>
                <p className="text-lg font-bold">8 800 2000 122</p>
                <p className="text-sm text-secondary">Круглосуточно, анонимно, бесплатно</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-accent mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Единый номер экстренных служб</p>
                <p className="text-lg font-bold">112</p>
                <p className="text-sm text-secondary">Полиция, скорая помощь, МЧС</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-3 text-primary">Юридическая помощь</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-accent mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Центр защиты пострадавших от домашнего насилия</p>
                <p className="text-sm text-secondary mb-1">Бесплатные юридические консультации</p>
                <a href="https://tvoyapravda.ru" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center">
                  tvoyapravda.ru <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-accent mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Правовой навигатор</p>
                <p className="text-sm text-secondary mb-1">Информация о законах и правах</p>
                <a href="https://domestic-violence.ru" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center">
                  domestic-violence.ru <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-medium mb-4">Кризисные центры</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517502166878-35c93a0072f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" alt="Кризисный центр 'Надежда'" className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-medium mb-2">Кризисный центр "Надежда"</h3>
            <p className="text-secondary text-sm flex items-start mb-2">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>Москва, ул. Дубининская, 27 (метро Павелецкая)</span>
            </p>
            <p className="text-secondary text-sm flex items-start mb-2">
              <Phone className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>+7 (495) 123-45-67</span>
            </p>
            <div className="mt-2">
              <p className="text-sm">
                <strong>Услуги:</strong> временное убежище, психологическая помощь, юридические консультации
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" alt="Центр помощи семье и детям" className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-medium mb-2">Центр помощи семье и детям</h3>
            <p className="text-secondary text-sm flex items-start mb-2">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>Москва, ул. Новаторов, 36 (метро Проспект Вернадского)</span>
            </p>
            <p className="text-secondary text-sm flex items-start mb-2">
              <Phone className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>+7 (495) 870-44-55</span>
            </p>
            <div className="mt-2">
              <p className="text-sm">
                <strong>Услуги:</strong> психологическая поддержка, работа с детьми, группы поддержки
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300" alt="Центр 'Сёстры'" className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-medium mb-2">Центр "Сёстры"</h3>
            <p className="text-secondary text-sm flex items-start mb-2">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>Москва (адрес не разглашается в целях безопасности)</span>
            </p>
            <p className="text-secondary text-sm flex items-start mb-2">
              <Phone className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>+7 (499) 901-02-01</span>
            </p>
            <div className="mt-2">
              <p className="text-sm">
                <strong>Услуги:</strong> кризисная помощь, психологическая реабилитация, юридическое сопровождение
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium mb-3">Часто задаваемые вопросы</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-accent" />
              Как забронировать временное жилье?
            </h3>
            <p className="text-sm text-secondary mt-1 ml-7">
              Выберите подходящее жилье на карте или в списке, нажмите кнопку "Подробнее", а затем "Забронировать". Заполните форму бронирования, и мы свяжемся с вами для подтверждения.
            </p>
          </div>
          <div>
            <h3 className="font-medium flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-accent" />
              Сколько стоит временное жилье?
            </h3>
            <p className="text-sm text-secondary mt-1 ml-7">
              Все жилье, представленное на нашей платформе, предоставляется бесплатно для людей, пострадавших от домашнего насилия.
            </p>
          </div>
          <div>
            <h3 className="font-medium flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-accent" />
              Безопасно ли использовать этот сайт?
            </h3>
            <p className="text-sm text-secondary mt-1 ml-7">
              Да, мы заботимся о вашей безопасности. На сайте есть кнопка "Быстрый выход", которая мгновенно перенаправит вас на нейтральный сайт. Также мы не храним вашу историю просмотров.
            </p>
          </div>
          <div>
            <h3 className="font-medium flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-accent" />
              Как долго я могу оставаться во временном жилье?
            </h3>
            <p className="text-sm text-secondary mt-1 ml-7">
              Обычно срок проживания составляет от 14 до 30 дней, в зависимости от вашей ситуации и наличия мест. При необходимости срок может быть продлен.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
