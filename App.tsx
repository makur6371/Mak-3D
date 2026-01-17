import React, { useState } from 'react';
import { SceneObject, ObjectType, ChatMessage, Version } from './types';
import TopBar from './components/TopBar';
import Viewport3D from './components/Viewport3D';
import Preview2D from './components/Preview2D';
import LayerPanel from './components/LayerPanel';
import ChatPanel from './components/ChatPanel';
import { X, Grid, Sun, Keyboard, MousePointer2 } from 'lucide-react';

const initialObjects: SceneObject[] = [
  { id: '1', name: '基础底板', type: ObjectType.CUBE, position: [0, -0.4, 0], rotation: [0, 0, 0], color: '#475569', visible: true, scale: [4, 0.2, 4] },
];

// --- MODAL COMPONENT ---
const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  const [objects, setObjects] = useState<SceneObject[]>(initialObjects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCinematic, setIsCinematic] = useState(false);
  
  // Settings State
  const [showGrid, setShowGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  
  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [is2DMaximized, setIs2DMaximized] = useState(false);

  // Chat / History State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'init',
      name: '初始布局',
      timestamp: Date.now(),
      objects: initialObjects
    }
  ]);

  // --- HANDLERS ---
  const handleToggleVisibility = (id: string) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, visible: !obj.visible } : obj
    ));
  };

  const handleObjectUpdate = (id: string, updates: Partial<SceneObject>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  const handleObjectsGenerated = (newObjects: SceneObject[]) => {
    // Logic update: Auto-save current scene to history, then CLEAR and REPLACE with new objects
    if (objects.length > 0) {
      const timestamp = Date.now();
      const backupName = `生成前备份 (${new Date().toLocaleTimeString()})`;
      
      setVersions(prev => [...prev, {
        id: timestamp.toString(),
        name: backupName,
        timestamp: timestamp,
        objects: [...objects]
      }]);

      // Notify user system saved the previous state
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user', // Display as user-side system notice or just use role logic
        text: `[系统] 上一个场景已自动备份至历史记录: "${backupName}"`,
        timestamp: new Date(),
        isSystem: true
      }]);
    }

    setObjects(newObjects);
    setSelectedId(null);
  };

  const handleSaveVersion = () => {
    const name = prompt("请输入版本名称:", `版本 ${versions.length + 1}`);
    if (name) {
      const newVersion: Version = {
        id: Date.now().toString(),
        name,
        timestamp: Date.now(),
        objects: [...objects] 
      };
      setVersions(prev => [...prev, newVersion]);
    }
  };

  const handleRestoreVersion = (version: Version) => {
    if (confirm(`确定要还原到 "${version.name}" 吗? 当前未保存的更改将会丢失。`)) {
      setObjects(version.objects);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        text: `[系统] 已还原版本: ${version.name}`,
        timestamp: new Date(),
        isSystem: true
      }]);
    }
  };

  const handleNewFile = () => {
    if (confirm("新建项目？这将清空当前场景。")) {
      setObjects([]);
      setMessages([]);
      handleSaveVersion(); 
    }
  };

  const handleAddObject = () => {
    const newObj: SceneObject = {
      id: Date.now().toString(),
      name: '新立方体',
      type: ObjectType.CUBE,
      position: [0, 0.5, 0], // Place slightly above grid
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#cbd5e1',
      visible: true
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.sldprt,.step'; 
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const json = JSON.parse(ev.target?.result as string);
            if (Array.isArray(json.objects)) {
              setObjects(json.objects);
              alert("项目加载成功。");
            } else {
              alert("无效的项目文件格式。");
            }
          } catch (err) {
            console.error(err);
            alert("文件解析失败。");
          }
        };
        reader.readAsText(file);
      } else {
        alert(`模拟导入复杂CAD文件 ${file.name}...\n(真实应用需连接几何内核)`);
        const mockImported: SceneObject = {
           id: Date.now().toString(),
           name: `导入_${file.name}`,
           type: ObjectType.CUBE,
           position: [0, 2, 0],
           rotation: [0, 0, 0],
           scale: [1, 1, 1],
           color: '#ef4444',
           visible: true
        };
        setObjects(prev => [...prev, mockImported]);
      }
    };
    input.click();
  };

  const handleExport = () => {
    // 3-way choice for export
    const choice = prompt(
      "请选择导出格式 (输入数字):\n1. 项目文件 (.json)\n2. CAD 模型 (.sldprt)\n3. 2D 图纸 (.png)", 
      "1"
    );

    if (choice === "1") {
      const projectData = { version: "1.0", timestamp: Date.now(), objects: objects };
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(projectData, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `mak3d_project_${Date.now()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (choice === "2") {
      const element = document.createElement("a");
      const file = new Blob(["SolidWorks Part File Stub\nGenerated by Mak 3D"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "model.sldprt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (choice === "3") {
      alert("正在生成2D图纸预览并下载...");
      const blueprintData = objects.map(o => `${o.name}: x=${o.position[0]}, z=${o.position[2]}`).join('\n');
      const file = new Blob([`MAK3D BLUEPRINT DATA\n\n${blueprintData}`], {type: 'text/plain'});
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = "blueprint.txt"; 
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden font-sans">
      <TopBar 
        onImport={handleImport} 
        onExport={handleExport} 
        onSaveVersion={handleSaveVersion}
        onNewFile={handleNewFile}
        onAddObject={handleAddObject}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left: 3D Viewport */}
        <div className="flex-1 relative border-r border-slate-700">
          <Viewport3D 
            objects={objects} 
            selectedId={selectedId}
            onSelectObject={setSelectedId}
            isCinematic={isCinematic}
            toggleCinematic={() => setIsCinematic(!isCinematic)}
            onUpdateObject={handleObjectUpdate}
            showGrid={showGrid}
            showShadows={showShadows}
          />
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 md:w-96 flex flex-col bg-slate-900 flex-shrink-0 shadow-xl z-10">
          
          {/* Top Right: 2D Preview */}
          <div className="h-48 border-b border-slate-700 bg-slate-800 relative">
            <Preview2D 
              objects={objects} 
              onExpand={() => setIs2DMaximized(true)} 
            />
          </div>

          {/* Middle Right: Layer Panel & History */}
          <div className="flex-1 overflow-hidden min-h-[150px]">
             <LayerPanel 
               objects={objects} 
               selectedId={selectedId} 
               onSelect={setSelectedId} 
               onToggleVisibility={handleToggleVisibility} 
               versions={versions}
               onRestoreVersion={handleRestoreVersion}
             />
          </div>

          {/* Bottom Right: AI Generator */}
          <div className="h-80 relative z-20">
             <ChatPanel 
               messages={messages} 
               setMessages={setMessages} 
               currentObjects={objects}
               onObjectsGenerated={handleObjectsGenerated}
             />
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Settings Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="显示设置"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Grid className="text-blue-400" />
              <span>显示网格 (Grid)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Sun className="text-yellow-400" />
              <span>接触阴影 (Shadows)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showShadows} onChange={(e) => setShowShadows(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        title="操作指南"
      >
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2 flex items-center">
              <MousePointer2 size={14} className="mr-2" /> 鼠标操作
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between"><span className="text-white">左键点击</span> <span>选择物体</span></li>
              <li className="flex justify-between"><span className="text-white">左键拖拽</span> <span>旋转视角 (空白处) / 移动物体 (选中时)</span></li>
              <li className="flex justify-between"><span className="text-white">右键拖拽</span> <span>平移视角</span></li>
              <li className="flex justify-between"><span className="text-white">滚轮</span> <span>缩放视角</span></li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2 flex items-center">
              <Keyboard size={14} className="mr-2" /> 工具栏
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>选中物体后，左上角会出现变换工具：</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 p-2 rounded">移动 (Move)</div>
                <div className="bg-slate-800 p-2 rounded">旋转 (Rotate)</div>
                <div className="bg-slate-800 p-2 rounded">缩放 (Scale)</div>
              </div>
            </div>
          </section>
        </div>
      </Modal>

      {/* Fullscreen 2D Preview Overlay */}
      {is2DMaximized && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
          <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-900">
             <h2 className="text-xl font-bold text-white flex items-center">
               <span className="text-green-400 mr-2">●</span> 2D 蓝图全屏预览
             </h2>
             <button 
               onClick={() => setIs2DMaximized(false)}
               className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors"
             >
               关闭预览
             </button>
          </div>
          <div className="flex-1 p-8">
            <Preview2D 
              objects={objects} 
              onExpand={() => {}} 
              isExpanded={true} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default App;