/* global FileReader */
import { createContext, useContext } from 'react';
import { prepareImageFile } from './image.js';

// Where uploaded photos/audio/video go is decided by the host:
// the standalone studio keeps them inline, CRM v2 uploads them to Firebase Storage (curriculum/).
const dataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(blob);
});

const inline = {
  async image(file) {
    const { blob, width, height } = await prepareImageFile(file);
    return { src: await dataUrl(blob), width, height, focus: { x: 50, y: 50 } };
  },
  async audio(file) {
    return { src: await dataUrl(file), name: file.name };
  },
  async video(file) {
    return { src: await dataUrl(file), name: file.name, type: file.type };
  },
};

export const AssetContext = createContext(inline);
export const useAssets = () => useContext(AssetContext);
