import React from 'react';
import { useDrop } from 'react-dnd';

interface WastePileProps {
  style?: React.CSSProperties;
}

const WastePile: React.FC<WastePileProps> = ({ style }) => {

  const [{ isOver, canDrop }, drop]: [any, any] = useDrop(() => ({
    accept: 'CARD',
    drop: () => {
      // Waste pile typically does not accept drops from other piles in Solitaire
    },
    canDrop: () => {
      // Waste pile usually cannot accept cards from other piles.
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
    backgroundColor: isOver && canDrop ? 'rgba(0,255,0,0.1)' : '#333',
    color: '#888',
    ...style, // Merge passed style prop
  };

  return (
    <div ref={drop} style={pileStyle}>
      <span style={{ fontSize: '0.45em' }}>🂠</span> {/* Empty waste symbol */}
    </div>
  );
};

export default WastePile;