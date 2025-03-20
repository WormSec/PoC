import React, { useState, useEffect } from 'react';
import './MachineLink.css';

interface MachineLinkProps {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    type: "connected" | "isolated";
}

const MachineLink: React.FC<MachineLinkProps> = ({ 
    sourceX, 
    sourceY, 
    targetX, 
    targetY,
    type
}) => {
    const [previousType, setPreviousType] = useState<string>(type);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    
    const isConnected = type === "connected";
    const strokeColor = isConnected ? "#00FF9D" : "#FF3333";
    const strokeDashArray = isConnected ? "none" : "5,5";
    
    useEffect(() => {
        if (previousType !== type) {
            setIsTransitioning(true);
            
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setPreviousType(type);
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [type, previousType]);
    
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    
    const radius = 30; 
    const startX = sourceX + Math.cos(angle) * radius;
    const startY = sourceY + Math.sin(angle) * radius;
    const endX = targetX - Math.cos(angle) * radius;
    const endY = targetY - Math.sin(angle) * radius;
    
    const arrowSize = 8;
    const arrowAngle = 0.5;
    
    const point1X = endX - arrowSize * Math.cos(angle - arrowAngle);
    const point1Y = endY - arrowSize * Math.sin(angle - arrowAngle);
    const point2X = endX - arrowSize * Math.cos(angle + arrowAngle);
    const point2Y = endY - arrowSize * Math.sin(angle + arrowAngle);
    
    const reverseAngle = Math.atan2(sourceY - targetY, sourceX - targetX);
    const reversePoint1X = startX - arrowSize * Math.cos(reverseAngle - arrowAngle);
    const reversePoint1Y = startY - arrowSize * Math.sin(reverseAngle - arrowAngle);
    const reversePoint2X = startX - arrowSize * Math.cos(reverseAngle + arrowAngle);
    const reversePoint2Y = startY - arrowSize * Math.sin(reverseAngle + arrowAngle);
    
    return (
        <g className={`machine-link machine-link-${type} ${isTransitioning ? 'transitioning' : ''}`}>
            <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray={strokeDashArray}
                style={isTransitioning ? {
                    animation: isConnected ? 
                        'link-appear 0.5s ease-out' : 
                        'dash-animation 20s linear infinite'
                } : {}}
            />
            
            {isConnected && (
                <>
                    <polygon 
                        points={`${endX},${endY} ${point1X},${point1Y} ${point2X},${point2Y}`}
                        fill={strokeColor}
                        style={isTransitioning ? { animation: 'link-appear 0.5s ease-out' } : {}}
                    />
                    <polygon 
                        points={`${startX},${startY} ${reversePoint1X},${reversePoint1Y} ${reversePoint2X},${reversePoint2Y}`}
                        fill={strokeColor}
                        style={isTransitioning ? { animation: 'link-appear 0.5s ease-out' } : {}}
                    />
                </>
            )}
        </g>
    );
};

export default MachineLink;