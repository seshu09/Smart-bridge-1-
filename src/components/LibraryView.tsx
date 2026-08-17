import React, { useState, useEffect } from 'react';
import { SavedItem } from '../types';
import { getSavedItems, removeItem, clearAllSavedItems } from '../lib/storage';
import {
  BookmarkCheck,
  Search,
  Trash2,
  HelpCircle,
  BookOpen,
  CheckSquare,
  FileText,
  Map,
  Eye,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface LibraryViewProps {
  onLoadItem?: (item: SavedItem) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onLoadItem }) => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

  const loadData = () => {
    setItems(getSavedItems());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(id);
    if (selectedItem?.id === id) setSelectedItem(null);
    loadData();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your saved library items?')) {
      clearAllSavedItems();
      setSelectedItem(null);
      loadData();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qa':
        return <HelpCircle className="w-4 h-4 text-indigo-400" />;
      case 'explain':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'quiz':
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'summary':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'roadmap':
        return <Map className="w-4 h-4 text-sky-400" />;
      default:
        return <BookmarkCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border-4 border-[#2DD4BF] rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden text-[#1F2937]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-[#2DD4BF]/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2DD4BF]/20 border-2 border-[#2DD4BF]/50 text-[#14B8A6] text-xs font-bold uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4" />
            <span>EduGenie Library</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight leading-tight">
            Saved Knowledge Library
          </h1>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
            Review, search, and manage your saved Q&A logs, concept breakdowns, generated quizzes, summaries, and roadmaps.
          </p>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved items..."
                className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#2DD4BF] rounded-2xl py-2.5 pl-10 pr-4 text-[#1F2937] font-bold text-xs placeholder-[#9CA3AF] shadow-inner transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-[#F3F4F6] p-1.5 rounded-2xl border-2 border-[#E5E7EB]">
              {['all', 'qa', 'explain', 'quiz', 'summary', 'roadmap'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-xl text-xs font-black capitalize tracking-wider transition-all ${
                    filterType === type
                      ? 'bg-[#2DD4BF] text-white shadow-sm'
                      : 'text-[#1F2937] hover:bg-slate-200'
                  }`}
                >
                  {type === 'all' ? 'All Items' : type}
                </button>
              ))}
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-800 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border-4 border-[#E5E7EB] rounded-[36px] p-12 text-center space-y-3 shadow-md">
          <BookmarkCheck className="w-12 h-12 text-[#9CA3AF] mx-auto" />
          <h3 className="text-lg font-black text-[#1F2937]">No Saved Items Found</h3>
          <p className="text-xs font-semibold text-[#6B7280] max-w-sm mx-auto">
            {items.length === 0
              ? 'Save Q&A answers, concept breakdowns, quizzes, or roadmaps as you study to build your personal library.'
              : 'No items match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white hover:bg-[#F9FAFB] border-4 border-[#E5E7EB] hover:border-[#7C3AED] rounded-[28px] p-5 space-y-3 cursor-pointer transition-all hover:shadow-xl group flex flex-col justify-between text-[#1F2937]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#7C3AED]">
                      {item.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-[#9CA3AF] hover:text-red-600 p-1 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-[#1F2937] group-hover:text-[#7C3AED] line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] pt-3 border-t-2 border-[#E5E7EB]">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </span>
                <span className="text-[#7C3AED] flex items-center space-x-1 font-black group-hover:translate-x-0.5 transition-transform uppercase tracking-wider">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Item Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-[#1F2937]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#7C3AED] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#1F2937]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#E5E7EB] pb-4 sticky top-0 bg-white z-10 pt-1">
              <div className="flex items-center space-x-2">
                {getTypeIcon(selectedItem.type)}
                <span className="text-xs font-black uppercase tracking-wider text-[#7C3AED]">
                  Saved {selectedItem.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl bg-[#F3F4F6] hover:bg-slate-200 text-[#1F2937] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[#1F2937]">{selectedItem.title}</h2>

              {/* Render Saved Item Details according to type */}
              <div className="bg-[#F9FAFB] p-5 rounded-2xl border-2 border-[#E5E7EB] text-xs sm:text-sm text-[#1F2937] font-semibold leading-relaxed overflow-x-auto shadow-inner">
                <pre className="whitespace-pre-wrap font-mono text-[#1F2937]">
                  {JSON.stringify(selectedItem.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-[#E5E7EB]">
              <button
                onClick={(e) => handleDelete(selectedItem.id, e)}
                className="px-4 py-2.5 bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete Item</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
