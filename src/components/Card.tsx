import React from 'react';
import { Card as CardType, Suit, CardColor, PileType } from '../game/types';
import { useDrag } from 'react-dnd';
import { useGameStore } from '../game/store';

interface CardProps {
  card: CardType;
  position: [number, number, number]; // x, y, z for 3D positioning
  onClick?: (card: CardType) => void;
  canDrag?: boolean;
  currentPileType: PileType;
  currentPileIndex: number | Suit | null;
  cardIndexInPile: number;
  className?: string; // Add className prop
}

const Card: React.FC<CardProps> = ({ card, position, onClick, canDrag = true, currentPileType, currentPileIndex, cardIndexInPile, className }) => {
  const { cardBackTheme } = useGameStore();
  const [{ isDragging }, drag]: [any, any, any] = useDrag(() => ({
    type: 'CARD',
    item: { card, currentPileType, currentPileIndex, cardIndexInPile },
    canDrag: canDrag && card.isFaceUp,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    border: '0.1em solid #333', // Responsive border relative to font-size
    borderRadius: '0.5em', // Responsive border-radius relative to font-size
    backgroundColor: card.isFaceUp ? 'white' : cardBackTheme.style.backgroundColor,
    color: card.color === CardColor.Red ? 'red' : 'black',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.3em', // Responsive padding relative to font-size
    fontWeight: 'bold',
    cursor: canDrag && card.isFaceUp ? 'grab' : 'default',
    left: `${position[0]}px`, // Still px for internal stacking
    top: `${position[1]}em`, // Now em for responsive vertical stacking
    zIndex: position[2],
    boxShadow: '0.2em 0.2em 0.5em rgba(0,0,0,0.3)', // Responsive shadow relative to font-size
    opacity: isDragging ? 0.5 : 1,
  };

  const cardBackStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '7px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
    ...cardBackTheme.style,
  };

  return (
    <div ref={drag} style={cardStyle} className={className} onClick={() => onClick && onClick(card)}>
      {card.isFaceUp ? (
        <>
          <div style={{ position: 'absolute', top: '0.5em', left: '0.5em', fontSize: '1.2578125em', lineHeight: '1' }}>{card.rank}<br/>{getSuitSymbol(card.suit)}</div>
          <div style={{ fontSize: '2.515625em', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{getSuitSymbol(card.suit)}</div>
          <div style={{ position: 'absolute', bottom: '0.5em', right: '0.5em', fontSize: '1.2578125em', lineHeight: '1', transform: 'rotate(180deg)' }}>{card.rank}<br/>{getSuitSymbol(card.suit)}</div>
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
