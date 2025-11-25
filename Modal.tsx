import type { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="modal-header">
                    {title && <h2>{title}</h2>}
                    <button type="button" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}