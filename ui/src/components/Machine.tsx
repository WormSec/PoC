import React, { useState, useEffect } from 'react';
import { Machine as MachineType } from '../types';
import './Machine.css';

interface MachineProps {
    machine: MachineType;
    x: number;
    y: number;
    onClick: () => void;
}

const Machine: React.FC<MachineProps> = ({ machine, x, y, onClick }) => {
    const [previousStatus, setPreviousStatus] = useState<string>(machine.status);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const circleClass = machine.status === "connected" ? "machine-circle-connected" : "machine-circle-isolated";
    const textClass = machine.status === "connected" ? "machine-text-connected" : "machine-text-isolated";

    // Détecter les changements d'état
    useEffect(() => {
        if (previousStatus !== machine.status) {
            setIsTransitioning(true);
            
            // Réinitialiser l'état de transition après l'animation
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setPreviousStatus(machine.status);
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [machine.status, previousStatus]);

    const handleClick = (e: React.MouseEvent) => {
        if (e.currentTarget.classList.contains('dragging')) {
            e.currentTarget.classList.remove('dragging');
            return;
        }
        onClick();
    };

    return (
        <g 
            className={`machine ${isTransitioning ? 'transitioning' : ''}`}
            onClick={handleClick} 
            transform={`translate(${x}, ${y})`}
            style={{ cursor: 'pointer' }}
        >
            <circle 
                className={`machine-circle ${circleClass}`} 
                cx="0" 
                cy="0" 
                r="30" 
                style={isTransitioning ? {
                    animation: machine.status === "connected" ? 
                        'pulse-connected 0.5s ease 3' : 
                        'pulse-isolated 0.5s ease 3'
                } : {}}
            />
            <text 
                className={`machine-text ${textClass}`} 
                x="0" 
                y="0" 
                textAnchor="middle" 
                dominantBaseline="central"
            >
                {machine.name}
            </text>
        </g>
    );
};

export default Machine;