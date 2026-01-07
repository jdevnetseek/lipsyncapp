/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import LoadingIndicator from './components/LoadingIndicator';
import LipSyncPromptForm from './components/LipSyncPromptForm';
import ImagePromptForm from './components/ImagePromptForm';
import VideoResult from './components/VideoResult';
import ImageResult from './components/ImageResult';
import * as geminiService from './services/geminiService';
import * as openAiService from './services/openAiService';
import {AppState, GenerateLipSyncParams} from './types';
import {ImageIcon, MicIcon} from './components/icons';
import ApiProviderSelector from './components/ApiProviderSelector';
import OpenAiKeyDialog from './components/OpenAiKeyDialog';

type Mode = 'lipsync' | 'image';
type ApiProvider = 'gemini' | 'openai';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [mode, setMode] = useState<Mode>('lipsync');
  const [apiProvider, setApiProvider] = useState<ApiProvider>(
    () => (localStorage.getItem('apiProvider') as ApiProvider) || 'gemini',
  );
  const [openAiApiKey, setOpenAiApiKey] = useState<string>(
    () => localStorage.getItem('openAiApiKey') || '',
  );

  // LipSync state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showOpenAiKeyDialog, setShowOpenAiKeyDialog] = useState(false);

  // Persist provider and key choices
  useEffect(() => {
    localStorage.setItem('apiProvider', apiProvider);
  }, [apiProvider]);

  useEffect(() => {
    localStorage.setItem('openAiApiKey', openAiApiKey);
  }, [openAiApiKey]);

  // Check for Gemini API key on initial load
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn(
            'aistudio.hasSelectedApiKey check failed, assuming no key selected.',
            error,
          );
          setShowApiKeyDialog(true);
        }
      }
    };
    if (apiProvider === 'gemini') {
      checkApiKey();
    }
  }, [apiProvider]);

  const handleSetApiProvider = (provider: ApiProvider) => {
    setApiProvider(provider);
    if (provider === 'openai' && mode === 'lipsync') {
      setMode('image');
    }
  };

  const handleGenerateLipSync = useCallback(
    async ({script, image}: GenerateLipSyncParams) => {
      if (apiProvider !== 'gemini') {
        setErrorMessage('LipSync is only available with the Gemini API.');
        setAppState(AppState.ERROR);
        return;
      }
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
            return;
          }
        } catch (error) {
          setShowApiKeyDialog(true);
          return;
        }
      }

      setAppState(AppState.LOADING);
      setErrorMessage(null);
      setVideoUrl(null);
      setAudioData(null);

      try {
        setLoadingMessage('Generating speech...');
        const {base64Audio} = await geminiService.generateSpeech(script);

        setLoadingMessage(
          'Animating character... This can take a few minutes.',
        );
        const {objectUrl} = await geminiService.generateLipSyncVideo(
          script,
          image,
        );

        setAudioData(base64Audio);
        setVideoUrl(objectUrl);
        setAppState(AppState.SUCCESS);
      } catch (error) {
        console.error('Generation failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        // ... (error handling logic remains the same)
        setErrorMessage(`Generation failed: ${errorMessage}`);
        setAppState(AppState.ERROR);
      } finally {
        setLoadingMessage('');
      }
    },
    [apiProvider],
  );

  const handleGenerateImage = useCallback(
    async (prompt: string) => {
      setAppState(AppState.LOADING);
      setErrorMessage(null);
      setImageUrl(null);
      setImagePrompt(prompt);
      setLoadingMessage('Generating your image...');

      try {
        let resultUrl: string;
        if (apiProvider === 'openai') {
          if (!openAiApiKey) {
            setShowOpenAiKeyDialog(true);
            setAppState(AppState.IDLE); // Show form behind dialog
            return;
          }
          const {imageUrl} = await openAiService.generateImage(
            prompt,
            openAiApiKey,
          );
          resultUrl = imageUrl;
        } else {
          // Gemini
          if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
            setAppState(AppState.IDLE);
            return;
          }
          const {imageUrl} = await geminiService.generateImage(prompt);
          resultUrl = imageUrl;
        }
        setImageUrl(resultUrl);
        setAppState(AppState.SUCCESS);
      } catch (error) {
        console.error('Generation failed:', error);
        const errMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        setErrorMessage(`Generation failed: ${errMessage}`);
        setAppState(AppState.ERROR);
      } finally {
        setLoadingMessage('');
      }
    },
    [apiProvider, openAiApiKey],
  );

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleSaveOpenAiKey = (key: string) => {
    setOpenAiApiKey(key);
    setShowOpenAiKeyDialog(false);
  };

  const handleCreateNew = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setAudioData(null);
    setImageUrl(null);
    setImagePrompt(null);
    setErrorMessage(null);
  }, []);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p className="text-red-300">{message}</p>
      <button
        onClick={handleCreateNew}
        className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  const ModeSelector = () => (
    <div className="flex justify-center space-x-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700 mb-8">
      <button
        onClick={() => setMode('lipsync')}
        disabled={apiProvider === 'openai'}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
          mode === 'lipsync'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:bg-gray-700'
        } disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed`}>
        <MicIcon className="w-5 h-5" />
        LipSync
      </button>
      <button
        onClick={() => setMode('image')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
          mode === 'image'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:bg-gray-700'
        }`}>
        <ImageIcon className="w-5 h-5" />
        Image Generation
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-auto">
      {apiProvider === 'gemini' && showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      {apiProvider === 'openai' && showOpenAiKeyDialog && (
        <OpenAiKeyDialog
          onSave={handleSaveOpenAiKey}
          onClose={() => setShowOpenAiKeyDialog(false)}
        />
      )}
      <header className="py-6 flex justify-center items-center px-8 relative z-10">
        <h1 className="text-5xl font-semibold tracking-wide text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          LipSync Studio
        </h1>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center justify-center p-4">
        {appState === AppState.IDLE && (
          <>
            <ApiProviderSelector
              provider={apiProvider}
              setProvider={handleSetApiProvider}
            />
            <ModeSelector />
          </>
        )}

        {appState === AppState.IDLE && mode === 'lipsync' && (
          <LipSyncPromptForm onGenerate={handleGenerateLipSync} />
        )}
        {appState === AppState.IDLE && mode === 'image' && (
          <ImagePromptForm onGenerate={handleGenerateImage} />
        )}

        {appState === AppState.LOADING && (
          <LoadingIndicator primaryMessage={loadingMessage} />
        )}

        {appState === AppState.SUCCESS &&
          mode === 'lipsync' &&
          videoUrl &&
          audioData && (
            <VideoResult
              videoUrl={videoUrl}
              audioData={audioData}
              onCreateNew={handleCreateNew}
            />
          )}
        {appState === AppState.SUCCESS &&
          mode === 'image' &&
          imageUrl &&
          imagePrompt && (
            <ImageResult
              imageUrl={imageUrl}
              prompt={imagePrompt}
              onCreateNew={handleCreateNew}
            />
          )}

        {appState === AppState.ERROR &&
          errorMessage &&
          renderError(errorMessage)}
      </main>
    </div>
  );
};

export default App;
