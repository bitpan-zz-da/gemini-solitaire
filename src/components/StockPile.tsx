import React from 'react';
import { useDrop } from 'react-dnd';

interface StockPileProps {
  onDraw: () => void;
  style?: React.CSSProperties;
  className?: string; // Add className prop
}

const StockPile: React.FC<StockPileProps> = ({ onDraw, style, className }) => {
  const [{ isOver, canDrop }, drop]: [any, any] = useDrop(() => ({
    accept: 'CARD',
    drop: () => {
      // Stock pile does not accept drops from other piles in Solitaire
    },
    canDrop: () => {
      // Stock pile usually cannot accept cards from other piles.
      return false;
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
    cursor: 'pointer',
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
    ...style,
  };

  return (
    <div ref={drop} style={pileStyle} className={className} onClick={onDraw}>
      <span style={{ fontSize: '0.45em' }}>🂠</span> {/* Empty stock symbol */}
    </div>
  );
};

export default StockPile;