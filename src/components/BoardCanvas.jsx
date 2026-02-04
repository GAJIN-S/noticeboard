import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { useBoardStore } from '../store/useBoardStore';
import Background from './canvas/Background';
import StickyNote from './canvas/StickyNote';
import UrlImage from './canvas/UrlImage';
import TextItem from './canvas/TextItem';
import { v4 as uuidv4 } from 'uuid';

import { uploadImage } from '../utils/uploadImage';

const BoardCanvas = () => {
    const stageRef = useRef(null);
    const isDrawing = useRef(false);
    const {
        stage: stageState,
        setStage,
        tool,
        items,
        selection,
        setSelection,
        addItem,
        setTool,
        drawings,
        addDrawing,

        penColor,
        penSize,
        eraserSize, // Added
        connections,
        addConnection
    } = useBoardStore();


    const [currentLine, setCurrentLine] = useState(null);
    const [connectingFrom, setConnectingFrom] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // ID of item being edited
    const textareaRef = useRef(null);

    // Initial focus support for invalidating selection or starting types
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if we are already editing in the textarea
            if (editingItem) return;

            // Ignore shortcuts (Ctrl/Cmd/Alt)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            // Start typing if it's a regular key (length 1)
            if (e.key.length === 1) {
                // Determine position
                let x, y;
                const stage = stageRef.current;

                // If selection has an image/note, place under it
                if (selection.length === 1) {
                    const selectedItem = items.find(i => i.id === selection[0]);
                    if (selectedItem) {
                        x = selectedItem.x;
                        y = selectedItem.y + (selectedItem.height * (selectedItem.scaleY || 1)) + 20;
                    } else {
                        // Fallback to cursor
                        const pos = toRelative(stage.getPointerPosition() || stage.getPointerPosition() || { x: window.innerWidth / 2, y: window.innerHeight / 2 }); // fallback if no pointer
                        x = pos.x;
                        y = pos.y;
                    }
                } else {
                    // Place at mouse position or center
                    const pointer = stage.getPointerPosition();
                    const pos = pointer ? toRelative(pointer) : toRelative({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                    x = pos.x;
                    y = pos.y;
                }

                const newItem = {
                    id: uuidv4(),
                    type: 'text',
                    x,
                    y,
                    content: e.key,
                    fontSize: 20,
                    fontFamily: "'Inter', sans-serif",
                    color: penColor !== '#000000' ? penColor : '#000000', // Use current pen color if set, else black
                };

                addItem(newItem);
                setEditingItem(newItem.id);
                setSelection([newItem.id]);

                // We need to wait for render to focus the textarea? 
                // We'll trust the useEffect depends on editingItem to focus.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingItem, selection, items, stageRef, penColor, addItem, setSelection]);

    useEffect(() => {
        if (editingItem && textareaRef.current) {
            // Focus and put cursor at end
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
        }
    }, [editingItem]);

    const handleTextareaBlur = () => {
        const item = items.find(i => i.id === editingItem);
        // If empty content, remove item? Or just keep it.
        // Let's keep it for now.
        setEditingItem(null);
    };

    const handleTextChange = (e) => {
        const val = e.target.value;
        const item = items.find(i => i.id === editingItem);
        if (item) {
            useBoardStore.getState().updateItem(editingItem, { content: val });

            // Auto-resize logic
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';

            // For width, it's tricker with textarea. 
            // We can use a canvas measure or a hidden span.
            // For now, let's just use a reasonable min-width and allow manual resize if we were using a different element.
            // But since we want "type anywhere", maybe we just give it a large width if it's meant to be a line?
            // Or better: Use `cols`?
            e.target.style.width = 'auto';
            e.target.style.width = (e.target.scrollWidth + 10) + 'px';
        }
    };

    // Calculate textarea position
    const getTextAreaStyle = () => {
        if (!editingItem) return { display: 'none' };
        const item = items.find(i => i.id === editingItem);
        if (!item) return { display: 'none' };

        const stage = stageRef.current;
        const stagePos = stage.position();
        const stageScale = stage.scaleX();

        // Convert item position to absolute window coordinates
        // item.x/y are relative to stage origin (inside the scaled stage)
        // so: absoluteX = stage.x + (item.x * stage.scale)
        const absX = stagePos.x + (item.x * stageScale);
        const absY = stagePos.y + (item.y * stageScale);

        const fontSize = (item.fontSize || 20) * stageScale * (item.scaleX || 1);

        return {
            position: 'absolute',
            top: absY + 'px',
            left: absX + 'px',
            fontSize: fontSize + 'px',
            lineHeight: 1.2, // Match Konva text default
            color: item.color,
            fontFamily: item.fontFamily,
            border: '1px dashed #ccc', // Initial border to see it
            padding: '0px',
            margin: '0px',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            whiteSpace: 'pre',
            zIndex: 100,
            transformOrigin: 'top left',
            transform: `rotate(${item.rotation || 0}deg)`,
            minWidth: '50px',
            minHeight: fontSize * 1.2 + 'px',
        };
    };


    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const cursor = stage.getPointerPosition();
        const scaleBy = 1.1;
        const mousePointTo = {
            x: cursor.x / oldScale - stage.x() / oldScale,
            y: cursor.y / oldScale - stage.y() / oldScale,
        };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        if (newScale < 0.1 || newScale > 5) return;
        const newPos = {
            x: -(mousePointTo.x - cursor.x / newScale) * newScale,
            y: -(mousePointTo.y - cursor.y / newScale) * newScale,
        };
        setStage({ scale: newScale, x: newPos.x, y: newPos.y });
    };

    const handleDragEnd = (e) => {
        if (e.target === e.target.getStage()) {
            setStage({
                scale: stageRef.current.scaleX(),
                x: e.target.x(),
                y: e.target.y(),
            });
        }
    };

    const toRelative = (pos) => {
        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        return transform.point(pos);
    };

    const handleMouseDown = (e) => {
        const stage = e.target.getStage();
        const pos = toRelative(stage.getPointerPosition());

        if (tool === 'pen' || tool === 'eraser') {
            isDrawing.current = true;
            setCurrentLine({
                tool,
                points: [pos.x, pos.y],
                color: tool === 'eraser' ? null : penColor,
                size: tool === 'eraser' ? (eraserSize || 20) : penSize // Use eraser size
            });
            return;
        }

        if (tool === 'text') {
            // Create text at click position
            const newItem = {
                id: uuidv4(),
                type: 'text',
                x: pos.x,
                y: pos.y,
                content: 'Type here...',
                fontSize: 20,
                fontFamily: "'Inter', sans-serif",
                color: penColor !== '#000000' ? penColor : '#000000',
            };
            addItem(newItem);
            setEditingItem(newItem.id);
            setSelection([newItem.id]);
            setTool('select'); // Switch back to select? Or keep text tool?
            // Usually text tools switch back after one placement, or stay. 
            // Let's switch back for workflow simplicity.
            return;
        }


        if (e.target === stage) {
            setSelection([]);
            setConnectingFrom(null);

            if (tool === 'note') {
                const newNote = {
                    id: uuidv4(),
                    type: 'note',
                    x: pos.x,
                    y: pos.y,
                    width: 220,
                    height: 220,
                    rotation: (Math.random() - 0.5) * 10, // Random tilt
                    content: 'Double click to edit',
                    color: '#fef3c7',
                };
                addItem(newNote);
                setTool('select');
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || !currentLine) return;
        const stage = e.target.getStage();
        const pos = toRelative(stage.getPointerPosition());
        setCurrentLine({
            ...currentLine,
            points: [...currentLine.points, pos.x, pos.y]
        });
    };

    const handleMouseUp = () => {
        if (isDrawing.current && currentLine) {
            isDrawing.current = false;
            addDrawing({
                id: uuidv4(),
                ...currentLine
            });
            setCurrentLine(null);
        }
    };

    const handleItemClick = (e, item) => {
        if (tool === 'connect') {
            if (!connectingFrom) {
                setConnectingFrom(item.id);
            } else {
                if (connectingFrom !== item.id) {
                    addConnection({
                        id: uuidv4(),
                        fromId: connectingFrom,
                        toId: item.id,
                        color: 'red'
                    });
                }
                setConnectingFrom(null);
            }
        } else {
            setSelection([item.id]);
        }
    };

    const handleStageClick = (e) => {
        // Double click to edit text (or create text?)
        // Actually we used keydown. But double click on valid item should edit.
        // We need to handle this in `handleItemDblClick` or similar.
    };

    const handleItemDblClick = (e, item) => {
        if (item.type === 'text' || item.type === 'note') {
            setEditingItem(item.id);
        }
    };


    const handleDrop = async (e) => {
        e.preventDefault();
        stageRef.current.setPointersPositions(e);
        const stage = stageRef.current;

        const pos = toRelative(stage.getPointerPosition());

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                try {
                    const url = await uploadImage(file);
                    const newImage = {
                        id: uuidv4(),
                        type: 'image',
                        x: pos.x,
                        y: pos.y,
                        width: 300,
                        height: 300,
                        rotation: (Math.random() - 0.5) * 20, // Random tilt
                        content: url,
                    };
                    addItem(newImage);
                } catch (err) {
                    console.error("Upload failed", err);
                }
            }
        }
    };

    //   Calculate Pin Position for strings to attach to
    const getItemPinPosition = (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return { x: 0, y: 0 };

        const angleRad = (item.rotation || 0) * Math.PI / 180;
        const w = item.width;

        // Pin relative coordinates (Top center)
        const px = w / 2;
        const py = 12;

        // Roatate around (0,0) (top-left of item)
        const rx = px * Math.cos(angleRad) - py * Math.sin(angleRad);
        const ry = px * Math.sin(angleRad) + py * Math.cos(angleRad);

        return {
            x: item.x + rx,
            y: item.y + ry
        };
    };

    return (
        <div
            className="w-full h-full bg-neutral-900 overflow-hidden relative"
            id="canvas-container"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onWheel={handleWheel}
                scaleX={stageState.scale}
                scaleY={stageState.scale}
                x={stageState.x}
                y={stageState.y}
                draggable={tool === 'select' || tool === 'pan'}
                onDragEnd={handleDragEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                ref={stageRef}
                className={tool === 'pen' || tool === 'eraser' ? 'cursor-crosshair' : tool === 'connect' ? 'cursor-crosshair' : tool === 'text' ? 'cursor-text' : 'cursor-default'}

            >
                <Layer>

                    <Background />
                </Layer>

                {/* Connections Layer (Under Items, but strings usually go over... 
            Actually strings go PINTOPIN, so they should be on top of items theoretically? 
            Or at least under the pin head but over the paper? 
            Konva layers are strict. Let's put strings UNDER items for now to avoid z-fighting with text, 
            or we can make a separate Pin Layer on top. 
            For simplicity: Strings Layer -> Item Layer. 
            Result: Strings look like they go under the photo. 
            Better: Item Layer (Paper/Photo) -> Strings Layer -> Pin Layer.
            That's too complex for this refactor. Let's stick to Strings ON TOP of Items.
        */}

                <Layer>
                    {items.map((item) => {
                        let Component;
                        switch (item.type) {
                            case 'note': Component = StickyNote; break;
                            case 'image': Component = UrlImage; break;
                            case 'text': Component = TextItem; break;
                            default: Component = StickyNote;
                        }

                        return (
                            <Component
                                key={item.id}
                                item={item}
                                isSelected={selection.includes(item.id)}
                                isEditing={editingItem === item.id}
                                onClick={handleItemClick}
                                onDblClick={(e) => handleItemDblClick(e, item)}
                            />
                        );
                    })}
                </Layer>


                {/* Strings on Top of Items to look like they are tied to the pins */}
                <Layer listening={false}>
                    {connections.map(conn => {
                        const start = getItemPinPosition(conn.fromId);
                        const end = getItemPinPosition(conn.toId);
                        return (
                            <Line
                                key={conn.id}
                                points={[start.x, start.y, end.x, end.y]}
                                stroke="#b91c1c" // Deep Red
                                strokeWidth={2}
                                shadowColor="black"
                                shadowBlur={2}
                                shadowOpacity={0.5}
                                shadowOffset={{ x: 1, y: 1 }}
                                perfectDrawEnabled={false}
                            />
                        );
                    })}
                    {connectingFrom && (
                        <Line
                            points={[
                                getItemPinPosition(connectingFrom).x,
                                getItemPinPosition(connectingFrom).y,
                                // We can't easily track mouse pos here without state, so just show a dot
                            ]}
                        />
                    )}
                    {/* Drawing Layer on very top */}
                    {drawings.map((line, i) => (
                        <Line
                            key={line.id}
                            points={line.points}
                            stroke={line.tool === 'eraser' ? "#ffffff" : line.color}
                            strokeWidth={line.size}
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                    {currentLine && (
                        <Line
                            points={currentLine.points}
                            stroke={currentLine.tool === 'eraser' ? "#ffffff" : currentLine.color}
                            strokeWidth={currentLine.size}
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation={
                                currentLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    )}
                </Layer>

            </Stage>

            {connectingFrom && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg font-bold pointer-events-none animate-pulse">
                    Select another item to connect thread...
                </div>
            )}

            {/* Text Editing Overlay */}
            {editingItem && (() => {
                const item = items.find(i => i.id === editingItem);
                if (!item) return null;
                return (
                    <textarea
                        ref={textareaRef}
                        value={item.content}
                        onChange={handleTextChange}
                        onBlur={handleTextareaBlur}
                        style={getTextAreaStyle()}
                        // Autosize logic could go here or via library. 
                        // For a simple text tool, we want it to expand. 
                        // We can solve this by calculating cols/rows or just explicit px width.
                        // A quick hack for auto-width is using a span measurer, but for now fixed min width.
                        className="bg-transparent border-none outline-none resize-none overflow-hidden"
                    />
                );
            })()}
        </div>
    );
};

export default BoardCanvas;
