import { GameState, Card, PileType, Suit, Move, Rank } from './types';
import { moveCard, checkWinCondition, canPlaceCardOnTableau, canPlaceCardOnFoundation, getRankValue as getRankValueFromRules, drawFromStock } from './rules';
import { PriorityQueue } from './priorityQueue'; // Assuming a PriorityQueue implementation

// Helper to serialize GameState for memoization
function serializeGameState(gameState: GameState): string {
  return JSON.stringify({
    stock: gameState.stock.map(c => c.id),
    waste: gameState.waste.map(c => c.id),
    foundations: Object.values(Suit).map(suit => gameState.foundations[suit].map(c => c.id)),
    tableaus: gameState.tableaus.map(pile => pile.map(c => c.id + (c.isFaceUp ? 'U' : 'D'))),
  });
}

function getRankValue(rank: Rank): number {
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
    default: return 0;
  }
}

function sameColorRunPenalty(gameState: GameState): number {
  let penalty = 0;
  for (const pile of gameState.tableaus) {
    for (let i = 0; i < pile.length - 1; i++) {
      const card1 = pile[i];
      const card2 = pile[i+1];
      if (card1.isFaceUp && card2.isFaceUp && card1.color === card2.color) {
        penalty += 1;
      }
    }
  }
  return penalty;
}

function kingPenalty(gameState: GameState): number {
  let penalty = 0;
  for (const pile of gameState.tableaus) {
    if (pile.length > 0 && pile[0].rank === Rank.King && pile.length > 1) {
      penalty += 5; // Penalize Kings that are blocking other cards
    }
  }
  return penalty;
}

// Heuristic function (h) for A*
function heuristic(gameState: GameState): number {
  const foundationCards = Object.values(gameState.foundations).reduce((sum, pile) => sum + pile.length, 0);
  const faceDownCards = gameState.tableaus.flat().filter(card => !card.isFaceUp).length;
  const emptyTableaus = gameState.tableaus.filter(pile => pile.length === 0).length;
  const penalty = sameColorRunPenalty(gameState) + kingPenalty(gameState);

  // Lower is better.
  // Main goal is to move cards to foundation.
  // Revealing face-down cards is important.
  // Empty tableaus are very helpful.
  return (52 - foundationCards) + (faceDownCards * 2) - (emptyTableaus * 5) + penalty;
}

// Main A* solver function
export function solve(initialGameState: GameState, maxIterations: number = 50000, epsilon: number = 0.1): Move[] | null {
  console.log(`solve: Starting A* solver with maxIterations ${maxIterations} and epsilon ${epsilon}.`);

  const openSet = new PriorityQueue<GameState>();
  const openSetStates = new Set<string>(); // For efficient lookups
  const cameFrom = new Map<string, { move: Move, state: GameState }>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startStateStr = serializeGameState(initialGameState);
  gScore.set(startStateStr, 0);
  fScore.set(startStateStr, heuristic(initialGameState));
  openSet.enqueue(initialGameState, fScore.get(startStateStr)!);
  openSetStates.add(startStateStr);

  let iterations = 0;
  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;
    
    let current: GameState;
    if (Math.random() < epsilon) {
      // Explore a random node
      const randomIndex = Math.floor(Math.random() * openSet.size());
      current = openSet.get(randomIndex)!;
    } else {
      // Exploit the best node
      current = openSet.dequeue()!;
    }

    const currentStateStr = serializeGameState(current);
    openSetStates.delete(currentStateStr);

    if (iterations % 1000 === 0) {
      console.log(`Iteration ${iterations}, fScore: ${fScore.get(currentStateStr)}, moves: ${findNextMoves(current).length}`);
    }

    if (checkWinCondition(current)) {
      console.log(`solve: Solution found after ${iterations} iterations!`);
      return reconstructPath(cameFrom, currentStateStr);
    }

    const moves = findNextMoves(current);

    for (const { move, nextState } of moves) {
      const nextStateStr = serializeGameState(nextState);
      const cost = move.fromPileType === PileType.Stock ? 0 : 1;
      const tentativeGScore = gScore.get(currentStateStr)! + cost;

      if (tentativeGScore < (gScore.get(nextStateStr) || Infinity)) {
        cameFrom.set(nextStateStr, { move, state: current });
        gScore.set(nextStateStr, tentativeGScore);
        const nextFScore = tentativeGScore + heuristic(nextState);
        fScore.set(nextStateStr, nextFScore);
        if (!openSetStates.has(nextStateStr)) {
          openSet.enqueue(nextState, nextFScore);
          openSetStates.add(nextStateStr);
        }
      }
    }
  }

  console.log(`solve: No solution found within ${maxIterations} iterations.`);
  return null;
}

function reconstructPath(cameFrom: Map<string, { move: Move, state: GameState }>, currentStateStr: string): Move[] {
  const totalPath: Move[] = [];
  let currentStr = currentStateStr;
  while (cameFrom.has(currentStr)) {
    const { move, state } = cameFrom.get(currentStr)!;
    totalPath.unshift(move);
    currentStr = serializeGameState(state);
  }
  return totalPath;
}

