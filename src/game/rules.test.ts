import { describe, it, expect } from 'vitest';
import { GameState, PileType, Suit, Rank, CardColor } from './types';
import { moveCard } from './rules';

describe('moveCard', () => {
  it('should move a card from waste to an empty tableau', () => {
    const initialGameState: GameState = {
      stock: [],
      waste: [{ id: 'C13', suit: Suit.Clubs, rank: Rank.King, color: CardColor.Black, isFaceUp: true }],
      foundations: { [Suit.Clubs]: [], [Suit.Diamonds]: [], [Suit.Hearts]: [], [Suit.Spades]: [] },
      tableaus: [[], [], [], [], [], [], []],
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    };

    const nextState = moveCard(initialGameState, PileType.Waste, null, 0, PileType.Tableau, 0);

    expect(nextState).not.toBeNull();
    expect(nextState?.waste.length).toBe(0);
    expect(nextState?.tableaus[0].length).toBe(1);
    expect(nextState?.tableaus[0][0].rank).toBe(Rank.King);
  });

  it('should move a card from waste to a non-empty tableau', () => {
    const initialGameState: GameState = {
      stock: [],
      waste: [{ id: 'C12', suit: Suit.Clubs, rank: Rank.Queen, color: CardColor.Black, isFaceUp: true }],
      foundations: { [Suit.Clubs]: [], [Suit.Diamonds]: [], [Suit.Hearts]: [], [Suit.Spades]: [] },
      tableaus: [[{ id: 'D13', suit: Suit.Diamonds, rank: Rank.King, color: CardColor.Red, isFaceUp: true }]],
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    };

    const nextState = moveCard(initialGameState, PileType.Waste, null, 0, PileType.Tableau, 0);

    expect(nextState).not.toBeNull();
    expect(nextState?.waste.length).toBe(0);
    expect(nextState?.tableaus[0].length).toBe(2);
    expect(nextState?.tableaus[0][1].rank).toBe(Rank.Queen);
  });

  it('should move a card from waste to a foundation', () => {
    const initialGameState: GameState = {
      stock: [],
      waste: [{ id: 'C1', suit: Suit.Clubs, rank: Rank.Ace, color: CardColor.Black, isFaceUp: true }],
      foundations: { [Suit.Clubs]: [], [Suit.Diamonds]: [], [Suit.Hearts]: [], [Suit.Spades]: [] },
      tableaus: [],
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    };

    const nextState = moveCard(initialGameState, PileType.Waste, null, 0, PileType.Foundation, Suit.Clubs);

    expect(nextState).not.toBeNull();
    expect(nextState?.waste.length).toBe(0);
    expect(nextState?.foundations[Suit.Clubs].length).toBe(1);
    expect(nextState?.foundations[Suit.Clubs][0].rank).toBe(Rank.Ace);
  });

  it('should move a single card from a tableau to another tableau', () => {
    const initialGameState: GameState = {
      stock: [],
      waste: [],
      foundations: { [Suit.Clubs]: [], [Suit.Diamonds]: [], [Suit.Hearts]: [], [Suit.Spades]: [] },
      tableaus: [
        [{ id: 'H7', suit: Suit.Hearts, rank: Rank.Seven, color: CardColor.Red, isFaceUp: true }],
        [{ id: 'S8', suit: Suit.Spades, rank: Rank.Eight, color: CardColor.Black, isFaceUp: true }],
      ],
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    };

    const nextState = moveCard(initialGameState, PileType.Tableau, 0, 0, PileType.Tableau, 1);

    expect(nextState).not.toBeNull();
    expect(nextState?.tableaus[0].length).toBe(0);
    expect(nextState?.tableaus[1].length).toBe(2);
    expect(nextState?.tableaus[1][1].rank).toBe(Rank.Seven);
  });

  it('should move a stack of cards from a tableau to another tableau', () => {
    const initialGameState: GameState = {
      stock: [],
      waste: [],
      foundations: { [Suit.Clubs]: [], [Suit.Diamonds]: [], [Suit.Hearts]: [], [Suit.Spades]: [] },
      tableaus: [
        [
          { id: 'H7', suit: Suit.Hearts, rank: Rank.Seven, color: CardColor.Red, isFaceUp: true },
          { id: 'S6', suit: Suit.Spades, rank: Rank.Six, color: CardColor.Black, isFaceUp: true },
        ],
        [{ id: 'S8', suit: Suit.Spades, rank: Rank.Eight, color: CardColor.Black, isFaceUp: true }],
      ],
      score: 0,
      moves: 0,
      time: 0,
      isGameWon: false,
      isGameLost: false,
      lastMove: null,
    };

    const nextState = moveCard(initialGameState, PileType.Tableau, 0, 0, PileType.Tableau, 1);

    expect(nextState).not.toBeNull();
    expect(nextState?.tableaus[0].length).toBe(0);
    expect(nextState?.tableaus[1].length).toBe(3);
    expect(nextState?.tableaus[1][1].rank).toBe(Rank.Seven);
    expect(nextState?.tableaus[1][2].rank).toBe(Rank.Six);
  });
});
