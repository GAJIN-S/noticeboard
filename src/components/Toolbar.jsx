import React, { useRef } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { MousePointer2, Hand, Pen, Eraser, Link, StickyNote, ImageIcon, Type, MessageSquarePlus } from 'lucide-react';
import clsx from 'clsx';

import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from '../utils/uploadImage';

const ToolButton = ({ active, icon: Icon, onClick, label }) => (
    <button
        onClick={onClick}
        title={label}
        className={clsx(
            "p-3 rounded-lg transition-all duration-200 group relative",
            active
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        )}
    >
        <Icon size={24} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
        </span>
    </button>
);

const Toolbar = () => {
    const {
        tool, setTool,
        penColor, setPenColor,
        penSize, setPenSize,
        eraserSize, setEraserSize,
        addItem, selection, items
    } = useBoardStore();


    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadImage(file);
            const newImage = {
                id: uuidv4(),
                type: 'image',
                x: window.innerWidth / 2 - 150, // Center roughly
                y: window.innerHeight / 2 - 150,
                width: 300,
                height: 300,
                rotation: 0,
                content: url,
            };
            addItem(newImage);
            setTool('select'); // Switch back to select after adding
        } catch (err) {
            console.error("Failed to load image", err);
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleToolClick = (id) => {
        if (id === 'image') {
            fileInputRef.current?.click();
        } else {
            setTool(id);
        }
    };

    const handleAddComment = () => {
        if (selection.length !== 1) return;
        const selectedItem = items.find(i => i.id === selection[0]);
        if (!selectedItem) return;

        // Position text below the item
        const newItem = {
            id: uuidv4(),
            type: 'text',
            x: selectedItem.x,
            y: selectedItem.y + (selectedItem.height * (selectedItem.scaleY || 1)) + 20,
            content: 'Add comment...',
            fontSize: 20,
            fontFamily: "'Inter', sans-serif",
            color: '#000000',
        };
        addItem(newItem);
    };

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'pan', icon: Hand, label: 'Pan' },
        { id: 'pen', icon: Pen, label: 'Draw' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'connect', icon: Link, label: 'Connect' },
        { id: 'note', icon: StickyNote, label: 'Add Note' },
        { id: 'image', icon: ImageIcon, label: 'Add Image' },
    ];


    const colors = ['#000000', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
            />

            {/* Main Tools */}
            <div className="flex flex-col gap-2 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-gray-200 shadow-xl">
                {tools.map((t) => (
                    <ToolButton
                        key={t.id}
                        active={tool === t.id && t.id !== 'image'} // Don't keep image active as it's an action
                        icon={t.icon}
                        onClick={() => handleToolClick(t.id)}
                        label={t.label}
                    />
                ))}
            </div>

            {/* Tool Options (Pen) */}
            {tool === 'pen' && (
                <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-xl animate-in fade-in slide-in-from-left-5">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Stroke</div>
                    {/* Color Picker */}
                    <div className="grid grid-cols-2 gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setPenColor(c)}
                                className={clsx(
                                    "w-6 h-6 rounded-full border border-gray-200 transition-transform",
                                    penColor === c ? "ring-2 ring-offset-1 ring-blue-500 scale-110" : "hover:scale-105"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Size Slider */}
                    <div className="flex flex-col gap-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase">Size</div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={penSize}
                            onChange={(e) => setPenSize(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* Tool Options (Eraser) */}
            {tool === 'eraser' && (
                <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-xl animate-in fade-in slide-in-from-left-5">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Eraser Size</div>
                    <div className="flex flex-col gap-1">
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={eraserSize}
                            onChange={(e) => setEraserSize(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>
                </div>
            )}

            {/* Context Action: Add Comment */}
            {selection.length === 1 && items.find(i => i.id === selection[0])?.type === 'image' && (
                <div className="fixed left-20 top-1/2 translate-x-4 flex flex-col gap-2 z-50 animate-in fade-in zoom-in slide-in-from-left-2">
                    <button
                        onClick={handleAddComment}
                        className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow flex items-center gap-2"
                    >
                        <MessageSquarePlus size={18} />
                        Add Comment
                    </button>
                </div>
            )}
        </div>
    );
};

export default Toolbar;
