/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState} from 'react';
import {Scene} from '../types';
import {
  ArrowPathIcon,
  DownloadIcon,
  ImageIcon,
  PlusIcon,
  SparklesIcon,
  XMarkIcon,
} from './icons';

interface StoryGeneratorProps {
  script: Scene[];
  onGenerateImage: (sceneIndex: number, prompt: string) => void;
  onCreateNew: () => void;
  apiProvider: 'gemini' | 'openai';
}

const SceneItem: React.FC<{
  scene: Scene;
  sceneIndex: number;
  onGenerate: (sceneIndex: number, prompt: string) => void;
  onSceneChange: (
    sceneIndex: number,
    field: keyof Scene,
    value: string,
  ) => void;
  onRemove: (sceneIndex: number) => void;
}> = ({scene, sceneIndex, onGenerate, onSceneChange, onRemove}) => {
  return (
    <div className="relative group flex-shrink-0 w-80 md:w-96 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col">
      <button
        onClick={() => onRemove(sceneIndex)}
        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Remove scene">
        <XMarkIcon className="w-4 h-4" />
      </button>
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
      <div className="p-4 flex flex-col flex-grow gap-3">
        <div className="flex-grow flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400">
            Scene {scene.scene} Description:
          </label>
          <textarea
            value={scene.description}
            onChange={(e) =>
              onSceneChange(sceneIndex, 'description', e.target.value)
            }
            rows={4}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-md text-sm p-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Scene description..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400">
            Image Prompt:
          </label>
          <textarea
            value={scene.imagePrompt}
            onChange={(e) =>
              onSceneChange(sceneIndex, 'imagePrompt', e.target.value)
            }
            rows={3}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-md text-sm p-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Edit image prompt..."
          />
        </div>
        <button
          onClick={() => onGenerate(sceneIndex, scene.imagePrompt)}
          disabled={scene.isLoading || !scene.imagePrompt.trim()}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
          {scene.imageUrl ? (
            <ArrowPathIcon className="w-4 h-4" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          {scene.imageUrl ? 'Regenerate Image' : 'Generate Image'}
        </button>
      </div>
    </div>
  );
};

const StoryGenerator: React.FC<StoryGeneratorProps> = ({
  script,
  onGenerateImage,
  onCreateNew,
  apiProvider,
}) => {
  const [editableScript, setEditableScript] = useState<Scene[]>(script);
  const [storyTitle, setStoryTitle] = useState('');

  useEffect(() => {
    setEditableScript((currentScript) =>
      script.map((newScene, index) => ({
        ...newScene,
        description: currentScript[index]?.description || newScene.description,
        imagePrompt: currentScript[index]?.imagePrompt || newScene.imagePrompt,
      })),
    );
  }, [script]);

  const handleSceneChange = (
    index: number,
    field: keyof Scene,
    value: string,
  ) => {
    setEditableScript((prev) =>
      prev.map((s, i) => (i === index ? {...s, [field]: value} : s)),
    );
  };

  const handleRemoveScene = (indexToRemove: number) => {
    setEditableScript((prev) =>
      prev
        .filter((_, index) => index !== indexToRemove)
        .map((scene, index) => ({...scene, scene: index + 1})),
    );
  };

  const handleAddScene = () => {
    setEditableScript((prev) => {
      const newSceneNumber = prev.length + 1;
      const newScene: Scene = {
        scene: newSceneNumber,
        description: '',
        imagePrompt: '',
        imageUrl: null,
        isLoading: false,
      };
      return [...prev, newScene];
    });
  };

  const handleSaveStory = async () => {
    if (!storyTitle.trim() || !isComplete) return;

    // Format date and title for folder name
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, '0');
    const dateStr = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear().toString().slice(-2)}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const safeTitle = storyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const folderName = `${dateStr}-${safeTitle}`;

    // Download script.json
    const scriptContent = JSON.stringify(editableScript, null, 2);
    const scriptBlob = new Blob([scriptContent], {type: 'application/json'});
    const scriptUrl = URL.createObjectURL(scriptBlob);
    const scriptLink = document.createElement('a');
    scriptLink.href = scriptUrl;
    scriptLink.download = `${folderName}/script.json`;
    document.body.appendChild(scriptLink);
    scriptLink.click();
    document.body.removeChild(scriptLink);
    URL.revokeObjectURL(scriptUrl);

    // Download images
    for (const scene of editableScript) {
      if (scene.imageUrl) {
        const imageLink = document.createElement('a');
        imageLink.href = scene.imageUrl;
        imageLink.download = `${folderName}/scene_${scene.scene}.png`;
        document.body.appendChild(imageLink);
        imageLink.click();
        document.body.removeChild(imageLink);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  };

  const isComplete = editableScript.every((s) => s.imageUrl);
  const canSave = isComplete && storyTitle.trim().length > 0;

  return (
    <div className="w-full flex flex-col items-center gap-8 p-4 md:p-8">
      <div className="text-center w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-200">
          {isComplete ? 'Your Story is Complete!' : 'Build Your Story'}
        </h2>
        <p className="text-gray-400 mt-2">
          {isComplete
            ? 'Scroll through the film strip to see your visual narrative.'
            : 'Add, remove, or edit scenes, then generate images to bring your script to life.'}
        </p>
        {apiProvider === 'openai' && (
          <p className="mt-4 text-xs text-yellow-400 bg-yellow-900/30 border border-yellow-800/50 rounded-md px-3 py-2 max-w-md mx-auto">
            <strong>Note:</strong> Character consistency across scenes is a
            feature best supported by Gemini and may not work as expected with
            OpenAI.
          </p>
        )}
        <input
          type="text"
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
          placeholder="Enter your story title..."
          className="mt-6 w-full max-w-md mx-auto bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="w-full flex overflow-x-auto items-stretch space-x-6 pb-4">
        {editableScript.map((scene, index) => (
          <SceneItem
            key={index} // Use index for key to handle additions/removals
            scene={scene}
            sceneIndex={index}
            onGenerate={onGenerateImage}
            onSceneChange={handleSceneChange}
            onRemove={handleRemoveScene}
          />
        ))}
        <div className="flex-shrink-0 w-80 md:w-96 flex items-center justify-center p-2">
          <button
            onClick={handleAddScene}
            className="w-full h-full flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-gray-700 hover:border-indigo-500 hover:text-indigo-400 rounded-lg text-gray-500 transition-colors">
            <PlusIcon className="w-12 h-12 mb-2" />
            <span className="font-semibold">Add New Scene</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create New Story
        </button>
        <button
          onClick={handleSaveStory}
          disabled={!canSave}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
          <DownloadIcon className="w-5 h-5" />
          Save Story
        </button>
      </div>
    </div>
  );
};

export default StoryGenerator;
