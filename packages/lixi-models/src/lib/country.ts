export interface Country {
  id: number;
  name: string;
}

export interface State {
  id: number;
  name: string;
  countryId: number;
}
