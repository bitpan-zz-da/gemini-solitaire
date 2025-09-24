import React from 'react';
import { Card as CardType, PileType, Rank } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';
import { useGameStore } from '../game/store';
import { canPlaceCardOnTableau } from '../game/rules';

interface TableauPileProps {
  cards: CardType[];
  position: [number, number, number]; // Base position for the pile
  onCardClick: (card: CardType, index: number) => void;
  pileIndex: number;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, position, onCardClick, pileIndex }) => {
  const { makeMove } = useGameStore();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      makeMove(item.currentPileType, item.currentPileIndex, item.cardIndexInPile, PileType.Tableau, pileIndex);
    },
    canDrop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      const movingCard = item.card;
      const targetPile = cards; // This is the pile we are dropping ONTO

      if (targetPile.length === 0) {
        return movingCard.rank === Rank.King;
      } else {
        const targetTopCard = targetPile[targetPile.length - 1];
        return canPlaceCardOnTableau(targetTopCard, movingCard);
      }
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
    minHeight: '120px', // Allow pile to grow
    border: `2px solid ${isOver && canDrop ? 'green' : canDrop ? 'yellow' : '#555'}`,
    borderRadius: '8px',
    zIndex: position[2],
    paddingTop: '5px',
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
  };

  return (
    <div ref={drop} style={pileStyle}>
      {cards.length === 0 && <span style={{ color: '#888', fontSize: '0.45em' }}>🂠</span>}
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          position={[0, index * 20, index + 1]} // Overlap cards vertically
          onClick={(clickedCard) => onCardClick(clickedCard, index)}
          currentPileType={PileType.Tableau}
          currentPileIndex={pileIndex}
          cardIndexInPile={index}
          canDrag={index === cards.length - 1 || card.isFaceUp} // Only top card or face-up cards in sequence can be dragged
        />
      ))}
    </div>
  );
};

export default TableauPile;
