import React from 'react';
import { useGameStore } from '../game/store';
import { CardBackTheme } from '../game/types';

const Themes: React.FC = () => {
  const { cardBackTheme, setCardBackTheme } = useGameStore();

  // Define card back themes (should be consistent with store.ts)
  const CARD_BACK_THEMES: CardBackTheme[] = [
    {
      name: 'Classic Blue',
      style: {
        backgroundColor: '#004d40', /* Dark Teal */
        backgroundImage: 'repeating-linear-gradient(45deg, #005f50 0, #005f50 10px, #004d40 10px, #004d40 20px)',
        backgroundSize: '20px 20px',
      },
    },
    {
      name: 'Royal Red',
      style: {
        backgroundColor: '#8B0000', /* Dark Red */
        backgroundImage: 'repeating-linear-gradient(135deg, #A52A2A 0, #A52A2A 10px, #8B0000 10px, #8B0000 20px)',
        backgroundSize: '20px 20px',
      },
    },
    {
      name: 'Forest Green',
      style: {
        backgroundColor: '#228B22', /* Forest Green */
        backgroundImage: 'repeating-linear-gradient(45deg, #3CB371 0, #3CB371 10px, #228B22 10px, #228B22 20px)',
        backgroundSize: '20px 20px',
      },
    },
    {
      name: 'Purple Haze',
      style: {
        backgroundColor: '#4B0082', /* Indigo */
        backgroundImage: 'repeating-linear-gradient(135deg, #8A2BE2 0, #8A2BE2 10px, #4B0082 10px, #4B0082 20px)',
        backgroundSize: '20px 20px',
      },
    },
    {
      name: 'Golden Sunset',
      style: {
        backgroundColor: '#FF8C00', /* Dark Orange */
        backgroundImage: 'repeating-linear-gradient(45deg, #FFA500 0, #FFA500 10px, #FF8C00 10px, #FF8C00 20px)',
        backgroundSize: '20px 20px',
      },
    },
  ];

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
