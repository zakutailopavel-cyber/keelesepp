 
/* global FileReader */
import { createContext, useContext } from 'react';
import { fileToImage } from './image.js';

// Where uploaded photos/audio go is decided by the host:
// the standalone studio keeps them inline, CRM v2 uploads them to Firebase Storage (curriculum/).
const inline = {
  async image(file) {
    return fileToImage(file);
  },
  async audio(file) {
    const src = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    return { src, name: file.name };
  },
};

export const AssetContext = createContext(inline);
export const useAssets = () => useContext(AssetContext);
