import { Search, Filter, Map } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefreshMap: () => void;
  onShowFilters: () => void;
}

export default function FilterBar({ searchQuery, setSearchQuery, onRefreshMap, onShowFilters }: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-secondary h-4 w-4" />
            <Input
              type="text"
              placeholder="Поиск по адресу или району"
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-white px-3 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50"
            onClick={onShowFilters}
          >
            <Filter className="mr-2 text-secondary h-4 w-4" />
            <span>Фильтры</span>
          </button>
          <button 
            className="bg-accent text-white px-3 py-2 rounded-lg flex items-center hover:bg-accent/90"
            onClick={onRefreshMap}
          >
            <Map className="mr-2 h-4 w-4" />
            <span>Обновить карту</span>
          </button>
        </div>
      </div>
    </div>
  );
}
