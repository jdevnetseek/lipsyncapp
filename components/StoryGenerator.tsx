/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Scene} from '../types';
import {ImageIcon, PlusIcon, SparklesIcon} from './icons';

interface StoryGeneratorProps {
  script: Scene[];
  onGenerateImage: (sceneIndex: number, prompt: string) => void;
  onCreateNew: () => void;
}

const SceneItem: React.FC<{
  scene: Scene;
  sceneIndex: number;
  onGenerate: (sceneIndex: number, prompt: string) => void;
}> = ({scene, sceneIndex, onGenerate}) => {
  return (
    <div className="flex-shrink-0 w-80 md:w-96 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col">
      <div className="aspect-square w-full bg-gray-900/50 rounded-t-lg flex items-center justify-center overflow-hidden">
        {scene.isLoading ? (
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4"></div>
            <p>Generating...</p>
          </div>
        ) : scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={`Scene ${scene.scene}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-500 p-4">
            <ImageIcon className="w-16 h-16 mx-auto mb-2" />
            <p>Image will appear here</p>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-300 flex-grow">
          <strong className="text-indigo-400">Scene {scene.scene}:</strong>{' '}
          {scene.description}
        </p>
        {!scene.imageUrl && !scene.isLoading && (
          <button
            onClick={() => onGenerate(sceneIndex, scene.imagePrompt)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white font-semibold text-sm transition-colors">
            <SparklesIcon className="w-4 h-4" />
            Generate Image
          </button>
        )}
      </div>
    </div>
  );
};

const StoryGenerator: React.FC<StoryGeneratorProps> = ({
  script,
  onGenerateImage,
  onCreateNew,
}) => {
  const isComplete = script.every((s) => s.imageUrl);

  return (
    <div className="w-full flex flex-col items-center gap-8 p-4 md:p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-200">
          {isComplete ? 'Your Story is Complete!' : 'Generate Your Story'}
        </h2>
        <p className="text-gray-400 mt-2">
          {isComplete
            ? 'Scroll through the film strip to see your visual narrative.'
            : 'Generate an image for each scene to bring your script to life.'}
        </p>
      </div>

      <div className="w-full flex overflow-x-auto space-x-6 pb-4">
        {script.map((scene, index) => (
          <SceneItem
            key={scene.scene}
            scene={scene}
            sceneIndex={index}
            onGenerate={onGenerateImage}
          />
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create New Story
        </button>
      </div>
    </div>
  );
};

export default StoryGenerator;
