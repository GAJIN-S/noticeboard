import React from 'react';
import { Rect } from 'react-konva';
import useImage from 'use-image';

const Background = () => {
    // Using a seamless cork pattern from a public placeholder or similar would be ideal,
    // but for reliability we can generate a simple noise pattern on a canvas or use a color.
    // Let's settle for a nice distinctive color + pattern if possible, or a data URI for cork noise.

    // Simple Cork Color
    return (
        <Rect
            x={-50000}
            y={-50000}
            width={100000}
            height={100000}
            fill="#e0c097" // Cork-ish base color
            listening={false}
        />
    );

    // Note: To do a real texture, we'd need a pattern image. 
    // I will try to update this with a generated pattern if I can, but color is safe start.
};

export default Background;
