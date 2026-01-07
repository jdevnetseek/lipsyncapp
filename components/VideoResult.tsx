/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useRef} from 'react';
import {decode, decodeAudioData} from '../utils';
import {PlusIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  audioData: string;
  onCreateNew: () => void;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  audioData,
  onCreateNew,
}) => {
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const finalVideoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const setupRan = useRef(false);

  useEffect(() => {
    // This effect combines the separate video and audio streams into one
    // for seamless playback with native controls. It should only run once.
    const setupStreams = async () => {
      if (
        setupRan.current ||
        !videoUrl ||
        !audioData ||
        !sourceVideoRef.current ||
        !finalVideoRef.current
      ) {
        return;
      }
      setupRan.current = true;

      try {
        // 1. Get video track from the silent, hidden source video
        const sourceVideo = sourceVideoRef.current;
        sourceVideo.src = videoUrl;
        await new Promise<void>((resolve, reject) => {
          sourceVideo.onloadedmetadata = () => resolve();
          sourceVideo.onerror = () => reject('Failed to load source video');
        });
        const videoStream = (sourceVideo as any).captureStream();
        const [videoTrack] = videoStream.getVideoTracks();

        // 2. Create an audio track from the TTS data
        const audioCtx =
          audioCtxRef.current ??
          new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000,
          });
        audioCtxRef.current = audioCtx;

        const decodedBytes = decode(audioData);
        const audioBuffer = await decodeAudioData(
          decodedBytes,
          audioCtx,
          24000,
          1,
        );
        const audioSourceNode = audioCtx.createBufferSource();
        audioSourceNode.buffer = audioBuffer;
        audioSourceNode.loop = true; // Loop audio to match video

        const audioDestinationNode = audioCtx.createMediaStreamDestination();
        audioSourceNode.connect(audioDestinationNode);
        const [audioTrack] = audioDestinationNode.stream.getAudioTracks();

        // 3. Combine streams and set as the source for the visible video player
        const combinedStream = new MediaStream([videoTrack, audioTrack]);
        finalVideoRef.current.srcObject = combinedStream;

        // 4. Start playback
        // `play()` returns a promise which can be rejected if the user hasn't
        // interacted with the page yet. We'll catch that to avoid console errors.
        finalVideoRef.current.play().catch((err) => {
          console.warn('Auto-play was prevented:', err);
        });
        audioSourceNode.start();
      } catch (error) {
        console.error('Failed to set up synchronized video/audio streams:', error);
      }
    };

    setupStreams();

    // Cleanup audio context on component unmount
    return () => {
      audioCtxRef.current?.close();
    };
  }, [videoUrl, audioData]);

  return (
    <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-200">
        Your Creation is Ready!
      </h2>
      <div className="w-full max-w-lg aspect-square rounded-lg overflow-hidden bg-black shadow-lg">
        {/* Hidden video element to be the source of the video track */}
        <video ref={sourceVideoRef} muted loop style={{display: 'none'}} />
        {/* Visible video element that will play the combined stream */}
        <video
          ref={finalVideoRef}
          controls
          loop
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create New
        </button>
      </div>
    </div>
  );
};

export default VideoResult;
