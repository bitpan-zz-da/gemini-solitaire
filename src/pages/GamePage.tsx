import React, { useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonGrid, IonRow, IonCol } from '@ionic/react';

import { useGameStore } from '../game/store';
import { Card as CardType, PileType, Suit, Rank } from '../game/types';
import { canPlaceCardOnFoundation, canPlaceCardOnTableau } from '../game/rules';
import Card from '../components/Card';
import StockPile from '../components/StockPile';
import FoundationPile from '../components/FoundationPile';
import TableauPile from '../components/TableauPile';
import Themes from '../components/Themes';
import { useIsMobile } from '../hooks/useIsMobile';

const GamePage: React.FC = () => {
  const { startGame, stock, waste, tableaus, foundations, drawCard, solveGame } = useGameStore();
  const isMobile = useIsMobile(); // Use the hook

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Jyeshta Solitaire</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-align-items-center ion-justify-content-between">
            <IonCol size="auto">
              <div style={{ display: 'flex', gap: '15px', color: 'white', fontSize: '0.45em' }}>
                <p>Stock: {stock.length} cards</p>
                <p>Waste: {waste.length} cards</p>
                <p>Moves: {useGameStore.getState().moves}</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {tableaus.length > 0 ? (
          isMobile ? (
            <IonGrid>
              {/* New Game and Solve It Buttons */}
              <IonRow className="ion-justify-content-between ion-padding-bottom">
                <IonCol size="auto">
                  <IonButton onClick={startGame}>New Game</IonButton>
                </IonCol>
                <IonCol size="auto">
                  <IonButton onClick={solveGame}>Solve It</IonButton>
                </IonCol>
              </IonRow>

              {/* Top Piles: Stock, Waste, Foundations (Mobile) */}
              <IonRow className="ion-justify-content-center ion-align-items-center ion-nowrap">
                {/* Stock Pile */}
                <IonCol size="auto">
                  <div className="mobile-pile-container">
                    <StockPile onDraw={drawCard} className="mobile-card" />
                  </div>
                </IonCol>

                {/* Waste Pile */}
                <IonCol size="auto">
                  {waste.length > 0 && (
                    <div className="mobile-pile-container">
                      <Card
                        card={{ ...waste[waste.length - 1], isFaceUp: true }}
                        position={[0, 0, 1]}
                        onClick={(card) => handleCardClick(card, PileType.Waste, null, waste.length - 1)}
                        currentPileType={PileType.Waste}
                        currentPileIndex={null}
                        cardIndexInPile={waste.length - 1}
                        className="mobile-card"
                      />
                    </div>
                  )}
                </IonCol>

                {/* Empty cols for spacing */}
                <IonCol size="auto">
                  {/* This column is intentionally left empty for spacing */}
                </IonCol>

                {/* Foundation Piles */}
                {Object.values(Suit).map((suit) => {
                  const foundationCards = foundations[suit];
                  return (
                    <IonCol size="auto" key={suit}>
                      <div className="mobile-pile-container">
                        <FoundationPile
                          suit={suit}
                          cards={foundationCards}
                          onCardClick={(card) => handleCardClick(card, PileType.Foundation, suit, foundationCards.length - 1)}
                          className="mobile-card"
                        />
                      </div>
                    </IonCol>
                  );
                })}
              </IonRow>

              {/* Tableau Piles (Mobile) */}
              <IonRow className="ion-justify-content-center ion-align-items-start ion-padding-top">
                <div className="mobile-tableau-row">
                  {tableaus.map((pile, index) => (
                    <TableauPile
                      key={index}
                      cards={pile}
                      onCardClick={(card, cardIndex) => handleCardClick(card, PileType.Tableau, index, cardIndex)}
                      pileIndex={index}
                      cardClassName="mobile-card"
                    />
                  ))}
                </div>
              </IonRow>
            </IonGrid>
          ) : (
            // Web Layout
            <div className="game-board-web-container scale-75">
              {/* Top Row: New Game/Solve It, Stock, Waste, Foundations, Themes */}
              <div className="game-board-web-top-row">
                {/* Left Section: New Game and Solve It Buttons + Stock Pile + Waste Pile */}
                <div className="game-board-web-top-left">
                  <div style={{ display: 'flex', gap: '2em' }}>
                    <IonButton onClick={startGame}>New Game</IonButton>
                    <IonButton onClick={solveGame}>Solve It</IonButton>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 6.5em)', gap: '1em' }}>
                    <div className="web-pile-container" style={{ gridColumn: '1 / 2' }}>
                      <StockPile onDraw={drawCard} className="web-card" />
                    </div>
                    <div className="web-pile-container" style={{ gridColumn: '2 / 3' }}>
                      {waste.length > 0 && (
                        <Card
                          card={{ ...waste[waste.length - 1], isFaceUp: true }}
                          position={[0, 0, 1]}
                          onClick={(card) => handleCardClick(card, PileType.Waste, null, waste.length - 1)}
                          currentPileType={PileType.Waste}
                          currentPileIndex={null}
                          cardIndexInPile={waste.length - 1}
                          className="web-card"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section: Foundation Piles + Themes */}
                <div className="game-board-web-top-right">
                  <Themes className="theme-button-style" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 6.5em)', gap: '1em' }}>
                    {Object.values(Suit).map((suit, index) => {
                      const foundationCards = foundations[suit];
                      return (
                        <div className="web-pile-container" key={suit} style={{ gridColumn: `${index + 1} / ${index + 2}` }}>
                          <FoundationPile
                            suit={suit}
                            cards={foundationCards}
                            onCardClick={(card) => handleCardClick(card, PileType.Foundation, suit, foundationCards.length - 1)}
                            className="web-card"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tableau Piles (Web) */}
              <div className="game-board-web-tableau-row">
                {tableaus.map((pile, index) => (
                  <div className="web-pile-container" key={index} style={{ gridColumn: `${index + 1} / ${index + 2}` }}>
                    <TableauPile
                      cards={pile}
                      onCardClick={(card, cardIndex) => handleCardClick(card, PileType.Tableau, index, cardIndex)}
                      pileIndex={index}
                      cardClassName="web-card"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <p>Loading game...</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GamePage;
