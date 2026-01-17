import React from 'react';
import { FileText, Maximize2 } from 'lucide-react';
import { SceneObject, ObjectType } from '../types';

interface Preview2DProps {
  objects: SceneObject[];
  onExpand: () => void;
  isExpanded?: boolean;
}

const Preview2D: React.FC<Preview2DProps> = ({ objects, onExpand, isExpanded = false }) => {
  // Simple orthographic projection mapping
  // Map world coordinates (-10 to 10) to SVG coordinates
  const mapCoord = (val: number, offset: number) => 100 + val * 10 + offset;

  return (
    <div className={`flex flex-col h-full bg-slate-800 ${isExpanded ? 'bg-slate-900' : ''}`}>
      {!isExpanded && (
        <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-green-400" />
            <h3 className="text-sm font-semibold text-white">2D 图纸 (Blueprint)</h3>
          </div>
          <button 
            onClick={onExpand}
            className="text-slate-400 hover:text-white transition-colors"
            title="全屏查看"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      )}
      
      <div className="flex-1 p-4 flex items-center justify-center bg-[#1a202c] overflow-hidden relative group">
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}>
        </div>

        {/* Dynamic SVG Content */}
        <svg 
          viewBox="0 0 200 200" 
          className={`w-full h-full stroke-white stroke-1 fill-none drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] ${isExpanded ? 'max-w-3xl' : ''}`}
        >
          {/* Axis Lines */}
          <line x1="0" y1="100" x2="200" y2="100" className="stroke-slate-600" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="200" className="stroke-slate-600" strokeWidth="0.5" />

          {objects.map((obj) => {
            const x = mapCoord(obj.position[0], 0);
            const y = mapCoord(obj.position[2], 0); // Z is Y in 2D top-down
            const size = Math.max(obj.scale[0], obj.scale[2]) * 10;
            const color = obj.visible ? obj.color : 'transparent';
            const stroke = obj.visible ? (isExpanded ? obj.color : 'white') : 'transparent';

            if (!obj.visible) return null;

            return (
              <g key={obj.id}>
                {obj.type === ObjectType.CUBE && (
                  <rect 
                    x={x - size/2} 
                    y={y - size/2} 
                    width={size} 
                    height={size} 
                    stroke={stroke}
                    fill={color}
                    fillOpacity="0.2"
                    strokeWidth="1.5"
                  />
                )}
                {(obj.type === ObjectType.SPHERE || obj.type === ObjectType.CYLINDER) && (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={size/2} 
                    stroke={stroke}
                    fill={color}
                    fillOpacity="0.2"
                    strokeWidth="1.5"
                  />
                )}
                {obj.type === ObjectType.CONE && (
                  <g>
                    <circle cx={x} cy={y} r={size/2} stroke={stroke} fill={color} fillOpacity="0.2" />
                    <circle cx={x} cy={y} r={1} fill={stroke} />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono pointer-events-none select-none">
          TOP VIEW <br/> 比例 1:10
        </div>
      </div>
    </div>
  );
};

export default Preview2D;