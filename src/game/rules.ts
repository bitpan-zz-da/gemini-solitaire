import { Card, Suit, Rank, CardColor, GameState, PileType } from './types';

/**
 * Creates a standard 52-card deck.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  let idCounter = 0;

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      const color = (suit === Suit.Diamonds || suit === Suit.Hearts) ? CardColor.Red : CardColor.Black;
      deck.push({
        suit,
        rank,
        color,
        isFaceUp: false,
        id: `card-${idCounter++}`,
      });
    }
  }
  return deck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates (Knuth) algorithm.
 */
export function shuffleDeck(deck: Card[], shuffleCount: number = 1): Card[] {
  for (let s = 0; s < shuffleCount; s++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
    }
  }
  return deck;
}

/**
 * Initializes the game state by dealing cards.
 */
export function dealCards(shuffledDeck: Card[]): GameState {
  const tableaus: Card[][] = Array.from({ length: 7 }, () => []);
  const stock: Card[] = [...shuffledDeck];

  // Deal to tableaus
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = stock.shift();
      if (card) {
        tableaus[j].push(card);
      }
    }
  }

  // Flip the last card of each tableau face up
  tableaus.forEach(pile => {
    if (pile.length > 0) {
      pile[pile.length - 1].isFaceUp = true;
    }
  });

  return {
    stock: stock.map(card => ({ ...card, isFaceUp: false })),
    waste: [],
    foundations: {
      [Suit.Clubs]: [],
      [Suit.Diamonds]: [],
      [Suit.Hearts]: [],
      [Suit.Spades]: [],
    },
    tableaus,
    score: 0,
    moves: 0,
    time: 0,
    isGameWon: false,
    isGameLost: false,
    lastMove: null,
    cardBackTheme: { name: 'Classic Blue', style: { backgroundColor: '#004d40' } }, // Default theme
    solutionPath: null,
  };
}

/**
 * Checks if a card can be placed on another card in a tableau pile.
 * Rules: Opposite color, one rank lower.
 */
export function canPlaceCardOnTableau(targetCard: Card, movingCard: Card): boolean {
  if (!targetCard || !movingCard) return false;
  return (targetCard.color !== movingCard.color) && (getRankValue(targetCard.rank) === getRankValue(movingCard.rank) + 1);
}

/**
 * Checks if a card can be placed on a foundation pile.
 * Rules: Same suit, one rank higher (or Ace on empty foundation).
 */
export function canPlaceCardOnFoundation(foundationPile: Card[], movingCard: Card): boolean {
  if (foundationPile.length === 0) {
    return movingCard.rank === Rank.Ace;
  } else {
    const topCard = foundationPile[foundationPile.length - 1];
    return (topCard.suit === movingCard.suit) && (getRankValue(topCard.rank) === getRankValue(movingCard.rank) - 1);
  }
}

/**
 * Helper to get numeric value of a rank.
 */
export function getRankValue(rank: Rank): number {
  switch (rank) {
    case Rank.Ace: return 1;
    case Rank.Two: return 2;
    case Rank.Three: return 3;
    case Rank.Four: return 4;
    case Rank.Five: return 5;
    case Rank.Six: return 6;
    case Rank.Seven: return 7;
    case Rank.Eight: return 8;
    case Rank.Nine: return 9;
    case Rank.Ten: return 10;
    case Rank.Jack: return 11;
    case Rank.Queen: return 12;
    case Rank.King: return 13;
    default:
      throw new Error(`Invalid rank: ${rank}`);
  }
}

/**
 * Checks if the game is won.
 * All cards must be in the foundation piles.
 */
export function checkWinCondition(gameState: GameState): boolean {
  const totalFoundationCards = Object.values(gameState.foundations).reduce((sum, pile) => sum + pile.length, 0);
  return totalFoundationCards === 52;
}

function countCards(gameState: GameState): number {
  const stockCount = gameState.stock.length;
  const wasteCount = gameState.waste.length;
  const foundationCount = Object.values(gameState.foundations).reduce((sum, pile) => sum + pile.length, 0);
  const tableauCount = gameState.tableaus.flat().length;
  return stockCount + wasteCount + foundationCount + tableauCount;
}

/**
 * Handles moving a card from one pile to another.
 * Returns a new GameState if move is valid, otherwise null.
 */
