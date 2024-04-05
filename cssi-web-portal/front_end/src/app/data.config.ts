export interface Organization {
  o_id: string;
  name: string;
  description: string;
}

// an interface for describing json data in request
export interface App {
  name: string;
  id: number;
  description: string;
}

export interface Member {
  name: string;
  id: number;
}
