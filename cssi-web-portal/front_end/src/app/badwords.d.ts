declare module 'bad-words' {
  class Filter {
    constructor(options?: any);
    isProfane(string: string): boolean;
    clean(string: string): string;
    removeWords(word: string): void;
  }
  export = Filter;
}

//Made the module so that we can adapt the javascript library bad-words to typescript.
