import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.left + rect.width / 2,
            });
        }
        setVisible(true);
    };

    return (
        <div
            ref={triggerRef}
            className={`tiptap-tooltip ${className || ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible &&
                createPortal(
                    <div
                        className="tiptap-tooltip-content"
                        style={{
                            position: 'fixed',
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            transform: 'translate(-50%, -100%)',
                            marginTop: '-8px',
                            zIndex: 9999,
                        }}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </div>
    );
};
