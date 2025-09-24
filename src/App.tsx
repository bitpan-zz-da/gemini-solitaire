import { useEffect } from 'react'
import './App.css'
import { useGameStore } from './game/store'
import { Card as CardType, PileType, Suit, Rank } from './game/types'
import { canPlaceCardOnFoundation, canPlaceCardOnTableau } from './game/rules'
import Card from './components/Card'

import StockPile from './components/StockPile'
import WastePile from './components/WastePile'
import FoundationPile from './components/FoundationPile'
import TableauPile from './components/TableauPile'
import Themes from './components/Themes'

function App() {
  const { startGame, stock, waste, tableaus, foundations, drawCard, makeMove, solveGame } = useGameStore();

  useEffect(() => {
    startGame();
  }, [startGame]);
  const handleCardClick = (card: CardType, pileType: PileType, pileIndex: number | Suit | null, cardIndex?: number) => {
    const currentGameState = useGameStore.getState();
    const { makeMove, tableaus, waste, foundations } = currentGameState;

    let moved = false;

    // Logic for clicking a card in a Tableau Pile
    if (pileType === PileType.Tableau && typeof pileIndex === 'number' && cardIndex !== undefined) {
      const clickedPile = tableaus[pileIndex];
      // Ensure the clicked card is face-up and is the top-most card of a draggable stack
      if (!card.isFaceUp || cardIndex < 0 || cardIndex >= clickedPile.length) return; // Should not happen if clicked card is face up

      // Determine the stack of cards to move (from clickedCardIndex to end of pile)
      const cardsToAttemptMove = clickedPile.slice(cardIndex);
      if (cardsToAttemptMove.length === 0) return;
      const movingCardForValidation = cardsToAttemptMove[0]; // The card that will be validated against the target

      // Try moving to foundations first (only single cards can go to foundation)
      if (cardsToAttemptMove.length === 1) {
        for (const suit of Object.values(Suit)) {
          const targetFoundation = foundations[suit];
          if (canPlaceCardOnFoundation(targetFoundation, movingCardForValidation)) {
            if (makeMove(pileType, pileIndex, cardIndex, PileType.Foundation, suit)) {
              moved = true;
              break;
            }
          }
        }
      }

      if (!moved) {
        // If not moved to foundation, try moving to another tableau pile
        for (let i = 0; i < tableaus.length; i++) {
          if (i === pileIndex) continue; // Don't try to move to the same pile

          const targetTableau = tableaus[i];
          if (targetTableau.length === 0) {
            if (movingCardForValidation.rank === Rank.King) {
              if (makeMove(pileType, pileIndex, cardIndex, PileType.Tableau, i)) {
                moved = true;
                break;
              }
            }
          } else {
            const targetTopCard = targetTableau[targetTableau.length - 1];
            if (canPlaceCardOnTableau(targetTopCard, movingCardForValidation)) {
              if (makeMove(pileType, pileIndex, cardIndex, PileType.Tableau, i)) {
                moved = true;
                break;
              }
            }
          }
        }
      }
    }
    // Logic for clicking a card in the Waste Pile
    else if (pileType === PileType.Waste && cardIndex === waste.length - 1) {
      const movingCardForValidation = card; // Top card of waste
      let moved = false;

      // Try moving to foundations first
      for (const suit of Object.values(Suit)) {
        const targetFoundation = foundations[suit];
        if (canPlaceCardOnFoundation(targetFoundation, movingCardForValidation)) {
          if (makeMove(pileType, null, cardIndex, PileType.Foundation, suit)) {
            moved = true;
            break;
          }
        }
      }

      if (!moved) {
        // If not moved to foundation, try moving to another tableau pile
        for (let i = 0; i < tableaus.length; i++) {
          const targetTableau = tableaus[i];
          if (targetTableau.length === 0) {
            if (movingCardForValidation.rank === Rank.King) {
              if (makeMove(pileType, null, cardIndex, PileType.Tableau, i)) {
                moved = true;
                break;
              }
            }
          } else {
            const targetTopCard = targetTableau[targetTableau.length - 1];
            if (canPlaceCardOnTableau(targetTopCard, movingCardForValidation)) {
              if (makeMove(pileType, null, cardIndex, PileType.Tableau, i)) {
                moved = true;
                break;
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 50px' }}>
        <h1>Jyeshta Solitaire</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', color: 'white', fontSize: '0.45em' }}>
            <p>Stock: {stock.length} cards</p>
            <p>Waste: {waste.length} cards</p>
            <p>Moves: {useGameStore.getState().moves}</p>
          </div>
          <Themes />
        </div>
      </div>

      {tableaus.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', padding: '0 50px' }}>
          <button onClick={startGame} style={{ padding: '6px 12px', fontSize: '0.8em', marginBottom: '10px' }}>New Game</button>
          <div className="game-board">
          {/* Stock Pile */}
          <StockPile cards={stock} position={[50, 50, 0]} onDraw={drawCard} />

          {/* Waste Pile */}
          {waste.length > 0 && (
            <Card
              card={{ ...waste[waste.length - 1], isFaceUp: true }}
              position={[150, 50, 1]} // Position for the top card of waste
              onClick={(card) => handleCardClick(card, PileType.Waste, null, waste.length - 1)}
              currentPileType={PileType.Waste}
              currentPileIndex={null}
              cardIndexInPile={waste.length - 1}
            />
          )}

          {/* Foundation Piles */}
          {Object.values(Suit).map((suit, index) => {
            const foundationCards = foundations[suit];
            const topCard = foundationCards.length > 0 ? foundationCards[foundationCards.length - 1] : null;
            return (
              <FoundationPile
                key={suit}
                suit={suit}
                cards={foundationCards}
                position={[450 + index * 100, 50, 0]}
                onCardClick={(card) => handleCardClick(card, PileType.Foundation, suit, foundationCards.length - 1)}
              />
            );
          })}

          {/* Tableau Piles */}
                  {tableaus.map((pile, index) => {
                    return (
                      <TableauPile
                        key={index}
                        cards={pile}
                        position={[50 + index * 100, 200, 0]}
                        onCardClick={(card, cardIndex) => handleCardClick(card, PileType.Tableau, index, cardIndex)}
                        pileIndex={index}
                      />
                    );
                  })}        
            <button onClick={solveGame} style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 15px', fontSize: '0.9em' }}>Solve It</button>
          </div>
        </div>
      ) : (
        <p>Loading game...</p>
      )}
    </div>
  );
}

export default App;
