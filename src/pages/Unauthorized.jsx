import { useNavigate } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-6 text-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <LockClosedIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">403</h1>
        <h2 className="text-xl font-semibold text-gray-600 mt-2">Access Denied</h2>
        <p className="text-gray-500 mt-2">
          You don’t have permission to view this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
