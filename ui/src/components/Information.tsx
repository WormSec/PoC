import React from 'react';
import { Machine } from '../types';
import './Information.css';

interface InformationProps {
    machine: Machine;
}

const Information: React.FC<InformationProps> = ({ machine }) => {
    const circleClass = machine.status === "connected" ? "machine-circle-small-connected" : "machine-circle-small-isolated";
    const textClass = machine.status === "connected" ? "machine-text-small-connected" : "machine-text-small-isolated";
    
    return (
        <div className="information" data-status={machine.status}>
            <div className="info-header">
                <svg width="60" height="60" viewBox="0 0 80 80">
                    <circle className={`machine-circle-small ${circleClass}`} cx="40" cy="40" r="30" />
                    <text className={`machine-text-small ${textClass}`} x="40" y="40" textAnchor="middle" dominantBaseline="central">
                        {machine.name}
                    </text>
                </svg>
            </div>
            <div className="info-item">
                <div className="info-label">ID :</div> 
                <div className="info-value">{machine.id.padStart(7, 'x')}</div>
            </div>
            <div className="info-item">
                <div className="info-label">IP :</div> 
                <div className="info-value">{machine.ip}</div>
            </div>
            {machine.mac && (
                <div className="info-item">
                    <div className="info-label">MAC :</div> 
                    <div className="info-value">{machine.mac}</div>
                </div>
            )}
            <div className="info-item">
                <div className="info-label">Last update :</div> 
                <div className="info-value">{machine.lastUpdate}</div>
            </div>
            <div className="info-item">
                <div className="info-label">Status :</div> 
                <div className={`info-value ${machine.status === "connected" ? "status-connected" : "status-isolated"}`}>
                    {machine.status}
                </div>
            </div>
        </div>
    );
};

export default Information;