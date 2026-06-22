/**
 * Confirm Modal Component
 * 
 * Reusable confirmation dialog
 * Used for delete confirmations and other critical actions
 */

import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="modal-btn cancel"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`modal-btn confirm ${danger ? 'danger' : ''}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
