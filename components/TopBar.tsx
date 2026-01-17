import React from 'react';
import { Settings, HelpCircle, Save, Upload, Download, Activity, FilePlus, PlusSquare } from 'lucide-react';

interface TopBarProps {
  onImport: () => void;
  onExport: () => void;
  onSaveVersion: () => void;
  onNewFile: () => void;
  onAddObject: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  onImport, 
  onExport, 
  onSaveVersion, 
  onNewFile,
  onAddObject,
  onOpenSettings,
  onOpenHelp
}) => {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-2 md:px-4 justify-between select-none shadow-md z-20 relative flex-shrink-0">
      <div className="flex items-center space-x-2 md:space-x-6 overflow-hidden flex-1 mr-2">
        <div className="flex items-center text-blue-400 font-bold text-lg md:text-xl tracking-wider hover:text-blue-300 transition-colors cursor-pointer flex-shrink-0">
          <Activity className="w-5 h-5 md:w-6 md:h-6 mr-1.5 md:mr-2" />
          <span className="hidden xs:inline">Mak 3D</span>
        </div>
        
        <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar mask-gradient pr-4">
          <MenuButton icon={<FilePlus size={16} />} label="新建" onClick={onNewFile} />
          <MenuButton icon={<PlusSquare size={16} />} label="添加" onClick={onAddObject} />
          <div className="h-6 w-px bg-slate-700 mx-1 md:mx-2 flex-shrink-0"></div>
          <MenuButton icon={<Upload size={16} />} label="导入" onClick={onImport} />
          <MenuButton icon={<Download size={16} />} label="导出" onClick={onExport} />
          <div className="h-6 w-px bg-slate-700 mx-1 md:mx-2 flex-shrink-0"></div>
          <MenuButton icon={<Settings size={16} />} label="设置" onClick={onOpenSettings} />
          <MenuButton icon={<HelpCircle size={16} />} label="帮助" onClick={onOpenHelp} />
        </nav>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
        <span className="text-slate-500 text-xs font-mono hidden lg:block opacity-60">v1.5.0 CN</span>
        <button 
          onClick={onSaveVersion}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center active:scale-95 whitespace-nowrap"
        >
          <Save size={14} className="mr-1.5 md:mr-2" />
          <span className="hidden sm:inline">保存版本</span>
          <span className="sm:hidden">保存</span>
        </button>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-1.5 px-2 md:px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0"
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export default TopBar;