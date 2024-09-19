import { BookingPageLayout } from "../bookings/_components/booking-page-layout";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return <BookingPageLayout searchParams={searchParams} />;
}
