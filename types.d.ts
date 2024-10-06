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
  from?: string;
  to?: string;
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
type DepartureInfo = {
  id?: string;
  departureDate?: string;
  departureTime?: string;
  representative?: string;
  bus?: string;
  driver?: string;
  note?: string;
};
type ArrivalInfo = {
  id?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  representative?: string;
  bus?: string;
  driver?: string;
  note?: string;
};

type ArrivalDeparturePair<T> = {
  id: string;
  arrival: { arrivalDate?: string; arrivalTime?: string } & T;
  departure: DepartureInfo & T;
  files?: { image?: ImageType; name?: string; url?: string }[];
  urls: Ticket[];
} & (T extends DomesticFlight
  ? { fairEGP?: number; bookingReference?: string; issuedDate?: string }
  : {});

interface UploadedFile {
  id: string;
  file: File;
}

interface Filters {
  id?: string;
  country?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

type InternationalFlights = ArrivalDeparturePair<InternationalFlight>;
type DomesticFlights = ArrivalDeparturePair<DomesticFlight>;

interface DateRange {
  from: string;
  to: string;
}

interface FilterParam {
  name: string | null;
  dateRange: DateRange | null;
}

interface FilterParams {
  country: string;
  city: FilterParam;
  activity: FilterParam;
  guide: FilterParam;
}
