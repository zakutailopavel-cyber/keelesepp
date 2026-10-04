import { Check, Lock, Star } from 'lucide-react';
import { useState } from 'react';
import { PET_ITEMS, SLOTS, availableStars, buyItem, canBuy, toggleWear } from './petItems.js';
import { petSvg } from './petArt.js';

/** „Riidekapp”: buy outfits with earned stars and put them on or take them off. */
export default function PetWardrobe({ pet, progress, onChange, onClose }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const left = availableStars(progress, pet);
  const owned = pet.owned || [];
  const wearing = pet.wearing || {};

  const act = async (id, next) => {
    setBusy(id); setError('');
    try { await onChange(next); } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(''); }
  };
  const buy = (item) => { try { act(item.id, buyItem(item.id, progress, pet)); } catch (caught) { setError(caught.message); } };
  const wear = (item) => act(item.id, { wearing: toggleWear(item.id, pet) });

  return (
    <div className="pet-wardrobe" role="region" aria-label="Riidekapp">
      <div className="pet-wardrobe__head">
        <strong>Riidekapp</strong>
        <span className="pet-stat"><Star size={14} aria-hidden="true" /> {left} tähte</span>
        {onClose ? <button type="button" className="pet-home__edit" onClick={onClose}>Valmis</button> : null}
      </div>
      <p className="pet-wardrobe__hint">Tähti tuleb juurde iga tunni, töö, kodutöö ja õpitud sõnaga.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {Object.entries(SLOTS).map(([slot, label]) => (
        <div key={slot} className="pet-wardrobe__slot">
          <small>{label}</small>
          <div className="pet-wardrobe__items">
            {PET_ITEMS.filter((item) => item.slot === slot).map((item) => {
              const mine = owned.includes(item.id);
              const on = wearing[slot] === item.id;
              const affordable = canBuy(item.id, progress, pet).ok;
              return (
                <button type="button" key={item.id} className={`pet-item ${on ? 'is-on' : ''} ${mine ? 'is-mine' : ''}`} disabled={Boolean(busy) || (!mine && !affordable)}
                  aria-pressed={mine ? on : undefined}
                  aria-label={mine ? `${on ? 'Võta ära' : 'Pane selga'}: ${item.name}` : `Osta ${item.name} (${item.price} tähte)`}
                  onClick={() => (mine ? wear(item) : buy(item))}>
                  <span className="pet-item__art" dangerouslySetInnerHTML={{ __html: petSvg(pet.kind, 'happy', progress.stage, { [slot]: item.id }) }} />
                  <span className="pet-item__name">{item.name}</span>
                  <span className="pet-item__price">{mine ? (on ? <><Check size={13} /> seljas</> : 'sinu oma') : <>{affordable ? <Star size={13} /> : <Lock size={13} />} {item.price}</>}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
