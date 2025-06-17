import { Housing, Booking } from "./schema.js";

// Sample housing data
export const SAMPLE_HOUSINGS: Housing[] = [
  {
    id: 1,
    name: "Безопасная квартира в центре",
    description: "Безопасная квартира в тихом районе города с круглосуточной охраной. В квартире есть все необходимое для комфортного проживания - полностью оборудованная кухня, стиральная машина, интернет. Рядом находятся школа, детский сад и магазины. Доступно для размещения семьи с детьми.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    ],
    location: "Центральный район",
    latitude: 55.751244,
    longitude: 37.618423,
    distance: 2,
    rooms: 2,
    capacity: 3,
    availability: "available",
    availableFrom: "сегодня",
    amenities: ["wifi", "kitchen", "bathroom", "washer", "security", "childFriendly"],
    support: [
      "Социальный работник (с 9:00 до 18:00)",
      "Психологическая помощь (по запросу)",
      "Юридическая консультация (вторник, четверг)"
    ]
  },
  {
    id: 2,
    name: "Комната в кризисном центре",
    description: "Комфортная комната в кризисном центре для женщин. Общая кухня и санузел. В центре работают психологи и социальные работники, оказывающие поддержку постояльцам. Есть детская игровая комната и прачечная.",
    imageUrl: "https://images.unsplash.com/photo-1508253578933-20b529302151?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    images: [
      "https://images.unsplash.com/photo-1508253578933-20b529302151?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    ],
    location: "Восточный район",
    latitude: 55.758468,
    longitude: 37.751235,
    distance: 4,
    rooms: 1,
    capacity: 2,
    availability: "available",
    availableFrom: "сегодня",
    amenities: ["wifi", "kitchen", "bathroom", "washer", "security"],
    support: [
      "Психолог (ежедневно с 10:00 до 19:00)",
      "Юрист (понедельник, среда, пятница)",
      "Группы поддержки (вторник, четверг)"
    ]
  },
  {
    id: 3,
    name: "Семейный приют \"Надежда\"",
    description: "Приют для женщин с детьми, пострадавших от домашнего насилия. Предоставляется отдельная комната, есть общая кухня и гостиная. Работают психологи, юристы, социальные работники. Для детей организованы развивающие занятия.",
    imageUrl: "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    images: [
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1581631057160-4a5a8e31bef2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    ],
    location: "Западный район",
    latitude: 55.749792,
    longitude: 37.543041,
    distance: 3,
    rooms: 1,
    capacity: 4,
    availability: "limited",
    availableFrom: "завтра",
    amenities: ["wifi", "kitchen", "bathroom", "washer", "security", "childFriendly"],
    support: [
      "Социальный работник (круглосуточно)",
      "Психолог для детей и взрослых",
      "Юридическое сопровождение",
      "Помощь в трудоустройстве"
    ]
  },
  {
    id: 4,
    name: "Квартира безопасности",
    description: "Двухкомнатная квартира в жилом комплексе с охраной. Полностью меблирована и оборудована всем необходимым для проживания. Расположена рядом с парком и детской площадкой. Есть доступ к интернету.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "https://images.unsplash.com/photo-1583845112203-29329902332e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    ],
    location: "Южный район",
    latitude: 55.736290,
    longitude: 37.633715,
    distance: 2,
    rooms: 2,
    capacity: 4,
    availability: "unavailable",
    availableFrom: "через 3 дня",
    amenities: ["wifi", "kitchen", "bathroom", "washer", "security", "childFriendly"],
    support: [
      "Удаленная психологическая поддержка",
      "Юридические консультации по телефону",
      "Группы взаимопомощи онлайн"
    ]
  }
];

// Sample booking data
export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 1,
    userId: 1, // Link to staff user account
    housingId: 2,
    housingName: "Комната в кризисном центре",
    location: "Восточный район",
    checkIn: "2023-05-15",
    checkOut: "2023-05-22",
    bookingDate: "2023-05-10",
    bookingNumber: "BR-2023-0542",
    status: "confirmed",
    guestName: "Анна",
    guestPhone: "+7 (XXX) XXX-XX-XX",
    guestCount: 2
  }
];
