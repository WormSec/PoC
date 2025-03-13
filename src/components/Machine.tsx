import React from 'react';
import { Machine as MachineType } from '../types';
import './Machine.css';

interface MachineProps {
    machine: MachineType;
    x: number;
    y: number;
    onClick: () => void;
}

const Machine: React.FC<MachineProps> = ({ machine, x, y, onClick }) => {
    const circleClass = machine.status === "connected" ? "machine-circle-connected" : "machine-circle-isolated";
    const textClass = machine.status === "connected" ? "machine-text-connected" : "machine-text-isolated";

    const handleClick = (e: React.MouseEvent) => {
        if (e.currentTarget.classList.contains('dragging')) {
            e.currentTarget.classList.remove('dragging');
            return;
        }
        onClick();
    };

    return (
        <g 
            className="machine" 
            onClick={handleClick} 
            transform={`translate(${x}, ${y})`}
            style={{ cursor: 'pointer' }}
        >
            <circle className={`machine-circle ${circleClass}`} cx="0" cy="0" r="30" />
            <text className={`machine-text ${textClass}`} x="0" y="0" textAnchor="middle" dominantBaseline="central">
                {machine.name}
            </text>
        </g>
    );
};

export default Machine;