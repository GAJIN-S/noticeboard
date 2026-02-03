import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { useBoardStore } from '../../store/useBoardStore';
import { Pin } from './Pin';

const StickyNote = ({ item, isSelected, onClick }) => {
    const { updateItem } = useBoardStore();
    const shapeRef = useRef();
    const trRef = useRef();

    // Pin position relative to note
    const pinX = item.width / 2;
    const pinY = 12;

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = (e) => {
        updateItem(item.id, {
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        updateItem(item.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(100, node.width() * scaleX),
            height: Math.max(100, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    return (
        <>
            <Group
                id={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                draggable
                onClick={(e) => onClick(e, item)}
                onTap={(e) => onClick(e, item)}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                ref={shapeRef}
            >
                {/* Paper visual stack */}
                <Group>
                    {/* Deep Shadow */}
                    <Rect
                        x={4}
                        y={4}
                        width={item.width}
                        height={item.height}
                        fill="black"
                        opacity={0.2}
                        cornerRadius={2}
                        listening={false}
                    />

                    {/* The Paper */}
                    <Rect
                        width={item.width}
                        height={item.height}
                        fill={item.color || '#fef3c7'}
                        stroke="#d1d5db" // light grey border
                        strokeWidth={1}
                        cornerRadius={1}
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOpacity={0.1}
                        shadowOffset={{ x: 2, y: 2 }}
                    />

                    {/* Paper Texture / Lines (Simple) */}
                    {/* We could add horizontal lines here for lined paper look if wanted, 
                but keeping it clean for now. */}
                </Group>

                <Text
                    text={item.content}
                    width={item.width}
                    height={item.height}
                    padding={24} // Space for pin
                    fontFamily="'Architects Daughter', cursive, 'Inter', sans-serif" // Handwriting font if avail, else Inter
                    fontSize={18}
                    fill="#1f2937"
                    align="center"
                    verticalAlign="middle"
                    fontStyle="bold"
                />

                {/* The Safety Pin */}
                <Pin x={pinX} y={pinY} color="#ef4444" />
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 100 || newBox.height < 100) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

export default StickyNote;
