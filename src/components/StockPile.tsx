import React from 'react';
import { useDrop } from 'react-dnd';

interface StockPileProps {
  onDraw: () => void;
  style?: React.CSSProperties;
}

const StockPile: React.FC<StockPileProps> = ({ onDraw, style }) => {
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
    width: '80px',
    height: '120px',
    border: `2px solid ${isOver && canDrop ? 'green' : canDrop ? 'yellow' : '#555'}`,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
    ...style,
  };

  return (
    <div ref={drop} style={pileStyle} onClick={onDraw}>
      <span style={{ fontSize: '0.45em' }}>🂠</span> {/* Empty stock symbol */}
    </div>
  );
};

export default StockPile;