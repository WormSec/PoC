import React, { useState, useRef, useEffect, useCallback } from 'react';
import Machine from './Machine';
import MachineLink from './MachineLink';
import { Machine as MachineType, Link } from '../types';
import './Visualizer.css';

interface VisualizerProps {
    machines: MachineType[];
    links: Link[];
    onMachineClick: (machine: MachineType) => void;
    isReduced: boolean;
    initialPositions?: Record<string, Position>;
    onPositionsChange?: (positions: Record<string, Position>) => void;
}

interface Position {
    x: number;
    y: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ 
    machines, 
    links, 
    onMachineClick,
    isReduced,
    initialPositions,
    onPositionsChange
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [positions, setPositions] = useState<Record<string, Position>>({});
    const [dragging, setDragging] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 550, height: 350 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    
    // Calculate initial positions in a circle - memoized with useCallback
    const calculateCirclePositions = useCallback(() => {
        const centerX = 275;
        const centerY = 175;
        const radius = 100;
        
        const circlePositions: Record<string, Position> = {};
        machines.forEach((machine, index) => {
            const angle = (index * 2 * Math.PI) / machines.length;
            circlePositions[machine.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        
        return circlePositions;
    }, [machines]);
    
    // Initialize machine positions
    useEffect(() => {
        // Use initial positions if provided, otherwise calculate circle positions
        if (initialPositions && Object.keys(initialPositions).length > 0) {
            setPositions(initialPositions);
        } else {
            const freshCirclePositions = calculateCirclePositions();
            setPositions(freshCirclePositions);
        }
    }, [initialPositions, calculateCirclePositions]);
    
    // Update positions when new machines are added
    useEffect(() => {
        const freshCirclePositions = calculateCirclePositions();
        
        // Only set positions for machines that don't have them yet
        setPositions(prev => {
            const updatedPositions = { ...prev };
            machines.forEach(machine => {
                if (!updatedPositions[machine.id]) {
                    updatedPositions[machine.id] = freshCirclePositions[machine.id];
                }
            });
            
            return updatedPositions;
        });
    }, [machines, calculateCirclePositions]);
    
    // Handle mouse down on SVG for panning
    const handleSvgMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && !dragging) { // Left click and not dragging a machine
            setIsPanning(true);
            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    };
    
    // Handle mouse move for panning and dragging
    const handleSvgMouseMove = (e: React.MouseEvent) => {
        if (dragging) {
            // We're dragging a machine
            const svg = svgRef.current;
            if (!svg) return;
            
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            
            // Convert client coordinates to SVG coordinates
            const svgP = point.matrixTransform(svg.getScreenCTM()?.inverse());
            
            const newPositions = {
                ...positions,
                [dragging]: {
                    x: svgP.x,
                    y: svgP.y
                }
            };
            
            setPositions(newPositions);
            
            // Call the callback if provided
            if (onPositionsChange) {
                onPositionsChange(newPositions);
            }
        } else if (isPanning) {
            // We're panning the view
            const dx = e.clientX - lastPosition.x;
            const dy = e.clientY - lastPosition.y;
            
            // Adjust based on current scale
            const panSpeed = 1 / scale;
            
            setViewBox(prev => ({
                ...prev,
                x: prev.x - dx * panSpeed,
                y: prev.y - dy * panSpeed
            }));
            
            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    };
    
    // Handle mouse up for ending panning and dragging
    const handleSvgMouseUp = () => {
        setIsPanning(false);
        setDragging(null);
    };
    
    // Handle mouse leave for ending panning and dragging
    const handleSvgMouseLeave = () => {
        setIsPanning(false);
        setDragging(null);
    };
    
    // Handle machine drag start
    const handleMachineDragStart = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent SVG from starting a pan operation
        setDragging(id);
    };
    
    // Handle zoom with mouse wheel
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        
        const svg = svgRef.current;
        if (!svg) return;
        
        // Get mouse position in SVG coordinates
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const svgP = point.matrixTransform(svg.getScreenCTM()?.inverse());
        
        // Calculate new scale
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const newScale = Math.max(0.5, Math.min(5, scale * zoomFactor));
        
        // Calculate new viewBox dimensions
        const newWidth = viewBox.width * (scale / newScale);
        const newHeight = viewBox.height * (scale / newScale);
        
        // Calculate new viewBox position to zoom toward/away from mouse
        const mouseXRatio = (svgP.x - viewBox.x) / viewBox.width;
        const mouseYRatio = (svgP.y - viewBox.y) / viewBox.height;
        
        const newX = svgP.x - mouseXRatio * newWidth;
        const newY = svgP.y - mouseYRatio * newHeight;
        
        setViewBox({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
        });
        
        setScale(newScale);
    };
    
    // Handle zoom in button
    const handleZoomIn = () => {
        setScale(prev => {
            const newScale = Math.min(5, prev * 1.2);
            // Adjust viewBox to maintain center
            setViewBox(prev => {
                const centerX = prev.x + prev.width / 2;
                const centerY = prev.y + prev.height / 2;
                const newWidth = prev.width * (scale / newScale);
                const newHeight = prev.height * (scale / newScale);
                return {
                    x: centerX - newWidth / 2,
                    y: centerY - newHeight / 2,
                    width: newWidth,
                    height: newHeight
                };
            });
            return newScale;
        });
    };
    
    // Handle zoom out button
    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(0.5, prev / 1.2);
            // Adjust viewBox to maintain center
            setViewBox(prev => {
                const centerX = prev.x + prev.width / 2;
                const centerY = prev.y + prev.height / 2;
                const newWidth = prev.width * (scale / newScale);
                const newHeight = prev.height * (scale / newScale);
                return {
                    x: centerX - newWidth / 2,
                    y: centerY - newHeight / 2,
                    width: newWidth,
                    height: newHeight
                };
            });
            return newScale;
        });
    };
    
    // Handle reset button
    const handleResetPositions = () => {
        // Calculate fresh circle positions to ensure consistency
        const freshCirclePositions = calculateCirclePositions();
        setPositions(freshCirclePositions);
        
        // Also update in localStorage via the callback
        if (onPositionsChange) {
            onPositionsChange(freshCirclePositions);
        }
        
        // Reset viewBox and scale
        setViewBox({ x: 0, y: 0, width: 550, height: 350 });
        setScale(1);
    };
    
    // Compute viewBox string
    const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
    
    return (
        <div className={`visualizer ${isReduced ? 'reduced' : ''}`}>
            <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                viewBox={viewBoxString}
                onMouseDown={handleSvgMouseDown}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseLeave}
                onWheel={handleWheel}
            >
                {links.map((link, index) => {
                    // Only render links if we have positions for both machines
                    if (!positions[link.source] || !positions[link.target]) return null;
                    
                    return (
                        <MachineLink
                            key={index}
                            sourceX={positions[link.source].x}
                            sourceY={positions[link.source].y}
                            targetX={positions[link.target].x}
                            targetY={positions[link.target].y}
                            type={link.type}
                        />
                    );
                })}
                
                {machines.map(machine => {
                    // Only render machines if we have positions for them
                    if (!positions[machine.id]) return null;
                    
                    return (
                        <g 
                            key={machine.id}
                            onMouseDown={(e) => handleMachineDragStart(machine.id, e)}
                        >
                            <Machine
                                machine={machine}
                                x={positions[machine.id].x}
                                y={positions[machine.id].y}
                                onClick={() => onMachineClick(machine)}
                            />
                        </g>
                    );
                })}
            </svg>
            
            {/* Zoom controls - positioned in bottom right */}
            <div className="visualizer-controls">
                <button 
                    onClick={handleZoomIn}
                    className="zoom-button"
                >
                    +
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="zoom-button"
                >
                    -
                </button>
                <button 
                    onClick={handleResetPositions}
                    className="zoom-button"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Visualizer;