import { create } from 'zustand';

export const useBoardStore = create((set, get) => ({
    // Board State
    boardId: null,
    title: 'Untitled Board',
    boardColor: '#f5f5f5',
    backgroundTexture: null,

    items: [],
    connections: [],
    drawings: [],
    selection: [],

    // Viewport State
    stage: { scale: 1, x: 0, y: 0 },

    // Tool State
    tool: 'select',
    penColor: '#000000',
    penSize: 2,

    // Actions
    setBoardTitle: (title) => set({ title }),
    setBoardColor: (color) => set({ boardColor: color }),
    setBackgroundTexture: (texture) => set({ backgroundTexture: texture }),

    setTool: (tool) => set({ tool }),
    setPenColor: (color) => set({ penColor: color }),
    setPenSize: (size) => set({ penSize: size }),

    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updates } : item)
    })),
    removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        connections: state.connections.filter((c) => c.fromId !== id && c.toId !== id),
        selection: state.selection.filter((selId) => selId !== id)
    })),

    addConnection: (connection) => set((state) => ({ connections: [...state.connections, connection] })),
    removeConnection: (id) => set((state) => ({
        connections: state.connections.filter((c) => c.id !== id)
    })),

    addDrawing: (stroke) => set((state) => ({ drawings: [...state.drawings, stroke] })),
    clearDrawings: () => set({ drawings: [] }),

    setStage: (stage) => set({ stage }),

    setSelection: (selection) => set({ selection }),

    setWholeBoard: (data) => set({
        title: data.title || 'Untitled Board',
        boardColor: data.boardColor || '#f5f5f5',
        backgroundTexture: data.backgroundTexture || null,
        items: data.items || [],
        connections: data.connections || [],
        drawings: data.drawings || []
    }),
}));
