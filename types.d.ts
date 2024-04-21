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
