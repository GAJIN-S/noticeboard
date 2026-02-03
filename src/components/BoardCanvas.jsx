import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { useBoardStore } from '../../store/useBoardStore';
import Background from './canvas/Background';
import StickyNote from './canvas/StickyNote';
import UrlImage from './canvas/UrlImage';
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
        connections,
        addConnection
    } = useBoardStore();

    const [currentLine, setCurrentLine] = useState(null);
    const [connectingFrom, setConnectingFrom] = useState(null);

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
                size: penSize
            });
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
                className={tool === 'pen' || tool === 'eraser' ? 'cursor-crosshair' : tool === 'connect' ? 'cursor-crosshair' : 'cursor-default'}
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
                        const Component = item.type === 'note' ? StickyNote : UrlImage;
                        return (
                            <Component
                                key={item.id}
                                item={item}
                                isSelected={selection.includes(item.id)}
                                onClick={handleItemClick}
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
        </div>
    );
};

export default BoardCanvas;
