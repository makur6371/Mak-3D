import React, { useState } from 'react';
import { Eye, EyeOff, Box, Layers, History, RotateCcw } from 'lucide-react';
import { SceneObject, Version } from '../types';

interface LayerPanelProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  versions: Version[];
  onRestoreVersion: (version: Version) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ 
  objects, 
  selectedId, 
  onSelect, 
  onToggleVisibility,
  versions,
  onRestoreVersion
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'history'>('layers');

  return (
    <div className="flex flex-col h-full bg-slate-800 border-t border-b border-slate-700">
      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-900">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'layers' 
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Layers size={14} />
          <span>图层 (Layers)</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'history' 
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <History size={14} />
          <span>历史 (History)</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {activeTab === 'layers' ? (
          // LAYERS LIST
          objects.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-xs italic">
              场景为空。<br/>请使用AI生成模型。
            </div>
          ) : (
            objects.map((obj) => (
              <div 
                key={obj.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer group transition-all ${
                  selectedId === obj.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => onSelect(obj.id)}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Box size={14} className={selectedId === obj.id ? 'text-white' : 'text-blue-400'} />
                  <span className="text-sm truncate font-medium">{obj.name}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(obj.id);
                  }}
                  className={`p-1.5 rounded hover:bg-white/20 transition-colors ${
                    !obj.visible && selectedId !== obj.id ? 'text-slate-500' : 'text-current'
                  }`}
                >
                  {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))
          )
        ) : (
          // HISTORY LIST
          versions.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-xs italic">
              暂无历史版本。<br/>请点击上方“保存版本”。
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {versions.slice().reverse().map((ver) => (
                <div key={ver.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 hover:border-emerald-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-slate-200 truncate pr-2">{ver.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(ver.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 flex items-center">
                    <Box size={10} className="mr-1" /> {ver.objects.length} 个对象
                  </div>
                  <button 
                    onClick={() => onRestoreVersion(ver)}
                    className="w-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-600 hover:border-emerald-500 text-xs py-1.5 rounded flex items-center justify-center transition-all"
                  >
                    <RotateCcw size={12} className="mr-1.5" />
                    还原此版本
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LayerPanel;