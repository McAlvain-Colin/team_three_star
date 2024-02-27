export interface DataLayout {
  heroesUrl: string;
  textFile: string;
  date: any;
}

export interface SentData {
  heroName: string;
  textFile: string;
}

// Specifies the list of information and the format that it should be in, the brackets around the variable indicate it'll be able to have infinite amount of its type in its parameters
export interface HomeValues {
  name: string;
  description: string;
  link: string;
}
