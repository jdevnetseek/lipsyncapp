/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  // Lipsync
  "Teaching your character to talk...",
  "Warming up the vocal cords...",
  "Syncing syllables and visemes...",
  "Directing the digital actor...",
  "Applying virtual makeup...",
  // Image gen
  "Mixing the digital paints...",
  "Consulting with the AI muse...",
  "Sketching the initial concept...",
  "Adding a touch of magic...",
  "Rendering the masterpiece...",
  // Generic
  "This can take a few minutes, hang tight!",
  "Polishing the final result...",
];

interface LoadingIndicatorProps {
  primaryMessage?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ primaryMessage }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold mt-8 text-gray-200">{primaryMessage || 'Generating...'}</h2>
      <p className="mt-2 text-gray-400 text-center transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
