import React from 'react';
import { Bell, Search, HelpCircle } from 'lucide-react';

export const Header: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      <h2 className="text-xl font-semibold text-gray-800 ml-10 lg:ml-0">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 border border-transparent focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhanh..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-gray-700"
          />
        </div>
        
        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
};
