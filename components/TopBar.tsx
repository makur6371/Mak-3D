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
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between select-none shadow-md z-20 relative">
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-blue-400 font-bold text-xl tracking-wider hover:text-blue-300 transition-colors cursor-pointer">
          <Activity className="w-6 h-6 mr-2" />
          Mak 3D
        </div>
        
        <nav className="flex items-center space-x-1">
          <MenuButton icon={<FilePlus size={16} />} label="新建" onClick={onNewFile} />
          <MenuButton icon={<PlusSquare size={16} />} label="添加" onClick={onAddObject} />
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <MenuButton icon={<Upload size={16} />} label="导入" onClick={onImport} />
          <MenuButton icon={<Download size={16} />} label="导出" onClick={onExport} />
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <MenuButton icon={<Settings size={16} />} label="设置" onClick={onOpenSettings} />
          <MenuButton icon={<HelpCircle size={16} />} label="帮助" onClick={onOpenHelp} />
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-slate-500 text-xs font-mono hidden md:block opacity-60">v1.5.0 CN</span>
        <button 
          onClick={onSaveVersion}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center active:scale-95"
        >
          <Save size={14} className="mr-2" />
          保存版本
        </button>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors text-sm font-medium"
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export default TopBar;