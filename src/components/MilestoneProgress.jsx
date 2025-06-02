import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const MilestoneProgress = ({ milestone }) => {
  const isCompleted = milestone.completed === 1;

  // Convert timestamp strings (assumed to be in UTC) into Date objects
  const startDateUTC = useMemo(() => new Date(milestone.start_time), [milestone.start_time]);
  const endDateUTC = useMemo(
    () => (milestone.end_time ? new Date(milestone.end_time) : new Date(Date.now())),
    [milestone.end_time]
  );

  const startDateFormatted = startDateUTC.toLocaleDateString(); // Local display
  const endDateFormatted = milestone.end_time ? endDateUTC.toLocaleDateString() : "Ongoing";

  const isValidStartDate = !isNaN(startDateUTC.getTime());
  const isValidEndDate = milestone.end_time ? !isNaN(endDateUTC.getTime()) : true;

  const progress = useMemo(() => (isCompleted ? 100 : 0), [isCompleted]);

  const [timeSpent, setTimeSpent] = useState(() =>
    isValidStartDate && isValidEndDate
      ? calculateTimeSpent(startDateUTC, endDateUTC)
      : "Invalid Dates"
  );

  useEffect(() => {
    if (!isCompleted && !milestone.end_time) {
      const interval = setInterval(() => {
        setTimeSpent(calculateTimeSpent(startDateUTC, new Date(Date.now())));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isCompleted, milestone.end_time, startDateUTC]);

  return (
    <div className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300">
      {/* Status Badge */}
      <div
        className={`absolute top-3 right-3 px-3 py-1 text-sm font-semibold rounded-lg shadow ${
          isCompleted ? "bg-green-500 text-white" : "bg-blue-500 text-white"
        }`}
      >
        {isCompleted ? "Completed" : "In Progress"}
      </div>

      {/* Circular Progress Bar */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="gray"
            strokeWidth="8"
            fill="none"
            opacity="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="251.2"
            strokeDashoffset={(1 - progress / 100) * 251.2}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#00bb00" />
              <stop offset="100%" stopColor="#00ff00" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-lg font-semibold">{progress}%</span>
      </div>

      {/* Milestone Title */}
      <h3 className="text-xl font-bold text-gray-800">{milestone.name}</h3>

      {/* Timeline Dates */}
      <div className="mt-3 w-full text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span>
              <strong>Start:</strong> {startDateFormatted}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span>
              <strong>End:</strong> {endDateFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Time Spent */}
      <div className="mt-3 flex items-center gap-2 text-gray-700">
        <ClockIcon className="w-5 h-5 text-gray-500" />
        <strong>Time Spent:</strong> {timeSpent}
      </div>
    </div>
  );
};

MilestoneProgress.propTypes = {
  milestone: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    start_time: PropTypes.string.isRequired,
    end_time: PropTypes.string,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

// Helper function to calculate time spent from two UTC Date objects
const calculateTimeSpent = (startDate, endDate) => {
  const diffMs = endDate.getTime() - startDate.getTime(); // in ms

  if (diffMs < 0) return "Invalid";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  let str = "";
  if (days > 0) str += `${days}d `;
  if (hours > 0) str += `${hours}h `;
  if (minutes > 0) str += `${minutes}m`;

  return str.trim() || "Less than a minute";
};

export default MilestoneProgress;
