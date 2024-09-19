import { BookingPageLayout } from "./_components/booking-page-layout";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return <BookingPageLayout searchParams={searchParams} />;
}