export function moveCard(gameState: GameState, fromPileType: PileType, fromPileIndex: number | Suit | null, cardIndex: number, toPileType: PileType, toPileIndex: number | Suit | null): GameState | null {
  const initialCardCount = countCards(gameState);

  // --- 1. Prepare potential move data (without modifying state yet) ---
  let potentialMovingCard: Card | undefined;
  let potentialCardsToMove: Card[] = [];
  let potentialSourcePile: Card[] = [];

  // Validate source and identify cards to move
  if (fromPileType === PileType.Tableau && typeof fromPileIndex === 'number') {
    potentialSourcePile = gameState.tableaus[fromPileIndex];
    if (cardIndex < 0 || cardIndex >= potentialSourcePile.length) return null; // Invalid card index

    // Ensure all cards in the stack to move are face up
    for (let i = cardIndex; i < potentialSourcePile.length; i++) {
      if (!potentialSourcePile[i].isFaceUp) return null; // Cannot move a stack with face-down cards
    }
    potentialCardsToMove = potentialSourcePile.slice(cardIndex); // Get the stack without removing yet
    potentialMovingCard = potentialCardsToMove[0];

  } else if (fromPileType === PileType.Waste) {
    potentialSourcePile = gameState.waste;
    if (cardIndex !== potentialSourcePile.length - 1) return null; // Only top card of waste can be moved
    potentialMovingCard = potentialSourcePile[cardIndex]; // Get the card without removing yet
    if (!potentialMovingCard) return null;
    potentialCardsToMove = [potentialMovingCard]; // Single card from waste

  } else if (fromPileType === PileType.Foundation) {
    return null; // Moving from foundation is generally not allowed
  } else {
    return null; // Invalid source pile type
  }

  if (!potentialMovingCard) return null; // Should not happen if source validation passed

  // --- 2. Validate target placement (without modifying state yet) ---
  let targetValidationSuccessful = false;

  if (toPileType === PileType.Tableau && typeof toPileIndex === 'number') {
    const targetPile = gameState.tableaus[toPileIndex]; // Use original gameState for validation
    if (targetPile.length === 0) {
      if (potentialMovingCard.rank === Rank.King) {
        targetValidationSuccessful = true;
      }
    } else {
      const targetTopCard = targetPile[targetPile.length - 1];
      if (canPlaceCardOnTableau(targetTopCard, potentialMovingCard)) {
        targetValidationSuccessful = true;
      }
    }
  } else if (toPileType === PileType.Foundation && typeof toPileIndex === 'string') {
    if (potentialCardsToMove.length === 1) { // Only single cards can be moved to foundation
      const targetPile = gameState.foundations[toPileIndex as Suit]; // Use original gameState for validation
      if (canPlaceCardOnFoundation(targetPile, potentialMovingCard)) {
        targetValidationSuccessful = true;
      }
    }
  }

  if (!targetValidationSuccessful) return null; // Target validation failed

  // --- 3. If all validations pass, then perform the actual state modifications on a new game state ---
  const newGameState: GameState = {
    ...gameState,
    stock: gameState.stock.map(card => ({ ...card })),
    waste: gameState.waste.map(card => ({ ...card })),
    foundations: {
      [Suit.Clubs]: gameState.foundations[Suit.Clubs].map(card => ({ ...card })),
      [Suit.Diamonds]: gameState.foundations[Suit.Diamonds].map(card => ({ ...card })),
      [Suit.Hearts]: gameState.foundations[Suit.Hearts].map(card => ({ ...card })),
      [Suit.Spades]: gameState.foundations[Suit.Spades].map(card => ({ ...card })),
    },
    tableaus: gameState.tableaus.map(pile => pile.map(card => ({ ...card }))),
  };

  // Remove cards from source pile in newGameState
  if (fromPileType === PileType.Tableau && typeof fromPileIndex === 'number') {
    newGameState.tableaus[fromPileIndex].splice(cardIndex);
  } else if (fromPileType === PileType.Waste) {
    newGameState.waste.pop();
  }

  // Add cards to target pile in newGameState
  if (toPileType === PileType.Tableau && typeof toPileIndex === 'number') {
    newGameState.tableaus[toPileIndex].push(...potentialCardsToMove);
  } else if (toPileType === PileType.Foundation && typeof toPileIndex === 'string') {
    newGameState.foundations[toPileIndex as Suit].push(potentialMovingCard);
  }

  // Flip new top card of source tableau if any
  if (fromPileType === PileType.Tableau && typeof fromPileIndex === 'number' && newGameState.tableaus[fromPileIndex].length > 0) {
    const topOfSourceTableau = newGameState.tableaus[fromPileIndex][newGameState.tableaus[fromPileIndex].length - 1];
    if (!topOfSourceTableau.isFaceUp) {
      newGameState.tableaus[fromPileIndex][newGameState.tableaus[fromPileIndex].length - 1] = { ...topOfSourceTableau, isFaceUp: true };
    }
  }

  newGameState.moves++;
  newGameState.isGameWon = checkWinCondition(newGameState);

  const finalCardCount = countCards(newGameState);
  if (initialCardCount !== finalCardCount) {
    console.error("CARD COUNT MISMATCH!", { initial: initialCardCount, final: finalCardCount, move: { fromPileType, fromPileIndex, cardIndex, toPileType, toPileIndex } });
    throw new Error("A card went missing!");
  }

  return newGameState;
}

/**
 * Handles drawing a card from the stock pile to the waste pile.
 */
