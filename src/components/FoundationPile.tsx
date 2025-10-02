import { Card as CardType, Suit, PileType } from '../game/types';
import Card from './Card';
import { useDrop } from 'react-dnd';
import { useGameStore } from '../game/store';
import { canPlaceCardOnFoundation } from '../game/rules';

interface FoundationPileProps {
  suit: Suit;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  style?: React.CSSProperties;
  className?: string; // Add className prop
}

const FoundationPile: React.FC<FoundationPileProps> = ({ suit, cards, onCardClick, style, className }) => {
  const { makeMove } = useGameStore();

  const [{ isOver, canDrop }, drop]: [any, any] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { card: CardType; currentPileType: PileType; currentPileIndex: number | Suit | null; cardIndexInPile: number }) => {
      makeMove(item.currentPileType, item.currentPileIndex, item.cardIndexInPile, PileType.Foundation, suit);
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
    position: 'relative',
    border: `0.1em solid ${isOver && canDrop ? 'green' : canDrop ? 'yellow' : '#555'}`, // Responsive border
    borderRadius: '0.5em', // Responsive border-radius
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
    ...style, // Merge passed style prop
  };

  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div ref={drop} style={pileStyle} className={className}>
      {topCard ? (
        <Card card={{ ...topCard, isFaceUp: true }} position={[0, 0, 1]} onClick={onCardClick} currentPileType={PileType.Foundation} currentPileIndex={suit} cardIndexInPile={cards.length - 1} className={className} />
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
