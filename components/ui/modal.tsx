import React, { ReactNode } from 'react';

type ModalProps = {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ show, onClose, children }: ModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;