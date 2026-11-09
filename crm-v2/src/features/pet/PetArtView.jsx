import { petSvg } from './petArt.js';

// Our own generated SVG (constants only), safe to inject.
export function PetArt({ kind, mood, stage, wearing = {}, className = '' }) {
  return <div className={`pet-art ${className}`} dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, stage, wearing) }} />;
}
