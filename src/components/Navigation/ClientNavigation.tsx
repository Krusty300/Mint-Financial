import React from 'react';
import { Users } from 'lucide-react';

const ClientNavigation: React.FC = () => {
  const handleClick = () => {
    window.location.pathname = '/clients';
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      <Users className="h-4 w-4 mr-2" />
      Clients
    </button>
  );
};

export default ClientNavigation;
