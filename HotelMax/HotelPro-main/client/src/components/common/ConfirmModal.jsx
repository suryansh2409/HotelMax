import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  show,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action may be irreversible.',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <AlertTriangle size={20} className={confirmVariant === 'danger' ? 'text-danger' : 'text-warning'} />
              {title}
            </h5>
            <button type="button" className="btn-close" onClick={onCancel} disabled={loading}></button>
          </div>
          <div className="modal-body text-secondary py-3">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-light px-3" onClick={onCancel} disabled={loading}>
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn btn-${confirmVariant} px-4`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
