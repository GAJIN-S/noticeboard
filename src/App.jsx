import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import BoardCanvas from './components/BoardCanvas';
import Toolbar from './components/Toolbar';
import BoardHeader from './components/BoardHeader';
import Dashboard from './components/Dashboard';
import { useBoardData } from './hooks/useBoardData';

const BoardView = () => {
  const { boardId } = useParams();
  const { loading } = useBoardData(boardId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Loading board...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-100 font-sans selection:bg-blue-200">
      <BoardHeader />
      <Toolbar />
      <BoardCanvas />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/board/:boardId" element={<BoardView />} />
    </Routes>
  );
}

export default App;
