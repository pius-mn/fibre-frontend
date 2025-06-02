import PropTypes from 'prop-types';

const Notification = ({ message, type = 'info', onDismiss }) => {
  const typeStyles = {
    error: 'bg-red-50 text-red-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className={`${typeStyles[type]} rounded-lg p-4 mb-4 flex items-center justify-between`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'error' && '⚠️'}
          {type === 'success' && '✅'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </span>
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 p-1 hover:opacity-75 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
  onDismiss: PropTypes.func,
};

export default Notification;