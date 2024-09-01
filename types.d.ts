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
type Passport = {
  url?: string;
  name?: string;
  image?: ImageType;
};

type InternationalFlight = {
  flightNumber?: string;
  destinations?: string;
  referenceTicket?: string;
};
type DomesticFlight = {
  issued: boolean;
  included: boolean;
  from?: string;
  to?: string;
  flightNumber?: string;
};

type Ticket = { url?: string; name?: string; image?: ImageType };

type ArrivalDeparturePair<T> = {
  id: string;
  arrival: { arrivalDate?: Date; arrivalTime?: Date } & T;
  departure: { departureDate?: Date; departureTime?: Date } & T;
  files?: { image?: ImageType; name?: string; url?: string }[];
  urls: Ticket[];
};
