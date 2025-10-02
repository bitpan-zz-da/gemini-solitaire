import React from 'react';
import { useGameStore } from '../game/store';
import { CARD_BACK_THEMES } from '../game/store';

interface ThemesProps {
  className?: string;
}

const Themes: React.FC<ThemesProps> = ({ className }) => {
  const { cardBackTheme, setCardBackTheme } = useGameStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedThemeName = event.target.value;
    const theme = CARD_BACK_THEMES.find(t => t.name === selectedThemeName);
    if (theme) {
      setCardBackTheme(theme);
    }
  };

  return (
    <div className={className}>
      <label htmlFor="theme-select">Themes:</label>
      <select id="theme-select" value={cardBackTheme.name} onChange={handleChange}
        style={{
          padding: '4px 8px',
          borderRadius: '5px',
          border: '1px solid #61dafb',
          backgroundColor: '#282c34',
          color: '#61dafb',
          cursor: 'pointer',
          fontSize: '0.8em',
        }}>
        {CARD_BACK_THEMES.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Themes;
