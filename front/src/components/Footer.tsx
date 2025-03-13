import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <div className="footer">
            <div className="footer-content">
                <span className="footer-text">Join us on</span>
                <a href="https://discord.gg/JZ5evsCGrX" target="_blank" rel="noopener noreferrer">
                    <img src="/logo_discord.png" alt="Discord Logo" className="discord-logo"/>
                </a>
            </div>
        </div>
    );
};

export default Footer;