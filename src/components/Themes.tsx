import React from 'react';
import { useGameStore } from '../game/store';
import { CARD_BACK_THEMES } from '../game/store';

const Themes: React.FC = () => {
  const { cardBackTheme, setCardBackTheme } = useGameStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedThemeName = event.target.value;
    const theme = CARD_BACK_THEMES.find(t => t.name === selectedThemeName);
    if (theme) {
      setCardBackTheme(theme);
    }
  };

  return (
    <div style={{ margin: '0 10px' }}>
      <label htmlFor="theme-select" style={{ marginRight: '5px', color: 'white', fontSize: '0.8em' }}>Themes:</label>
      <select id="theme-select" value={cardBackTheme.name} onChange={handleChange}
        style={{
          padding: '4px 8px',
          borderRadius: '5px',
          border: '1px solid #61dafb',
          backgroundColor: '#282c34',
          color: 'white',
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