export function drawFromStock(gameState: GameState): GameState {
  const newGameState: GameState = {
    ...gameState,
    stock: gameState.stock.map(card => ({ ...card })),
    waste: gameState.waste.map(card => ({ ...card })),
    foundations: {
      [Suit.Clubs]: gameState.foundations[Suit.Clubs].map(card => ({ ...card })),
      [Suit.Diamonds]: gameState.foundations[Suit.Diamonds].map(card => ({ ...card })),
      [Suit.Hearts]: gameState.foundations[Suit.Hearts].map(card => ({ ...card })),
      [Suit.Spades]: gameState.foundations[Suit.Spades].map(card => ({ ...card })),
    },
    tableaus: gameState.tableaus.map(pile => pile.map(card => ({ ...card }))),
  };

  if (newGameState.stock.length > 0) {
    const card = newGameState.stock.pop();
    if (card) {
      newGameState.waste.push({ ...card, isFaceUp: true }); // Create new card object with isFaceUp set to true
      newGameState.moves++;
    }
  } else if (newGameState.waste.length > 0) {
    // Recycle waste pile to stock
    newGameState.stock = newGameState.waste.reverse().map(card => ({ ...card, isFaceUp: false }));
    newGameState.waste = [];
    newGameState.moves++;
  }

  return newGameState;
}

/**
 * Attempts to automatically move a card to a foundation pile if possible.
 * Returns the updated GameState or null if no auto-move was possible.
 */
export function autoMoveToFoundation(gameState: GameState): GameState | null {
  const newGameState: GameState = {
    ...gameState,
    stock: gameState.stock.map(card => ({ ...card })),
    waste: gameState.waste.map(card => ({ ...card })),
    foundations: {
      [Suit.Clubs]: gameState.foundations[Suit.Clubs].map(card => ({ ...card })),
      [Suit.Diamonds]: gameState.foundations[Suit.Diamonds].map(card => ({ ...card })),
      [Suit.Hearts]: gameState.foundations[Suit.Hearts].map(card => ({ ...card })),
      [Suit.Spades]: gameState.foundations[Suit.Spades].map(card => ({ ...card })),
    },
    tableaus: gameState.tableaus.map(pile => pile.map(card => ({ ...card }))),
  };
  let moved = false;

  // Check tableau piles
  for (let i = 0; i < newGameState.tableaus.length; i++) {
    const tableauPile = newGameState.tableaus[i];
    if (tableauPile.length > 0) {
      const topCard = tableauPile[tableauPile.length - 1];
      if (topCard.isFaceUp) {
        const targetFoundation = newGameState.foundations[topCard.suit];
        if (canPlaceCardOnFoundation(targetFoundation, topCard)) {
          targetFoundation.push(tableauPile.pop()!);
          moved = true;
          // Flip new top card of tableau if any
          if (tableauPile.length > 0) {
            const topOfTableau = tableauPile[tableauPile.length - 1];
            if (!topOfTableau.isFaceUp) {
              tableauPile[tableauPile.length - 1] = { ...topOfTableau, isFaceUp: true };
            }
          }
          break; // Only one card can be auto-moved at a time to avoid infinite loops
        }
      }
    }
  }

  // Check waste pile
  if (!moved && newGameState.waste.length > 0) {
    const topCard = newGameState.waste[newGameState.waste.length - 1];
    const targetFoundation = newGameState.foundations[topCard.suit];
    if (canPlaceCardOnFoundation(targetFoundation, topCard)) {
      targetFoundation.push(newGameState.waste.pop()!);
      moved = true;
    }
  }

  if (moved) {
    newGameState.moves++;
    newGameState.isGameWon = checkWinCondition(newGameState);
    return newGameState;
  }

  return null; // No auto-move possible
}

/**
 * Creates a "nearly perfect" game state for testing purposes, with a high probability of being solvable.
 */
export function dealNearlyPerfectGame(): GameState {
  let deck = createDeck();
  // No shuffle for a completely predictable game
  deck = shuffleDeck(deck, 0);
  return dealCards(deck);
}

/**
 * Creates a "perfect" game state for testing purposes, where the game is trivially winnable.
 */
export function dealPerfectGame(): GameState {
  const deck = createDeck().reverse(); // Reverse the deck to get King to Ace

  return {
    stock: deck.map(card => ({ ...card, isFaceUp: false })),
    waste: [],
    foundations: {
      [Suit.Clubs]: [],
      [Suit.Diamonds]: [],
      [Suit.Hearts]: [],
      [Suit.Spades]: [],
    },
    tableaus: Array.from({ length: 7 }, () => []),
    score: 0,
    moves: 0,
    time: 0,
    isGameWon: false,
    isGameLost: false,
    lastMove: null,
    cardBackTheme: { name: 'Classic Blue', style: { backgroundColor: '#004d40' } }, // Default theme
    solutionPath: null,
  };
}
