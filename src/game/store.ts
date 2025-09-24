import { create } from 'zustand';
import { createDeck, shuffleDeck, dealCards, moveCard, drawFromStock, checkWinCondition, autoMoveToFoundation, dealPerfectGame, dealNearlyPerfectGame } from './rules';
import { GameState, PileType, Card, Suit, Rank, CardBackTheme, Move } from './types';
import { solve } from './solver'; // Import the solver

// --- Card Back Themes ---
const CARD_BACK_THEMES: CardBackTheme[] = [
  {
    name: 'Classic Blue',
    style: {
      backgroundColor: '#004d40', /* Dark Teal */
      backgroundImage: 'repeating-linear-gradient(45deg, #005f50 0, #005f50 10px, #004d40 10px, #004d40 20px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    name: 'Royal Red',
    style: {
      backgroundColor: '#8B0000', /* Dark Red */
      backgroundImage: 'repeating-linear-gradient(135deg, #A52A2A 0, #A52A2A 10px, #8B0000 10px, #8B0000 20px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    name: 'Forest Green',
    style: {
      backgroundColor: '#228B22', /* Forest Green */
      backgroundImage: 'repeating-linear-gradient(45deg, #3CB371 0, #3CB371 10px, #228B22 10px, #228B22 20px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    name: 'Purple Haze',
    style: {
      backgroundColor: '#4B0082', /* Indigo */
      backgroundImage: 'repeating-linear-gradient(135deg, #8A2BE2 0, #8A2BE2 10px, #4B0082 10px, #4B0082 20px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    name: 'Golden Sunset',
    style: {
      backgroundColor: '#FF8C00', /* Dark Orange */
      backgroundImage: 'repeating-linear-gradient(45deg, #FFA500 0, #FFA500 10px, #FF8C00 10px, #FF8C00 20px)',
      backgroundSize: '20px 20px',
    },
  },
];

interface GameStore extends GameState {
  startGame: () => void;
  makeMove: (fromPileType: PileType, fromPileIndex: number | Suit | null, cardIndex: number, toPileType: PileType, toPileIndex: number | Suit | null) => boolean;
  drawCard: () => void;
  autoMove: () => void;
  setCardBackTheme: (theme: CardBackTheme) => void;
  solveGame: () => void; // New action for solver
  // Add other actions like undo, restart, etc.
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial GameState
  stock: [],
  waste: [],
  foundations: {
    [Suit.Clubs]: [],
    [Suit.Diamonds]: [],
    [Suit.Hearts]: [],
    [Suit.Spades]: [],
  },
  tableaus: [],
  score: 0,
  moves: 0,
  time: 0,
  isGameWon: false,
  isGameLost: false,
  lastMove: null,
  cardBackTheme: CARD_BACK_THEMES[0], // Default theme
  solutionPath: null, // Initialize solution path

  setCardBackTheme: (theme: CardBackTheme) => set({ cardBackTheme: theme }),

  solveGame: async () => {
    const currentGameState = get();
    set({ solutionPath: null }); // Clear previous solution
    console.log('Solving game...');
    const solution = solve(currentGameState);
    if (solution) {
      set({ solutionPath: solution });
      console.log('Solution found!', solution);

      // Visualize the solution step-by-step
      for (let i = 0; i < solution.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Delay for visualization
        const move = solution[i];
        const success = get().makeMove(move.fromPileType, move.fromPileIndex, move.cardIndex, move.toPileType, move.toPileIndex);
        if (!success) {
          console.error('Solver move failed to execute:', move);
          set({ solutionPath: null }); // Clear path if execution fails
          break;
        }
      }
      set({ solutionPath: null }); // Clear path after execution
    } else {
      console.log('No solution found.');
    }
  },

  startGame: () => {
    const initialGameState = dealNearlyPerfectGame();
    set(state => ({
      ...initialGameState,
      tableaus: initialGameState.tableaus.map(pile => [...pile]), // Ensure a fresh copy of tableaus
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    }));
  },

  makeMove: (fromPileType, fromPileIndex, cardIndex, toPileType, toPileIndex) => {
    const currentGameState = get();
    let updatedGameState: GameState | null = null;
    if (fromPileType === PileType.Stock) {
      updatedGameState = drawFromStock(currentGameState);
    } else {
      updatedGameState = moveCard(currentGameState, fromPileType, fromPileIndex, cardIndex, toPileType, toPileIndex);
    }
    if (updatedGameState) {
      set(updatedGameState);
      return true;
    }
    return false;
  },

  drawCard: () => {
    set(state => {
      const updatedGameState = drawFromStock(state);
      return updatedGameState;
    });
  },

  autoMove: () => {
    set(state => {
      const updatedGameState = autoMoveToFoundation(state);
      return updatedGameState || state; // If no auto-move, return current state
    });
  },

  // TODO: Implement undo, restart, etc.
}));
