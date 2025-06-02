import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const Message = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Automatically hide the message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(); // Notify the parent component to remove this message
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
        type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
      }`}
    >
      {message}
    </div>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(['error', 'success']).isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired, // Callback to remove the message
};

export default Message;