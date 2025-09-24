import React from 'react';
import { Card as CardType, PileType, Rank, Suit } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';
import { useGameStore } from '../game/store';
import { canPlaceCardOnTableau } from '../game/rules';

interface TableauPileProps {
  cards: CardType[];
  onCardClick: (card: CardType, index: number) => void;
  pileIndex: number;
  style?: React.CSSProperties;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, onCardClick, pileIndex, style }) => {
  const { makeMove } = useGameStore();

  const [{ isOver, canDrop }, drop]: [any, any] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | string | null; cardIndexInPile: number }) => {
      makeMove(item.currentPileType, item.currentPileIndex as number | Suit | null, item.cardIndexInPile, PileType.Tableau, pileIndex);
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
    position: 'relative',
    width: '100%', // Fill parent container
    minHeight: '100%', // Fill parent container
    border: `0.1em solid ${isOver && canDrop ? 'green' : canDrop ? 'yellow' : '#555'}`, // Responsive border
    borderRadius: '0.5em', // Responsive border-radius
    paddingTop: '0.3em', // Responsive paddingTop
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    alignSelf: 'start',
    ...style, // Merge passed style prop
  };

  return (
    <div ref={drop} style={pileStyle}>
      {cards.length === 0 && <span style={{ color: '#888', fontSize: '0.45em' }}>🂠</span>}
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          position={[0, index * 1.5, index + 1]} // Overlap cards vertically (responsive multiplier)
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
