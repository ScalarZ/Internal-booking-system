type BookingFilters = {
  id?: string;
  country?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
};

type SelectCitiesWithCountries = SelectCities & {
  country: SelectCountries | null;
};

type SelectGuidesWithCountries = SelectGuides & {
  country: SelectCountries | null;
};

type SelectActivitiesWithCitiesAndCountries = SelectActivities & {
  country: SelectCountries | null;
  city: SelectCities | null;
};

type SelectHotelsWithCitiesAndCountries = SelectHotels & {
  country: SelectCountries | null;
  city: SelectCities | null;
};

type SelectCitiesWithCountries = SelectCities & {
  country: SelectCountries | null;
};

type Itinerary = {
  id: string;
  day: string;
  cities: SelectCities[];
  activities: SelectActivities[];
};

type InternationalFlight = {
  flightNumber?: string;
  destinations?: string;
  referenceTicket?: string;
};
type DomesticFlight = {
  issued: boolean;
  from?: string;
  to?: string;
  flightNumber?: string;
};

type ArrivalDeparturePair<T> = {
  id: string;
  arrival: { arrivalDate?: Date; arrivalTime?: Date } & T;
  departure: { departureDate?: Date; departureTime?: Date } & T;
  file?: File;
  url?: string;
};
