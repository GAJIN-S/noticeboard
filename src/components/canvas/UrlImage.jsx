import React, { useRef, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useBoardStore } from '../../store/useBoardStore';
import { Pin } from './Pin';

const UrlImage = ({ item, isSelected, onClick }) => {
    const [img] = useImage(item.content, 'anonymous');
    const { updateItem } = useBoardStore();
    const shapeRef = useRef();
    const trRef = useRef();

    const pinX = item.width / 2;
    const pinY = 12;

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = (e) => {
        updateItem(item.id, { x: e.target.x(), y: e.target.y() });
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
            width: Math.max(50, node.width() * scaleX),
            height: Math.max(50, node.height() * scaleY),
            rotation: node.rotation()
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
                {/* Polaroid Frame Shadow */}
                <Rect
                    x={-8}
                    y={-8}
                    width={item.width + 24} // 12px padding L/R
                    height={item.height + 60} // Big bottom lip
                    fill="black"
                    opacity={0.3}
                    cornerRadius={2}
                    shadowColor="black"
                    shadowBlur={10}
                    shadowOpacity={0.4}
                    shadowOffset={{ x: 5, y: 5 }}
                />

                {/* Polaroid Frame Body */}
                <Rect
                    x={-12}
                    y={-12}
                    width={item.width + 24}
                    height={item.height + 60}
                    fill="#f9fafb" // Off-white
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    cornerRadius={2}
                />

                {/* Actual Image */}
                <KonvaImage
                    image={img}
                    width={item.width}
                    height={item.height}
                    stroke="#000"
                    strokeWidth={1}
                    opacity={0.95} // Slight film look
                />

                {/* The Pin - maybe blue/teal for evidence */}
                <Pin x={pinX} y={pinY} color="#0ea5e9" />
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 50 || newBox.height < 50) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

export default UrlImage;
