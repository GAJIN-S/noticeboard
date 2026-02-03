import { useEffect, useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';

// Debounce helper
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export const useBoardData = (boardId) => {
    const {
        items, connections, drawings, title, boardColor, backgroundTexture,
        setWholeBoard
    } = useBoardStore();

    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load initial data from LocalStorage
    useEffect(() => {
        if (!boardId) return;

        setLoading(true);

        try {
            const boards = JSON.parse(localStorage.getItem('local_boards') || '[]');
            const board = boards.find(b => b.id === boardId);

            if (board) {
                setWholeBoard(board);
            } else {
                console.log("Board not found in local storage, starting fresh.");
            }
        } catch (e) {
            console.error("Error loading from local storage:", e);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [boardId]);

    // Prepared data object
    const boardData = {
        id: boardId,
        items, connections, drawings, title, boardColor, backgroundTexture,
        updatedAt: new Date().toISOString()
    };

    const debouncedData = useDebounce(boardData, 1000);

    // Auto-save effect
    useEffect(() => {
        if (isInitialLoad || loading || !boardId) return;

        const saveBoard = () => {
            try {
                const boards = JSON.parse(localStorage.getItem('local_boards') || '[]');
                const index = boards.findIndex(b => b.id === boardId);

                if (index >= 0) {
                    boards[index] = { ...boards[index], ...debouncedData };
                } else {
                    boards.push(debouncedData);
                }

                localStorage.setItem('local_boards', JSON.stringify(boards));
                console.log("Auto-saved to LocalStorage");
            } catch (e) {
                console.error("Error auto-saving locally:", e);
            }
        };

        saveBoard();
    }, [debouncedData, boardId, isInitialLoad, loading]);

    return { loading };
};
