export enum Suit {
  Clubs = "clubs",
  Diamonds = "diamonds",
  Hearts = "hearts",
  Spades = "spades",
}

export enum Rank {
  Ace = "A",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
}

export enum CardColor {
  Red = "red",
  Black = "black",
}

export interface Card {
  suit: Suit;
  rank: Rank;
  color: CardColor;
  isFaceUp: boolean;
  id: string; // Unique identifier for each card
}

export enum PileType {
  Stock = "stock",
  Waste = "waste",
  Foundation = "foundation", // There will be 4 foundations
  Tableau = "tableau", // There will be 7 tableau piles
}

export type CardBackTheme = {
  name: string;
  style: React.CSSProperties;
};

export interface Move {
  fromPileType: PileType;
  fromPileIndex: number | Suit | null;
  cardIndex: number;
  toPileType: PileType;
  toPileIndex: number | Suit | null;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Record<Suit, Card[]>; // Four piles, one for each suit
  tableaus: Card[][]; // Seven piles
  score: number;
  moves: number;
  time: number; // in seconds
  isGameWon: boolean;
  isGameLost: boolean;
  lastMove: Move | null; // To store information for undo functionality
  cardBackTheme: CardBackTheme; // Currently selected card back theme
  solutionPath: Move[] | null; // Stores the sequence of moves to solve the game
}

