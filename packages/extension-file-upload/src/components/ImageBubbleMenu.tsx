import classNames from 'classnames';
import React from 'react';

type AlignType = 'left' | 'center' | 'right';

export interface ImageBubbleMenuProps {
    align: AlignType | null;
    onAlignChange: (align: AlignType) => void;
}

const AlignLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M96 128h832v96H96zM96 576h832v96H96zM96 352h576v96H96zM96 800h576v96H96z" />
    </svg>
);

const AlignCenterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M96 128h832v96H96zM96 576h832v96H96zM224 352h576v96H224zM224 800h576v96H224z" />
    </svg>
);

const AlignRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M96 128h832v96H96zM96 576h832v96H96zM352 352h576v96H352zM352 800h576v96H352z" />
    </svg>
);

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ align, onAlignChange }) => {
    const alignments: {
        value: AlignType;
        icon: React.FC<React.SVGProps<SVGSVGElement>>;
        label: string;
    }[] = [
        { value: 'left', icon: AlignLeftIcon, label: '左对齐' },
        { value: 'center', icon: AlignCenterIcon, label: '居中' },
        { value: 'right', icon: AlignRightIcon, label: '右对齐' },
    ];

    return (
        <div className="tiptap-image-bubble-menu">
            {alignments.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    className={classNames('tiptap-image-bubble-menu__button', {
                        'tiptap-image-bubble-menu__button--active': align === value,
                    })}
                    onClick={() => onAlignChange(value)}
                    title={label}
                    aria-label={label}
                >
                    <span className="tiptap-image-bubble-menu__icon">
                        <Icon width={16} height={16} />
                    </span>
                </button>
            ))}
        </div>
    );
};
