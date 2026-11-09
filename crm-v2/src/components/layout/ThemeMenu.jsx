import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { THEME_OPTIONS, applyTheme, readTheme, saveTheme, themeSupported } from '../../app/theme.js';
import IconButton from '../ui/IconButton.jsx';

const ICONS = { light: Sun, dark: Moon, system: Monitor };

// „Teema: Hele / Tume / Süsteem” beside the name in the side menu (app/theme.js). The choice is per user on this device.
export default function ThemeMenu({ uid, supported = themeSupported() }) {
  // the signed-in user's own choice wins over the device's last one (another person may have used this browser)
  const [choice, setChoice] = useState(() => ({ uid, theme: readTheme(uid) }));
  const theme = choice.uid === uid ? choice.theme : readTheme(uid);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => { if (supported) applyTheme(theme); }, [theme, supported]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [open]);

  if (!supported) return null;
  const Icon = ICONS[theme] || Monitor;
  const current = THEME_OPTIONS.find((option) => option.id === theme)?.label || 'Süsteem';

  return (
    <div className="theme-menu" ref={wrapRef} data-preview-allowed>
      <IconButton label={`Teema: ${current}`} className="profile-chip__theme" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon size={17} />
      </IconButton>
      {open ? (
        <div className="theme-menu__panel" role="radiogroup" aria-label="Teema">
          <span className="theme-menu__title">Teema</span>
          {THEME_OPTIONS.map((option) => {
            const OptionIcon = ICONS[option.id];
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={theme === option.id}
                className={`theme-menu__option${theme === option.id ? ' is-active' : ''}`}
                onClick={() => { setChoice({ uid, theme: saveTheme(option.id, uid) }); setOpen(false); }}
              >
                <OptionIcon size={16} aria-hidden="true" /><span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
