
import PropTypes from 'prop-types';

const DependencyCard = ({ dependency, onClear }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4">
      <h4 className="text-lg font-semibold">{dependency.name}</h4>
      <button 
        onClick={() => onClear(dependency.id)} 
        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
      >
        Mark as Cleared
      </button>
    </div>
  );
};

DependencyCard.propTypes = {
  dependency: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    cleared: PropTypes.bool.isRequired,
  }).isRequired,
  onClear: PropTypes.func.isRequired,
};

export default DependencyCard;
