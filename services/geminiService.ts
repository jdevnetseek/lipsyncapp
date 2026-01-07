/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Modality, Type, Video} from '@google/genai';
import {ImageFile, Scene} from '../types';

export const generateSpeech = async (
  text: string,
): Promise<{base64Audio: string}> => {
  console.log('Starting speech generation for text:', text);
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{parts: [{text}]}],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {voiceName: 'Kore'},
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('No audio data received from API.');
  }

  console.log('Speech generation successful.');
  return {base64Audio};
};

export const generateLipSyncVideo = async (
  prompt: string,
  image: ImageFile,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting lip sync video generation with image:', image.file.name);
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const veoPrompt = `Animate the character in the provided image to make it look like they are speaking these words: "${prompt}". The video should be a close-up on the character's face, with realistic mouth movements that sync with the speech. The background should remain static and similar to the original image.`;

  const generateVideoPayload = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: veoPrompt,
    image: {
      imageBytes: image.base64,
      mimeType: image.file.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '1:1', // Square is good for portraits/faces
    },
  };

  console.log('Submitting video generation request...', generateVideoPayload);
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating video...');
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    console.log('Fetching video from:', url);

    const res = await fetch(`${url}&key=${process.env.API_KEY}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    console.error('Operation failed:', operation);
    throw new Error('No videos generated.');
  }
};

export const generateImage = async (
  prompt: string,
): Promise<{imageUrl: string}> => {
  console.log('Starting image generation for prompt:', prompt);
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{text: prompt}],
    },
    config: {
      imageConfig: {
        aspectRatio: '1:1',
      },
    },
  });

  for (const part of response.candidates?.[0]?.content.parts ?? []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      const imageUrl = `data:image/png;base64,${base64EncodeString}`;
      console.log('Image generation successful.');
      return {imageUrl};
    }
  }

  throw new Error('No image data received from API.');
};

export const generateStoryScript = async (
  prompt: string,
): Promise<{scenes: Scene[]}> => {
  console.log('Starting story script generation for prompt:', prompt);
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const fullPrompt = `You are a creative storyteller. Based on the user's request, generate a story script. Also generate a simple, concise, DALL-E-style image prompt for each scene that captures the essence of the scene's description.

User request: "${prompt}"

Please provide the output in a valid JSON format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: fullPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene: {
                  type: Type.NUMBER,
                  description: 'The scene number, starting from 1.',
                },
                description: {
                  type: Type.STRING,
                  description: 'A paragraph describing the events of the scene.',
                },
                image_prompt: {
                  type: Type.STRING,
                  description: 'A concise DALL-E style prompt for generating the image for this scene.',
                },
              },
            },
          },
        },
      },
    },
  });

  const jsonText = response.text.trim();
  const data = JSON.parse(jsonText);

  if (!data.scenes || !Array.isArray(data.scenes)) {
    throw new Error('Invalid script format received from API.');
  }

  const scenes: Scene[] = data.scenes.map((s: any) => ({
    scene: s.scene,
    description: s.description,
    // The image prompt from the LLM will be used as the description for the image generator
    imageUrl: null,
    isLoading: false,
    imagePrompt: s.image_prompt,
  }));

  console.log('Story script generation successful.');
  return {scenes};
};
