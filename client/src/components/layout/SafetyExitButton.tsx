import { X } from "lucide-react";

export default function SafetyExitButton() {
  const handleQuickExit = () => {
    window.location.href = "https://google.com";
  };

  return (
    <button 
      onClick={handleQuickExit}
      className="fixed bottom-20 left-4 z-50 bg-[hsl(var(--safety-red))] text-white font-semibold rounded px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <X className="h-4 w-4 inline mr-1" />
      Быстрый выход
    </button>
  );
}
