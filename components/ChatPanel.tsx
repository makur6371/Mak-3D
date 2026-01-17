import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, PenTool } from 'lucide-react';
import { ChatMessage, SceneObject } from '../types';
import { generate3DModelFromPrompt } from '../services/geminiService';

interface ChatPanelProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentObjects: SceneObject[];
  onObjectsGenerated: (objects: SceneObject[]) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, setMessages, currentObjects, onObjectsGenerated }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    const userPrompt = input;
    setInput('');
    setIsGenerating(true);

    // Add user message to history
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: userPrompt,
      timestamp: new Date()
    }]);

    try {
      const { text, objects } = await generate3DModelFromPrompt(userPrompt, currentObjects);
      
      if (objects && objects.length > 0) {
        onObjectsGenerated(objects);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "生成模型时出错，请重试。",
        timestamp: new Date()
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700">
      <div className="p-3 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-purple-400 animate-pulse" />
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            AI 生成器
          </h3>
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Gemini 驱动
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 opacity-60">
            <PenTool size={32} />
            <div className="text-center text-xs">
              <p className="font-semibold mb-1">描述你想生成的3D模型</p>
              <p>"一座红色的塔"</p>
              <p>"一片蓝色的球体矩阵"</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
              }`}>
                 {msg.text}
              </div>
            </div>
          ))
        )}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-2xl rounded-bl-none p-3 flex items-center space-x-2">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span className="text-xs">正在构建几何体...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="在此输入创意..."
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-500 resize-none h-10 min-h-[42px] max-h-24 scrollbar-hide"
            rows={1}
          />
          <button 
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 top-1.5 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md disabled:opacity-50 disabled:bg-transparent disabled:text-slate-500 transition-all shadow-lg"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;