// Generates all possible valid moves from a given GameState
function findNextMoves(gameState: GameState): { move: Move, nextState: GameState }[] {
  const foundationMoves: { move: Move, nextState: GameState }[] = [];

  // --- Check for moves to foundation first ---
  // From Waste
  if (gameState.waste.length > 0) {
    const movingCard = gameState.waste[gameState.waste.length - 1];
    const fromCardIndex = gameState.waste.length - 1;
    const foundationPile = gameState.foundations[movingCard.suit];
    if (canPlaceCardOnFoundation(foundationPile, movingCard)) {
      const nextState = moveCard(gameState, PileType.Waste, null, fromCardIndex, PileType.Foundation, movingCard.suit);
      if (nextState) {
        foundationMoves.push({ move: { fromPileType: PileType.Waste, fromPileIndex: null, cardIndex: fromCardIndex, toPileType: PileType.Foundation, toPileIndex: movingCard.suit }, nextState });
        return foundationMoves; // Prioritize this move
      }
    }
  }

  // From Tableaus
  for (let fromPileIndex = 0; fromPileIndex < gameState.tableaus.length; fromPileIndex++) {
    const sourcePile = gameState.tableaus[fromPileIndex];
    if (sourcePile.length > 0) {
      const cardIndex = sourcePile.length - 1;
      const movingCard = sourcePile[cardIndex];
      if (movingCard.isFaceUp) {
        const foundationPile = gameState.foundations[movingCard.suit];
        if (canPlaceCardOnFoundation(foundationPile, movingCard)) {
          const nextState = moveCard(gameState, PileType.Tableau, fromPileIndex, cardIndex, PileType.Foundation, movingCard.suit);
          if (nextState) {
            foundationMoves.push({ move: { fromPileType: PileType.Tableau, fromPileIndex: fromPileIndex, cardIndex: cardIndex, toPileType: PileType.Foundation, toPileIndex: movingCard.suit }, nextState });
            return foundationMoves; // Prioritize this move
          }
        }
      }
    }
  }

  // --- If no foundation moves, generate all other moves ---
  const otherMoves: { move: Move, nextState: GameState }[] = [];

  // From Waste to Tableaus
  if (gameState.waste.length > 0) {
    const movingCard = gameState.waste[gameState.waste.length - 1];
    const fromCardIndex = gameState.waste.length - 1;
    for (let i = 0; i < gameState.tableaus.length; i++) {
      const targetPile = gameState.tableaus[i];
      if (targetPile.length === 0) {
        if (movingCard.rank === Rank.King) {
          const nextState = moveCard(gameState, PileType.Waste, null, fromCardIndex, PileType.Tableau, i);
          if (nextState) {
            otherMoves.push({ move: { fromPileType: PileType.Waste, fromPileIndex: null, cardIndex: fromCardIndex, toPileType: PileType.Tableau, toPileIndex: i }, nextState });
          }
        }
      } else {
        const targetTopCard = targetPile[targetPile.length - 1];
        if (canPlaceCardOnTableau(targetTopCard, movingCard)) {
          const nextState = moveCard(gameState, PileType.Waste, null, fromCardIndex, PileType.Tableau, i);
          if (nextState) {
            otherMoves.push({ move: { fromPileType: PileType.Waste, fromPileIndex: null, cardIndex: fromCardIndex, toPileType: PileType.Tableau, toPileIndex: i }, nextState });
          }
        }
      }
    }
  }

  // From Tableaus to other Tableaus
  for (let fromPileIndex = 0; fromPileIndex < gameState.tableaus.length; fromPileIndex++) {
    const sourcePile = gameState.tableaus[fromPileIndex];
    if (sourcePile.length === 0) continue;

    for (let cardIndex = 0; cardIndex < sourcePile.length; cardIndex++) {
      const movingCard = sourcePile[cardIndex];
      if (!movingCard.isFaceUp) continue;

      for (let toPileIndex = 0; toPileIndex < gameState.tableaus.length; toPileIndex++) {
        if (fromPileIndex === toPileIndex) continue;

        const targetPile = gameState.tableaus[toPileIndex];
        if (targetPile.length === 0) {
          if (movingCard.rank === Rank.King) {
            const nextState = moveCard(gameState, PileType.Tableau, fromPileIndex, cardIndex, PileType.Tableau, toPileIndex);
            if (nextState) {
              otherMoves.push({ move: { fromPileType: PileType.Tableau, fromPileIndex: fromPileIndex, cardIndex: cardIndex, toPileType: PileType.Tableau, toPileIndex: toPileIndex }, nextState });
            }
          }
        } else {
          const targetTopCard = targetPile[targetPile.length - 1];
          if (canPlaceCardOnTableau(targetTopCard, movingCard)) {
            const nextState = moveCard(gameState, PileType.Tableau, fromPileIndex, cardIndex, PileType.Tableau, toPileIndex);
            if (nextState) {
              otherMoves.push({ move: { fromPileType: PileType.Tableau, fromPileIndex: fromPileIndex, cardIndex: cardIndex, toPileType: PileType.Tableau, toPileIndex: toPileIndex }, nextState });
            }
          }
        }
      }
    }
  }

  // Drawing from stock
  if (gameState.stock.length > 0 || gameState.waste.length > 0) {
    const nextState = drawFromStock(gameState);
    otherMoves.push({ move: { fromPileType: PileType.Stock, fromPileIndex: null, cardIndex: 0, toPileType: PileType.Waste, toPileIndex: null }, nextState });
  }

  return otherMoves;
}