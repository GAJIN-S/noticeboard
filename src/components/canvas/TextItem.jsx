import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import { useBoardStore } from '../../store/useBoardStore';

const TextItem = ({ item, isSelected, onClick, isEditing }) => {
    const { updateItem } = useBoardStore();
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && !isEditing && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, isEditing]);

    const handleDragEnd = (e) => {
        updateItem(item.id, {
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        // Reset scale and adjust font size or width/height instead?
        // For text, usually we just scale the font size or the wrap width.
        // Let's stick to simple scaling for now, or update fontSize.
        // Konva Text behavior: scaling changes the scale attribute.
        // If we want to resize the text box width (wrapping), that's different from scaling.
        // Transformer default is scaling.

        // Let's update the stored state to reflect the visual transform
        updateItem(item.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: node.scaleY(), // Text usually scales uniformly
        });
    };

    return (
        <>
            <Text
                id={item.id}
                x={item.x}
                y={item.y}
                text={item.content}
                fontSize={item.fontSize || 20}
                fontFamily={item.fontFamily || "'Inter', sans-serif"}
                fill={item.color || '#000000'}
                draggable={!isEditing}
                onClick={(e) => onClick(e, item)}
                onTap={(e) => onClick(e, item)}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                ref={shapeRef}
                scaleX={item.scaleX || 1}
                scaleY={item.scaleY || 1}
                rotation={item.rotation || 0}
                visible={!isEditing} // Hide when editing (handled by HTML overlay)
            />
            {isSelected && !isEditing && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        newBox.width = Math.max(30, newBox.width);
                        return newBox;
                    }}
                    enabledAnchors={['middle-left', 'middle-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
                />
            )}
        </>
    );
};

export default TextItem;
