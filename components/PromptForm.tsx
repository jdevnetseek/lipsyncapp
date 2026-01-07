/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useRef, useState} from 'react';
import {GenerateLipSyncParams, ImageFile} from '../types';
import {
  ArrowRightIcon,
  MicIcon,
  UploadCloudIcon,
  XMarkIcon,
} from './icons';

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64});
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ImageDropzone: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove: () => void;
  image: ImageFile | null;
}> = ({onSelect, onRemove, image}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-500');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-indigo-500');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-500');
  };

  if (image) {
    return (
      <div className="relative w-full aspect-square group">
        <img
          src={URL.createObjectURL(image.file)}
          alt="Character preview"
          className="w-full h-full object-cover rounded-2xl"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className="w-full aspect-square bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}>
      <UploadCloudIcon className="w-16 h-16 mb-4 text-gray-500" />
      <h3 className="text-xl font-semibold text-gray-300">Upload Character</h3>
      <p className="mt-1 text-sm">Drag & drop or click to browse</p>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateLipSyncParams) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({onGenerate}) => {
  const [script, setScript] = useState('');
  const [image, setImage] = useState<ImageFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (script && image) {
        onGenerate({script, image});
      }
    },
    [script, image, onGenerate],
  );

  const isSubmitDisabled = !script.trim() || !image;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto flex flex-col gap-6">
      <ImageDropzone image={image} onSelect={setImage} onRemove={() => setImage(null)} />
      
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <MicIcon className="w-5 h-5 text-gray-400" />
        </div>
        <textarea
          ref={textareaRef}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter the script for your character..."
          className="w-full bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base text-gray-200 placeholder-gray-500 p-4 pl-12 min-h-28"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors"
        aria-label="Generate video"
        disabled={isSubmitDisabled}>
        Generate
        <ArrowRightIcon className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-500 text-center px-4">
        Veo and TTS are paid-only models. You will be charged on your Cloud project. See{' '}
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

export default PromptForm;
