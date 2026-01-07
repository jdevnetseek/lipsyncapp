/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface OpenAiKeyDialogProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

const OpenAiKeyDialog: React.FC<OpenAiKeyDialogProps> = ({ onSave, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-teal-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-teal-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">OpenAI API Key Required</h2>
        <p className="text-gray-300 mb-6">
          To use OpenAI models (DALL·E, TTS), please enter your API key. Your key will be stored in your browser's local storage and will not be sent to our servers.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-6"
        />
        <div className="flex w-full gap-4">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Save Key
            </button>
        </div>
      </div>
    </div>
  );
};

export default OpenAiKeyDialog;
