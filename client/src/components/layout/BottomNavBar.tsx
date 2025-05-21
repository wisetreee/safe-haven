import { Link, useLocation } from "wouter";
import { MapPin, List, Calendar, Info, Search } from "lucide-react";

export default function BottomNavBar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-top border-t border-gray-200 py-2 md:hidden">
      <div className="flex justify-around">
        <Link href="/" className={`flex flex-col items-center px-3 py-1 ${isActive("/") ? "text-accent" : "text-secondary"}`}>
            <MapPin className="mb-1 h-5 w-5" />
            <span className="text-xs">Карта</span>
        </Link>
        <Link href="/bookings" className={`flex flex-col items-center px-3 py-1 ${isActive("/bookings") ? "text-accent" : "text-secondary"}`}>
            <Calendar className="mb-1 h-5 w-5" />
            <span className="text-xs">Бронирование</span>
        </Link>
        <Link href="/booking-status" className={`flex flex-col items-center px-3 py-1 ${isActive("/booking-status") ? "text-accent" : "text-secondary"}`}>
            <Search className="mb-1 h-5 w-5" />
            <span className="text-xs">Статус</span>
        </Link>
        <Link href="/resources" className={`flex flex-col items-center px-3 py-1 ${isActive("/resources") ? "text-accent" : "text-secondary"}`}>
            <Info className="mb-1 h-5 w-5" />
            <span className="text-xs">Помощь</span>
        </Link>
      </div>
    </nav>
  );
}
