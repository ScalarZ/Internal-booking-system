"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { listItineraryCities } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import {
  SelectCities,
  SelectCompanies,
  SelectCountries,
  SelectHotels,
  SelectNationalities,
  SelectNileCruises,
  SelectBookingToursWithItineraries,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import { addBookings, updateBooking } from "@/utils/db-queries/booking";
import { getCitiesHotels } from "@/utils/db-queries/hotel";
import {
  updateFlightTickets,
  uploadFlightTickets,
  uploadPassports,
} from "@/utils/uploads";
import ItineraryModal from "../itinerary-modal";
import Reservations from "../reservations";
import BookingSection from "./booking-section";
import { formSchema } from "@/utils/zod-schema";
import { Reservation, Itinerary } from "@/types_";
import { ToursSection } from "./tours-section";
import AlertModal from "./alert";
import { useBooking } from "@/context/booking-context";
import ForPage from "../for-page";
import { flightDefaultValue } from "@/utils/default-values";
import HotelsSection from "./hotels-section";
import { usePathname } from "next/navigation";
import { FlightsSection } from "./flights-section";
import Canceled from "./canceled";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { SUPABASE_STORAGE_URL } from "@/app.confing";

export default function From({
  tours,
  companies,
  nileCruises,
  nationalities,
  modalMode,
}: {
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  modalMode: "edit" | "add";
}) {
  const pathname = usePathname();
  const { booking, closeModal } = useBooking();
  const { uploadFile } = useSupabaseStorage("tourists passport");
  const [name, setName] = useState("");
  const [internalBookingId, setInternalBookingId] = useState(
    booking?.internalBookingId ?? "",
  );
  // toggles
  const [isLoading, setIsLoading] = useState(false);
  const [isEditItineraryModalOpen, setIsEditItineraryModalOpen] =
    useState(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);

  // lists
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [passports, setPassports] = useState<Passport[]>(
    booking?.passports ?? [],
  );
  const [touristsNames, setTouristsNames] = useState<string[]>(
    booking?.tourists ?? [],
  );
  const [tourCountries, setTourCountries] = useState<SelectCountries[]>(
    booking?.bookingTour?.countries ?? [],
  );
  const [tourCities, setTourCities] = useState<SelectCities[]>([]);
  const [citiesHotels, setCitiesHotels] = useState<SelectHotels[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>(
    booking?.bookingTour?.itineraries ?? [],
  );
  const [domesticFlights, setDomesticFlights] = useState<
    (ArrivalDeparturePair<DomesticFlight> & { src?: string })[]
  >(booking?.domesticFlights ?? [flightDefaultValue]);
  const [internationalFlights, setInternationalFlights] = useState<
    (ArrivalDeparturePair<InternationalFlight> & { src?: string })[]
  >(
    booking?.internationalFlights ?? [
      {
        id: "v1rlr7m0fa",
        arrival: {
          arrivalDate: undefined,
          arrivalTime: undefined,
          destinations: undefined,
          flightNumber: undefined,
          referenceTicket: undefined,
        },
        departure: {
          departureDate: undefined,
          departureTime: undefined,
          destinations: undefined,
          flightNumber: undefined,
          referenceTicket: undefined,
        },
        files: [],
        urls: [],
      },
    ],
  );
  const [reservationsList, setReservationsList] = useState<Reservation[]>(
    booking?.reservations?.map(({ city, ...props }) => ({
      ...props,
      city: typeof city === "string" ? JSON.parse(city) : city,
    })) ?? [],
  );
  const [itineraryInitialValues, setItineraryInitialValues] =
    useState<Itinerary | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: booking?.bookingHotels.map(({ hotel }) => hotel) ?? [],
      pax: booking?.pax ?? undefined,
      internalBookingId: booking?.internalBookingId ?? undefined,
      arrivalDepartureDate:
        {
          from: booking?.arrivalDate ?? undefined,
          to: booking?.departureDate ?? undefined,
        } ?? undefined,
      company: booking?.company ?? undefined,
      currency: booking?.currency ?? undefined,
      internalFlights: booking?.internalFlights ?? undefined,
      internalFlightsNote: booking?.internalFlightsNote ?? undefined,
      generalNote: booking?.generalNote ?? undefined,
      singleRoom: booking?.single ?? undefined,
      doubleRoom: booking?.double ?? undefined,
      tripleRoom: booking?.triple ?? undefined,
      roomNote: booking?.roomNote ?? undefined,
      language: booking?.language ?? undefined,
      nationality: booking?.nationality ?? undefined,
      referenceBookingId: booking?.referenceBookingId ?? undefined,
      tips: booking?.tips ?? undefined,
      tour:
        {
          id: booking?.bookingTour?.id ?? undefined,
          name: booking?.bookingTour?.name ?? undefined,
        } ?? undefined,
      visa: booking?.visa ?? false,
      nileCruises: booking?.nileCruises ?? undefined,
      status: booking?.status ?? true,
      tipsIncluded: booking?.tipsIncluded ?? undefined,
      flightsGeneralNote: booking?.flightsGeneralNote ?? undefined,
      creditBalance: booking?.creditBalance ?? undefined,
      paid: booking?.paid ?? false,
      roomingList: {
        file: undefined,
        url: booking?.roomingList ?? undefined,
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const passportPaths = await uploadPassports({
        passports,
        internalBookingId,
      });
      const domesticFlightsTicketPaths =
        modalMode === "add"
          ? await uploadFlightTickets({
              tickets: domesticFlights,
              internalBookingId,
              bucket: "flight tickets",
            })
          : await updateFlightTickets({
              tickets: domesticFlights,
              internalBookingId,
              bucket: "flight tickets",
            });
      const internationalFlightTicketsPaths =
        modalMode === "add"
          ? await uploadFlightTickets({
              tickets: internationalFlights,
              internalBookingId,
              bucket: "international flights tickets",
            })
          : await updateFlightTickets({
              tickets: internationalFlights,
              internalBookingId,
              bucket: "international flights tickets",
            });

      let roomingListPath = values.roomingList?.url;
      const roomingListFile = values.roomingList?.file;
      if (roomingListFile) {
        const path = (
          await uploadFile(
            roomingListFile,
            `${internalBookingId}/${Date.now()}-${roomingListFile.name}`,
          )
        ).path;
        roomingListPath = `${SUPABASE_STORAGE_URL}/tourists%20passport/${path}`;
      }

      const bookingProps = {
        arrivalDate: values.arrivalDepartureDate.from ?? null,
        departureDate: values.arrivalDepartureDate.to ?? null,
        generalNote: values.generalNote ?? null,
        internalFlightsNote: values.internalFlightsNote ?? null,
        roomNote: values.roomNote ?? null,
        referenceBookingId: values.referenceBookingId ?? null,
        nileCruises: values.nileCruises ?? null,
        flightsGeneralNote: values.flightsGeneralNote ?? null,
        creditBalance: values.creditBalance ?? null,
        roomingList: roomingListPath ?? null,
        paid: values.paid,
        double: values.doubleRoom ?? 0,
        single: values.singleRoom ?? 0,
        triple: values.tripleRoom ?? 0,
        company: values.company,
        currency: values.currency,
        hotels: values.hotels,
        internalBookingId,
        internalFlights: values.internalFlights,
        language: values.language,
        nationality: values.nationality,
        pax: values.pax,
        tips: values.tips,
        tipsIncluded: values.tipsIncluded,
        tour: values.tour,
        status: values.status,
        visa: values.visa,
        tourists: touristsNames,
        itinerary: itineraries,
        countries: tourCountries?.map(({ name }) => `${name}`),
      };
      const bookingsLists = {
        reservationsList,
        passportPaths,
        domesticFlightsTicketPaths,
        internationalFlightTicketsPaths,
      };
      const bookingTour = {
        name: values.tour.name ?? null,
        countries: tourCountries,
        itineraries: itineraries.map((props, i) => ({
          ...props,
          day: format(
            addDays(values.arrivalDepartureDate.from ?? new Date(), i),
            "yyy-MM-dd",
          ),
          dayNumber: i + 1,
        })),
      };
      const hotels = values.hotels;
      if (modalMode === "add")
        await addBookings(
          {
            ...bookingProps,
            //Remove files from domestic flights
            domesticFlights: domesticFlights.map(
              ({ files, ...props }) => props,
            ),
            //Remove files from international flights
            internationalFlights: internationalFlights.map(
              ({ files, ...props }) => props,
            ),
            passports: [],
          },
          bookingTour,
          hotels,
          bookingsLists,
        );
      if (modalMode === "edit" && booking)
        await updateBooking(
          {
            id: booking.id,
            ...bookingProps,
            //Remove image file from domestic flights
            domesticFlights: domesticFlights.map(({ urls, ...props }) => ({
              ...props,
              urls: urls.map(({ image, ...props }) => props),
            })),
            //Remove image file from international flights
            internationalFlights: internationalFlights.map(
              ({ urls, ...props }) => ({
                ...props,
                urls: urls.map(({ image, ...props }) => props),
              }),
            ),
          },
          {
            ...bookingTour,
            id: booking.bookingTour.id,
          },
          hotels,
          bookingsLists,
        );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      closeModal();
      form.reset();
    }
  }

  const listCitiesHotels = useCallback(async (tourCities: SelectCities[]) => {
    try {
      const hotels = await getCitiesHotels(tourCities?.map(({ id }) => id));
      setCitiesHotels(hotels);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const generateReservations = useCallback(() => {
    let tacker = -1;
    let startDate = form.watch("arrivalDepartureDate.from")!;
    if (!startDate || !itineraries?.length) return;
    const reservations = itineraries.reduce<Reservation[]>(
      (acc, curr, i, arr) => {
        if (
          acc[tacker]?.city?.name ===
          curr?.cities?.[curr?.cities?.length - 1].name
        ) {
          acc[tacker].end =
            i !== arr.length - 1 ? addDays(startDate, 1) : startDate;
        } else {
          acc.push({
            bookingId: booking?.id ?? -1,
            start: startDate,
            end: addDays(startDate, 1),
            city: curr?.cities?.[curr?.cities?.length - 1] ?? null,
            hotels: [],
            currency: "USD",
            meal: null,
            targetPrice: null,
            finalPrice: null,
            single: null,
            double: null,
            triple: null,
            free: null,
            child: null,
            refund: null,
          });
          tacker++;
        }
        startDate = addDays(startDate, 1);
        return [...acc];
      },
      [],
    );
    setReservationsList(reservations);
  }, [form, booking?.id, itineraries]);

  useEffect(() => {
    if (!booking || !booking.bookingTour?.itineraries.length) return;
    listCitiesHotels(
      listItineraryCities(booking.bookingTour.itineraries ?? []),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BookingSection
          form={form}
          companies={companies}
          name={name}
          nationalities={nationalities}
          passports={passports}
          touristsNames={touristsNames}
          setName={setName}
          setPassports={setPassports}
          setInternalBookingId={setInternalBookingId}
          setTouristsNames={setTouristsNames}
        />
        <ForPage
          {...(pathname === "/bookings"
            ? { type: "single", page: "/bookings" }
            : { readonly: true })}
        >
          <ToursSection
            form={form}
            itineraries={itineraries}
            listCitiesHotels={listCitiesHotels}
            tourCountries={tourCountries}
            tours={tours}
            setIsEditItineraryModalOpen={setIsEditItineraryModalOpen}
            setIsItineraryModalOpen={setIsItineraryModalOpen}
            setItineraries={setItineraries}
            setItineraryInitialValues={setItineraryInitialValues}
            setTourCities={setTourCities}
            setTourCountries={setTourCountries}
          />
          <HotelsSection
            form={form}
            citiesHotels={citiesHotels}
            nileCruises={nileCruises}
          />
        </ForPage>
        <FlightsSection
          modalMode={modalMode}
          form={form}
          pathname={pathname}
          domesticFlights={domesticFlights}
          internationalFlights={internationalFlights}
          setDomesticFlights={setDomesticFlights}
          setInternationalFlights={setInternationalFlights}
        />
        <ForPage
          {...(["/bookings", "/reservations"].includes(pathname)
            ? { type: "multiple", page: ["/bookings", "/reservations"] }
            : { readonly: true })}
        >
          {!form?.watch("status") && <Canceled form={form} />}
          <section>
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold text-sky-900">Hotels</h2>
              <ForPage type="multiple" page={["/bookings", "/reservations"]}>
                <Button
                  variant="secondary"
                  disabled={
                    !itineraries?.length ||
                    !form.watch("arrivalDepartureDate.from")
                  }
                  onClick={
                    !reservationsList?.length
                      ? generateReservations
                      : () => setIsAlertModalOpen(true)
                  }
                  type="button"
                >
                  Generate reservations
                </Button>
              </ForPage>
            </div>
            {!!reservationsList?.length &&
              !!form.watch("arrivalDepartureDate")?.from && (
                <Reservations
                  reservationsList={reservationsList}
                  setReservationsList={setReservationsList}
                  tourCountries={tourCountries}
                />
              )}
          </section>
        </ForPage>

        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"} onClick={closeModal}>
            Cancel
          </Button>
          <ForPage
            type="multiple"
            page={["/bookings", "/reservations", "/aviations"]}
          >
            <Button type="submit" className="flex gap-x-1">
              {isLoading && <Loader size={14} className="animate-spin" />}
              Submit
            </Button>
          </ForPage>
        </DialogFooter>
      </form>
      {isEditItineraryModalOpen && !!itineraryInitialValues && (
        <ItineraryModal
          initialValues={itineraryInitialValues}
          isOpen={isEditItineraryModalOpen}
          selectedCountries={tourCountries}
          setIsOpen={setIsEditItineraryModalOpen}
          setInitialValues={setItineraryInitialValues}
          setItineraries={setItineraries}
        />
      )}
      {isItineraryModalOpen && (
        <ItineraryModal
          day={`Day ${itineraries?.length + 1}`}
          isOpen={isItineraryModalOpen}
          setIsOpen={setIsItineraryModalOpen}
          selectedCountries={tourCountries}
          setItineraries={setItineraries}
        />
      )}
      {isAlertModalOpen && (
        <AlertModal
          isOpen={isAlertModalOpen}
          setIsOpen={setIsAlertModalOpen}
          generateReservations={generateReservations}
        />
      )}
    </Form>
  );
}
