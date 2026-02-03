import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, Clock, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        const fetchBoards = () => {
            const saved = JSON.parse(localStorage.getItem('local_boards') || '[]');
            // Sort by updatedAt desc
            saved.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            setBoards(saved);
        };
        fetchBoards();
    }, []);

    const createNewBoard = () => {
        const id = uuidv4();
        const newBoard = {
            id,
            title: 'Untitled Investigation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [],
            connections: [],
            drawings: [],
            boardColor: '#f5f5f5'
        };

        const existing = JSON.parse(localStorage.getItem('local_boards') || '[]');
        localStorage.setItem('local_boards', JSON.stringify([newBoard, ...existing]));
        navigate(`/board/${id}`);
    };

    const deleteBoard = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this board?")) {
            const filtered = boards.filter(b => b.id !== id);
            setBoards(filtered);
            localStorage.setItem('local_boards', JSON.stringify(filtered));
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Layout className="w-10 h-10 text-blue-600" />
                        Investigation Boards
                        <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded ml-2">Local Storage Mode</span>
                    </h1>
                    <button
                        onClick={createNewBoard}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        New Investigation
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button
                        onClick={createNewBoard}
                        className="group relative h-64 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <span className="text-gray-500 font-medium group-hover:text-blue-700">Create New Board</span>
                    </button>

                    {boards.map(board => (
                        <div
                            key={board.id}
                            onClick={() => navigate(`/board/${board.id}`)}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 p-6 h-64 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => deleteBoard(e, board.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Board"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {board.title || 'Untitled Board'}
                                </h3>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Clock size={14} />
                                    {board.updatedAt
                                        ? new Date(board.updatedAt).toLocaleDateString()
                                        : 'Unknown'}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                                    {board.items?.length || 0} Items
                                </div>
                                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                                    {board.drawings?.length || 0} Drawings
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {boards.length === 0 && (
                    <div className="text-center mt-20 text-gray-400">
                        <p>No investigations found. Start a new one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
