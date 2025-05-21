import { Phone } from "lucide-react";

export default function EmergencyButton() {
  return (
    <div className="fixed left-4 bottom-16 md:bottom-4 z-40">
      <button 
        className="bg-[hsl(var(--safety-red))] text-white rounded-full p-3 shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
        onClick={() => window.open('tel:88005505285', '_blank')}
      >
        <Phone className="h-5 w-5 inline md:hidden" />
        <span className="ml-2 hidden md:inline">Экстренная помощь</span>
      </button>
    </div>
  );
}
