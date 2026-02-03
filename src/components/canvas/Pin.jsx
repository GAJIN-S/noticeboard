import React from 'react';
import { Circle, Group, Line } from 'react-konva';

export const Pin = ({ x, y, color = '#dc2626' }) => {
    return (
        <Group x={x} y={y}>
            {/* Pin Shadow (long, soft) */}
            <Circle
                x={4}
                y={4}
                radius={6}
                fill="black"
                opacity={0.3}
                scaleY={0.5}
                rotation={45}
            />

            {/* Pin Body (Plastic Head) */}
            <Circle
                radius={7}
                fill={color}
                shadowColor="black"
                shadowBlur={2}
                shadowOpacity={0.5}
                shadowOffset={{ x: 1, y: 1 }}
            />

            {/* Specular Highlight (Shiny Plastic) */}
            <Circle
                x={-2}
                y={-3}
                radius={2.5}
                fill="white"
                opacity={0.7}
            />

            {/* Metal Point (visible if needed, but usually hidden by paper) */}
            <Circle
                radius={1}
                fill="#555"
            />
        </Group>
    );
};
