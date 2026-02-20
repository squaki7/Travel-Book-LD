
export interface MainHeader {
  title?: string;
  subtitle?: string;
  agency?: string;
  nationality?: string;
  agency_contact?: string;
  contact?: string; // alias
  [key: string]: string | undefined;
}

export interface Passenger {
  name?: string;
  nationality?: string;
  passport?: string;
  date_of_birth?: string;
  room?: string;
  [key: string]: string | undefined;
}

export interface DayItem {
  time: string;
  text: string;
}

export interface RouteMap {
  origin: string;
  destination: string;
}

export interface Day {
  number: number;
  title: string;
  date: string;
  items: DayItem[];
  accommodation?: string;
  includes?: string;
  meals?: string;
  flight?: string;
  maps?: RouteMap[];
}

export interface HotelStay {
  checkIn?: string;
  checkOut?: string;
  nights?: string;
}

export interface Hotel {
  name?: string;
  stars?: string;
  address?: string;
  phone?: string;
  email?: string;
  reservation_number?: string;
  room_type?: string;
  services?: string;
  stays: HotelStay[];
}

export interface PortalLink {
  country: string;
  url: string;
}

export interface ItineraryModel {
  mainHeader: MainHeader;
  passengers: Passenger[];
  overview: string;
  days: Day[];
  hotels: Hotel[];
  practicalInfo: string[];
  emergency: string[];
  portalLinks?: PortalLink[];
}

export interface ItinerarySections {
  [key: string]: string[];
}
