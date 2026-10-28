import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="text-center py-5 px-3 bg-white rounded-3 border border-light-subtle shadow-sm my-4">
      <div className="bg-light p-3 rounded-circle d-inline-flex mb-3 text-secondary">
        <Icon size={36} className="text-muted" />
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-gold btn-sm px-4">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-gold btn-sm px-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
