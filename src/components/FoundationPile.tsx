import React from 'react';
import { Card as CardType, Suit, PileType, Rank } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';
import { useGameStore } from '../game/store';
import { canPlaceCardOnFoundation } from '../game/rules';

interface FoundationPileProps {
  suit: Suit;
  cards: CardType[];
  position: [number, number, number];
  onCardClick: (card: CardType) => void;
}

const FoundationPile: React.FC<FoundationPileProps> = ({ suit, cards, position, onCardClick }) => {
  const { makeMove } = useGameStore();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | Suit | null; cardIndexInPile: number }) => {
      // Only allow single card drops to foundation
      if (item.cardIndexInPile === item.currentPileType.length - 1) { // Assuming cardIndexInPile is the top card
        makeMove(item.currentPileType, item.currentPileIndex, item.cardIndexInPile, PileType.Foundation, suit);
      }
    },
    canDrop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | Suit | null; cardIndexInPile: number }) => {
      // Only allow single card drops to foundation
      if (item.currentPileType === PileType.Tableau) {
        const sourceTableau = useGameStore.getState().tableaus[item.currentPileIndex as number];
        // If dragging from tableau, ensure it's the top-most card of the pile (meaning only 1 card is being moved)
        if (item.cardIndexInPile !== sourceTableau.length - 1) return false; 
      } else if (item.currentPileType === PileType.Waste) {
        const sourceWaste = useGameStore.getState().waste;
        // If dragging from waste, ensure it's the top-most card of the pile (meaning only 1 card is being moved)
        if (item.cardIndexInPile !== sourceWaste.length - 1) return false; 
      }

      const movingCard = item.card;
      // The target pile for canPlaceCardOnFoundation is the current cards in THIS foundation pile
      return canPlaceCardOnFoundation(cards, movingCard);
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
        <span style={{ fontSize: '1.5em' }}>{getSuitSymbol(suit)}</span> // Empty foundation symbol
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

export default FoundationPile;
