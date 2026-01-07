/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BrainCircuitIcon, SparklesIcon } from './icons';

interface ApiProviderSelectorProps {
  provider: 'gemini' | 'openai';
  setProvider: (provider: 'gemini' | 'openai') => void;
}

const ApiProviderSelector: React.FC<ApiProviderSelectorProps> = ({ provider, setProvider }) => {
  return (
    <div className="flex justify-center space-x-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700 mb-4">
      <button
        onClick={() => setProvider('gemini')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
          provider === 'gemini'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <SparklesIcon className="w-5 h-5" />
        Gemini
      </button>
      <button
        onClick={() => setProvider('openai')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
          provider === 'openai'
            ? 'bg-teal-600 text-white'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <BrainCircuitIcon className="w-5 h-5" />
        OpenAI
      </button>
    </div>
  );
};

export default ApiProviderSelector;
