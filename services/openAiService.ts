/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Scene} from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateSpeech = async (
  text: string,
  apiKey: string,
): Promise<{base64Audio: string}> => {
  console.log('Starting OpenAI speech generation for text:', text);

  const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'alloy',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error.message}`);
  }

  const audioBlob = await response.blob();
  const base64Audio = await blobToBase64(audioBlob);

  console.log('OpenAI speech generation successful.');
  return {base64Audio};
};

export const generateImage = async (
  prompt: string,
  apiKey: string,
  referenceImage?: {base64: string; mimeType: string},
): Promise<{imageUrl: string}> => {
  console.log('Starting OpenAI image generation for prompt:', prompt);
  if (referenceImage) {
    console.warn(
      'OpenAI DALL-E 3 API does not support reference images for consistency. This parameter will be ignored.',
    );
  }

  const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  const base64Image = data.data[0].b64_json;

  if (!base64Image) {
    throw new Error('No image data received from OpenAI API.');
  }

  const imageUrl = `data:image/png;base64,${base64Image}`;
  console.log('OpenAI image generation successful.');
  return {imageUrl};
};

export const generateStoryScript = async (
  prompt: string,
  apiKey: string,
): Promise<{scenes: Scene[]}> => {
  console.log('Starting OpenAI story script generation for prompt:', prompt);
  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a creative storyteller. Generate a story script based on the user's request. Also generate a simple, concise, DALL-E-style image prompt for each scene. Your output must be a JSON object with a single key, "scenes", which is an array of objects. Each object must have three keys: "scene" (number), "description" (string), and "image_prompt" (string).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {type: 'json_object'},
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  if (!content.scenes || !Array.isArray(content.scenes)) {
    throw new Error('Invalid script format received from OpenAI API.');
  }

  const scenes: Scene[] = content.scenes.map((s: any) => ({
    scene: s.scene,
    description: s.description,
    imageUrl: null,
    isLoading: false,
    imagePrompt: s.image_prompt,
  }));

  console.log('OpenAI story script generation successful.');
  return {scenes};
};
