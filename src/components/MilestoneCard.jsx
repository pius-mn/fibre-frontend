import PropTypes from 'prop-types';

const MilestoneCard = ({ milestone, onStart, onComplete }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4">
      <h4 className="text-lg font-semibold">{milestone.name}</h4>
      <p className="text-sm text-gray-500">Sequence: {milestone.sequence}</p>

      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => onStart(milestone.id)} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Start
        </button>
        <button 
          onClick={() => onComplete(milestone.id)} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

MilestoneCard.propTypes = {
  milestone: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    sequence: PropTypes.number.isRequired,
  }).isRequired,
  onStart: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default MilestoneCard;
