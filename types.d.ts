type BookingFilters = {
  id?: number;
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

type Reservation = {
  start?: Date;
  end?: Date;
  city?: { id: string; name: string | null; countryId: string | null };
  hotels: string[];
  meal?: string;
  price?: number;
};

type InternationalFlight = {
  flightNumber?: number;
  arrivalDate?: Date;
  departureDate?: Date;
  destinations?: string;
};

type DomesticFlight = InternationalFlight & {
  id: string;
  included: boolean;
  note?: string;
};
