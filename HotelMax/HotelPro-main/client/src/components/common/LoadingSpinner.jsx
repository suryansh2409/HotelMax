import React from 'react';

export const LoadingSpinner = ({ text = 'Loading details...' }) => (
  <div className="d-flex flex-column justify-content-center align-items-center py-5">
    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    {text && <p className="text-muted mt-3 mb-0 small fw-medium">{text}</p>}
  </div>
);

export const SkeletonCard = () => (
  <div className="card hp-card p-3 placeholder-glow">
    <div className="placeholder bg-secondary col-12 rounded" style={{ height: '220px' }}></div>
    <div className="card-body px-0 pb-0">
      <span className="placeholder bg-secondary col-4 mb-2"></span>
      <h5 className="placeholder bg-secondary col-8 mb-3"></h5>
      <p className="placeholder bg-secondary col-12 mb-1"></p>
      <p className="placeholder bg-secondary col-10 mb-3"></p>
      <div className="d-flex justify-content-between align-items-center pt-2">
        <span className="placeholder bg-secondary col-3"></span>
        <span className="placeholder bg-warning col-4 rounded" style={{ height: '36px' }}></span>
      </div>
    </div>
  </div>
);
