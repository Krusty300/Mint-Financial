import React, { useState, useEffect } from 'react';
import { User, X, Sparkles } from 'lucide-react';

interface UserSetupProps {
  onComplete: (name: string) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user-name');
    if (!savedName) {
      setIsOpen(true);
    } else {
      onComplete(savedName);
    }
  }, [onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('user-name', name.trim());
      onComplete(name.trim());
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    onComplete('User');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Welcome to Mint Financial! 
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Let's personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base sm:text-base"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
};

export default UserSetup;
