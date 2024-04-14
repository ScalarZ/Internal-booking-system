type BookingFilters = {
  id?: string | null;
  country?: string | null;
  arrivalDate?: {
    from?: Date;
    to?: Date;
  } | null;
  departureDate?: {
    from?: Date;
    to?: Date;
  } | null;
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
  day: string;
  cities: SelectCities[];
  activities: SelectActivities[];
};
