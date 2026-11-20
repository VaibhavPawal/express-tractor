import { Plus } from 'lucide-react';
import { ActiveView } from '../types/expense';

interface TopBarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onExportCsv: () => void;
  onQuickAdd: () => void;
  canExport: boolean;
}

export function TopBar({
  activeView,
  onSelectView,
  onExportCsv,
  onQuickAdd,
  canExport,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E6E3DC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('daily')}
          className="font-editorial text-2xl font-medium tracking-tight text-[#1F2421] whitespace-nowrap shrink-0 hover:text-[#3D6B59] transition-colors cursor-pointer"
        >
          Daybook
        </button>

        {/* Zone 2: Clean single-line text navigation */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-5 sm:gap-8 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onSelectView('daily')}
            aria-current={activeView === 'daily' ? 'page' : undefined}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeView === 'daily'
                ? 'text-[#1F2421]'
                : 'text-[#5E6661] hover:text-[#1F2421]'
            }`}
          >
            Daily Log
            {activeView === 'daily' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#3D6B59]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectView('summary')}
            aria-current={activeView === 'summary' ? 'page' : undefined}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeView === 'summary'
                ? 'text-[#1F2421]'
                : 'text-[#5E6661] hover:text-[#1F2421]'
            }`}
          >
            Monthly Summary
            {activeView === 'summary' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#3D6B59]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            disabled={!canExport}
            className={`hidden sm:inline-flex py-2 whitespace-nowrap shrink-0 transition-colors ${
              canExport
                ? 'text-[#5E6661] hover:text-[#1F2421] hover:underline underline-offset-4 cursor-pointer'
                : 'text-[#A0A5A1] cursor-not-allowed'
            }`}
          >
            Export CSV
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-[#3D6B59] hover:bg-[#2F5647] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
}
