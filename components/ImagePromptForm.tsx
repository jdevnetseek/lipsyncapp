/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useRef, useState} from 'react';
import {ArrowRightIcon, SparklesIcon} from './icons';

interface ImagePromptFormProps {
  onGenerate: (prompt: string) => void;
}

const ImagePromptForm: React.FC<ImagePromptFormProps> = ({onGenerate}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (prompt) {
        onGenerate(prompt);
      }
    },
    [prompt, onGenerate],
  );

  const isSubmitDisabled = !prompt.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto flex flex-col gap-6">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <SparklesIcon className="w-5 h-5 text-gray-400" />
        </div>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic cityscape with flying cars..."
          className="w-full bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base text-gray-200 placeholder-gray-500 p-4 pl-12 min-h-28"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors"
        aria-label="Generate image"
        disabled={isSubmitDisabled}>
        Generate Image
        <ArrowRightIcon className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-500 text-center px-4">
        Image generation models may have associated costs. See{' '}
        <a
          href="https://ai.google.dev/gemini-api/docs/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:underline">
          pricing details
        </a>.
      </p>
    </form>
  );
};

export default ImagePromptForm;
