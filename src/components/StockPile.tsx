import React from 'react';
import { Card as CardType, PileType } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';

interface StockPileProps {
  cards: CardType[];
  position: [number, number, number];
  onDraw: () => void;
}

const StockPile: React.FC<StockPileProps> = ({ cards, position, onDraw }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      // Stock pile does not accept drops from other piles in Solitaire
      // console.log('Card dropped on Stock Pile (rejected):', item.card);
    },
    canDrop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      // Stock pile cannot accept cards from other piles.
      return false;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const pileStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position[0]}px`,
    top: `${position[1]}px`,
    width: '80px',
    height: '120px',
    border: `2px solid ${isOver && canDrop ? 'green' : canDrop ? 'yellow' : '#555'}`,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: position[2],
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
  };

  return (
    <div ref={drop} style={pileStyle} onClick={onDraw}>
      {cards.length > 0 ? (
        <Card card={{ ...cards[cards.length - 1], isFaceUp: false }} position={[0, 0, 0]} />
      ) : (
        <span style={{ fontSize: '0.45em' }}>🂠</span> // Empty stock symbol
      )}
    </div>
  );
};

export default StockPile;