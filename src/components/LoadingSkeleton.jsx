import PropTypes from 'prop-types';

const LoadingSkeleton = ({ count = 1 }) => {
  return (
    <div className="animate-pulse space-y-4 mb-20">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
          <div className="h-8 bg-gray-200 rounded-md w-24 mt-2"></div>
        </div>
      ))}
    </div>
  );
};

LoadingSkeleton.propTypes = {
  count: PropTypes.number,
};

export default LoadingSkeleton;