export interface Organization {
  o_id: number;
  name: string;
  description: string;
  num_apps: number;
  total_members: number;
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
  role: number;
  email: string;
}

export interface Device {
  name: string;
  devEUI: string;
}
