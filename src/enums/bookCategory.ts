export enum BookCategory {
  CLASSIC_LITERATURE = "CLASSIC_LITERATURE",
  DYSTOPIA = "DYSTOPIA",
  FANTASY = "FANTASY",
  ROMANCE = "ROMANCE",
  SCIENCE_FICTION = "SCIENCE_FICTION",
  ADVENTURE = "ADVENTURE",
}

export const bookCategoryLabels: Record<BookCategory, string> = {
  [BookCategory.CLASSIC_LITERATURE]: "Clássico",
  [BookCategory.DYSTOPIA]: "Distopia",
  [BookCategory.FANTASY]: "Fantasia",
  [BookCategory.ROMANCE]: "Romance",
  [BookCategory.SCIENCE_FICTION]: "Ficção Científica",
  [BookCategory.ADVENTURE]: "Aventura",
};

export const bookCategoryOptions = Object.entries(bookCategoryLabels).map(
  ([id, name]) => ({ id, name }),
);
