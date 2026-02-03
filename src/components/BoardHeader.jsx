import React from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { Download, Share2 } from 'lucide-react';

const BoardHeader = () => {
    const { title, setBoardTitle, items, drawings, connections, boardColor, backgroundTexture } = useBoardStore();

    const handleExport = () => {
        const data = {
            title,
            items,
            drawings,
            connections,
            boardColor,
            backgroundTexture,
            createdAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.json`;
        a.click();
    };

    return (
        <div className="fixed top-4 left-4 right-4 h-16 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
                    IB
                </div>
                <div className="flex flex-col">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setBoardTitle(e.target.value)}
                        className="font-bold text-gray-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 -ml-1 text-lg"
                    />
                    <span className="text-xs text-gray-500">Saved to Local Storage</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Share2 size={16} />
                    Share
                </button>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                >
                    <Download size={16} />
                    Export
                </button>
            </div>
        </div>
    );
};

export default BoardHeader;
