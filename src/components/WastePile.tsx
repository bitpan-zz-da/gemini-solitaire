import React from 'react';
import { Card as CardType, PileType } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';
import { useGameStore } from '../game/store';

interface WastePileProps {
  cards: CardType[];
  position: [number, number, number];
  onCardClick: (card: CardType) => void;
}

const WastePile: React.FC<WastePileProps> = ({ cards, position, onCardClick }) => {
  const { makeMove } = useGameStore();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      // Waste pile typically does not accept drops from other piles in Solitaire
      // However, if we were to implement a feature where cards could be moved back to stock from waste,
      // this is where that logic would go.
      console.log('Card dropped on Waste Pile:', item.card);
    },
    canDrop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      // Waste pile usually cannot accept cards from other piles.
      // Return false to prevent any drops.
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
    zIndex: position[2],
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
  };

  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div ref={drop} style={pileStyle}>
      {topCard ? (
        <Card card={{ ...topCard, isFaceUp: true }} position={[0, 0, 0]} onClick={onCardClick} />
      ) : (
        <span style={{ fontSize: '0.45em' }}>🂠</span> // Empty waste symbol
      )}
    </div>
  );
};

export default WastePile;
