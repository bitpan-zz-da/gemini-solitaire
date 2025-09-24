import React from 'react';
import { Card as CardType, Suit, Rank, CardColor } from '../game/types';
import { useDrag } from 'react-dnd';
import { useGameStore } from '../game/store';

interface CardProps {
  card: CardType;
  position: [number, number, number]; // x, y, z for 3D positioning
  onClick?: (card: CardType) => void;
  // New props for drag-and-drop
  canDrag?: boolean; // Whether this specific card can be dragged
  currentPileType: PileType; // e.g., 'tableau', 'waste', 'foundation'
  currentPileIndex: number | Suit | null; // Index for tableau, suit for foundation
  cardIndexInPile: number; // Index of the card within its pile
}

const Card: React.FC<CardProps> = ({ card, position, onClick, canDrag = true, currentPileType, currentPileIndex, cardIndexInPile }) => {
  const { cardBackTheme } = useGameStore();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { card, currentPileType, currentPileIndex, cardIndexInPile },
    canDrag: canDrag && card.isFaceUp, // Only face-up cards can be dragged
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    width: '80px',
    height: '120px',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: card.isFaceUp ? 'white' : cardBackTheme.style.backgroundColor,
    color: card.color === CardColor.Red ? 'red' : 'black',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    cursor: canDrag && card.isFaceUp ? 'grab' : 'default',
    left: `${position[0]}px`,
    top: `${position[1]}px`,
    zIndex: position[2],
    boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
    opacity: isDragging ? 0.5 : 1, // Visual feedback when dragging
  };

  const cardBackStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '7px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
    ...cardBackTheme.style, // Apply theme style
  };

  return (
    <div ref={drag} style={cardStyle} onClick={() => onClick && onClick(card)}>
      {card.isFaceUp ? (
        <>
          <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '0.5em', lineHeight: '1' }}>{card.rank}<br/>{getSuitSymbol(card.suit)}</div>
          <div style={{ fontSize: '1em', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{getSuitSymbol(card.suit)}</div>
          <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '0.5em', lineHeight: '1', transform: 'rotate(180deg)' }}>{card.rank}<br/>{getSuitSymbol(card.suit)}</div>
        </>
      ) : (
        <div style={cardBackStyle}>
        </div>
      )}
    </div>
  );
};

function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case Suit.Clubs: return '♣';
    case Suit.Diamonds: return '♦';
    case Suit.Hearts: return '♥';
    case Suit.Spades: return '♠';
    default: return '';
  }
}

export default Card;
