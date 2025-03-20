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
    const [previousPositions, setPreviousPositions] = useState<Record<string, Position>>({});
    const [dragging, setDragging] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 550, height: 350 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [activeLinks, setActiveLinks] = useState<string[]>([]);
    const [highlightedMachine, setHighlightedMachine] = useState<string | null>(null);
    const [animationInProgress, setAnimationInProgress] = useState(false);
    
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
    
    useEffect(() => {
        if (initialPositions && Object.keys(initialPositions).length > 0) {
            setPositions(initialPositions);
        } else {
            const freshCirclePositions = calculateCirclePositions();
            setPositions(freshCirclePositions);
        }
    }, [initialPositions, calculateCirclePositions]);
    
    useEffect(() => {
        const freshCirclePositions = calculateCirclePositions();
        setPreviousPositions({...positions});
        
        setPositions(prev => {
            const updatedPositions = { ...prev };
            machines.forEach(machine => {
                if (!updatedPositions[machine.id]) {
                    updatedPositions[machine.id] = freshCirclePositions[machine.id];
                }
            });
            
            return updatedPositions;
        });
        
        if (machines.some(machine => !positions[machine.id])) {
            setAnimationInProgress(true);
            setTimeout(() => setAnimationInProgress(false), 800);
        }
    }, [machines, calculateCirclePositions, positions]);
    
    const handleSvgMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && !dragging) {
            setIsPanning(true);
            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    };
    
    const handleSvgMouseMove = (e: React.MouseEvent) => {
        if (dragging) {
            const svg = svgRef.current;
            if (!svg) return;
            
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            
            const svgP = point.matrixTransform(svg.getScreenCTM()?.inverse());
            
            const newPositions = {
                ...positions,
                [dragging]: {
                    x: svgP.x,
                    y: svgP.y
                }
            };
            
            setPositions(newPositions);
            
            if (onPositionsChange) {
                onPositionsChange(newPositions);
            }
            
            const connectedLinks = links
                .filter(link => link.source === dragging || link.target === dragging)
                .map(link => `${link.source}-${link.target}`);
            
            setActiveLinks(connectedLinks);
        } else if (isPanning) {
            const dx = e.clientX - lastPosition.x;
            const dy = e.clientY - lastPosition.y;
            
            const panSpeed = 1 / scale;
            
            setViewBox(prev => ({
                ...prev,
                x: prev.x - dx * panSpeed,
                y: prev.y - dy * panSpeed
            }));
            
            setLastPosition({ x: e.clientX, y: e.clientY });
        }
    };
    
    const handleSvgMouseUp = () => {
        setIsPanning(false);
        if (dragging) {
            setAnimationInProgress(true);
            setTimeout(() => {
                setAnimationInProgress(false);
                setActiveLinks([]);
            }, 300);
        }
        setDragging(null);
    };
    
    const handleSvgMouseLeave = () => {
        setIsPanning(false);
        setDragging(null);
        setActiveLinks([]);
    };
    
    const handleMachineDragStart = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDragging(id);
        
        const connectedLinks = links
            .filter(link => link.source === id || link.target === id)
            .map(link => `${link.source}-${link.target}`);
        
        setActiveLinks(connectedLinks);
    };
    
    const handleMachineHover = (id: string) => {
        if (!dragging) {
            setHighlightedMachine(id);
            
            const connectedLinks = links
                .filter(link => link.source === id || link.target === id)
                .map(link => `${link.source}-${link.target}`);
            
            setActiveLinks(connectedLinks);
        }
    };
    
    const handleMachineLeave = () => {
        if (!dragging) {
            setHighlightedMachine(null);
            setActiveLinks([]);
        }
    };
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        
        const svg = svgRef.current;
        if (!svg) return;
        
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const svgP = point.matrixTransform(svg.getScreenCTM()?.inverse());
        
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const newScale = Math.max(0.5, Math.min(5, scale * zoomFactor));
        
        const newWidth = viewBox.width * (scale / newScale);
        const newHeight = viewBox.height * (scale / newScale);
        
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
    
    const handleZoomIn = () => {
        setAnimationInProgress(true);
        setScale(prev => {
            const newScale = Math.min(5, prev * 1.2);
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
        setTimeout(() => setAnimationInProgress(false), 300);
    };
    
    const handleZoomOut = () => {
        setAnimationInProgress(true);
        setScale(prev => {
            const newScale = Math.max(0.5, prev / 1.2);
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
        setTimeout(() => setAnimationInProgress(false), 300);
    };
    
    const handleResetPositions = () => {
        setAnimationInProgress(true);
        setPreviousPositions({...positions});
        
        const freshCirclePositions = calculateCirclePositions();
        setPositions(freshCirclePositions);
        
        if (onPositionsChange) {
            onPositionsChange(freshCirclePositions);
        }
        
        setViewBox({ x: 0, y: 0, width: 550, height: 350 });
        setScale(1);
        
        setTimeout(() => setAnimationInProgress(false), 800);
    };
    
    const [pulseEffect, setPulseEffect] = useState(false);
    useEffect(() => {
        if (animationInProgress) {
            setPulseEffect(true);
            const timer = setTimeout(() => setPulseEffect(false), 800);
            return () => clearTimeout(timer);
        }
    }, [animationInProgress]);
    
    const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
    
    const getMachinePosition = (machineId: string) => {
        if (!positions[machineId]) return { x: 0, y: 0 };
        
        if (animationInProgress && previousPositions[machineId]) {
            return {
                x: positions[machineId].x,
                y: positions[machineId].y,
                animate: true,
                fromX: previousPositions[machineId].x,
                fromY: previousPositions[machineId].y
            };
        }
        
        return positions[machineId];
    };
    
    const getLinkId = (source: string, target: string) => `${source}-${target}`;
    
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
                style={{ transition: animationInProgress ? 'all 0.3s ease' : 'none' }}
            > 
                {/* Connection links */}
                {links.map((link, index) => {
                    // Only render links if we have positions for both machines
                    if (!positions[link.source] || !positions[link.target]) return null;
                    
                    const linkId = getLinkId(link.source, link.target);
                    const isActive = activeLinks.includes(linkId);
                    const sourcePos = getMachinePosition(link.source);
                    const targetPos = getMachinePosition(link.target);
                    
                    return (
                        <g key={index} className={isActive ? 'active-link' : ''}>
                            <MachineLink
                                sourceX={sourcePos.x}
                                sourceY={sourcePos.y}
                                targetX={targetPos.x}
                                targetY={targetPos.y}
                                type={link.type}
                            />
                            {isActive && (
                                <circle
                                    cx={(sourcePos.x + targetPos.x) / 2}
                                    cy={(sourcePos.y + targetPos.y) / 2}
                                    r="3"
                                    fill={link.type === "connected" ? "#00FF9D" : "#FF3333"}
                                    opacity="0.8"
                                >
                                    <animate
                                        attributeName="r"
                                        values="3;5;3"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                        </g>
                    );
                })}
                
                {links.filter(link => link.type === "connected").map((link, index) => {
                    if (!positions[link.source] || !positions[link.target]) return null;
                    
                    const sourcePos = positions[link.source];
                    const targetPos = positions[link.target];
                    
                    const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
                    
                    const radius = 30;
                    const startX = sourcePos.x + Math.cos(angle) * radius;
                    const startY = sourcePos.y + Math.sin(angle) * radius;
                    const endX = targetPos.x - Math.cos(angle) * radius;
                    const endY = targetPos.y - Math.sin(angle) * radius;
                    
                    return (
                        <g key={`flow-${index}`}>
                            <circle r="2" fill="#00FF9D">
                                <animateMotion
                                    path={`M${startX},${startY} L${endX},${endY}`}
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                            <circle r="2" fill="#00FF9D">
                                <animateMotion
                                    path={`M${endX},${endY} L${startX},${startY}`}
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </g>
                    );
                })}
                
                {machines.map(machine => {
                    const machinePos = getMachinePosition(machine.id);
                    if (!machinePos) return null;
                    
                    const isHighlighted = highlightedMachine === machine.id || dragging === machine.id;
                    
                    return (
                        <g 
                            key={machine.id}
                            onMouseDown={(e) => handleMachineDragStart(machine.id, e)}
                            onMouseEnter={() => handleMachineHover(machine.id)}
                            onMouseLeave={handleMachineLeave}
                            style={{ 
                                transition: animationInProgress ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                                transform: `translate(${machinePos.x}px, ${machinePos.y}px)`,
                                transformOrigin: '0 0'
                            }}
                        >
                            {isHighlighted && (
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="35"
                                    fill="transparent"
                                    stroke={machine.status === "connected" ? "#00FF9D" : "#FF3333"}
                                    strokeWidth="1"
                                    opacity="0.6"
                                >
                                    <animate
                                        attributeName="r"
                                        values="35;40;35"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.6;0.2;0.6"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                            
                            {pulseEffect && (
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="30"
                                    fill="transparent"
                                    stroke="white"
                                    strokeWidth="2"
                                    opacity="0.8"
                                >
                                    <animate
                                        attributeName="r"
                                        values="30;50;30"
                                        dur="0.8s"
                                        repeatCount="1"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.8;0;0.8"
                                        dur="0.8s"
                                        repeatCount="1"
                                    />
                                </circle>
                            )}
                            
                            <Machine
                                machine={machine}
                                x={0}
                                y={0}
                                onClick={() => onMachineClick(machine)}
                            />
                        </g>
                    );
                })}
                
                {highlightedMachine && positions[highlightedMachine] && (
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                )}
            </svg>
            
            <div className="visualizer-controls">
                <button 
                    onClick={handleZoomIn}
                    className="zoom-button"
                    style={{ transform: animationInProgress ? 'scale(1.1)' : 'scale(1)' }}
                >
                    +
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="zoom-button"
                    style={{ transform: animationInProgress ? 'scale(0.9)' : 'scale(1)' }}
                >
                    -
                </button>
                <button 
                    onClick={handleResetPositions}
                    className="zoom-button reset-button"
                    style={{ transform: animationInProgress ? 'scale(1.1)' : 'scale(1)' }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Visualizer;