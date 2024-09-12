import { createClient } from "./supabase/client";

const supabase = createClient();

export async function uploadPassports({
  passports,
  internalBookingId,
}: {
  passports: Passport[];
  internalBookingId: string;
}) {
  const date = Date.now();
  const res = await Promise.all(
    passports.map(({ image }) =>
      image?.file
        ? supabase.storage
            .from("tourists passport")
            .upload(
              `${internalBookingId}/${date}-${image.file?.name}`,
              image.file,
            )
        : undefined,
    ),
  );
  const paths = res.map((res, i) =>
    res
      ? {
          url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/tourists%20passport/${res.data?.path}`,
          name: `${date}-${passports[i]?.image?.file?.name}`,
        }
      : {
          url: passports[i]?.url ?? "",
          name: passports[i]?.name ?? "",
        },
  );
  return paths;
}

export async function uploadFlightTickets<T>({
  tickets,
  internalBookingId,
  bucket = "flight tickets",
}: {
  tickets: ArrivalDeparturePair<T>[];
  internalBookingId: string;
  bucket: "flight tickets" | "international flights tickets";
}) {
  const date = Date.now();
  const res = await Promise.all(
    tickets
      .map(({ files }) =>
        files
          ? files.map(({ image }) =>
              supabase.storage
                .from(bucket)
                .upload(
                  `${internalBookingId}/${date}-${image.file?.name}`,
                  image.file,
                ),
            )
          : [],
      )
      .flat(),
  );

  let index = 0;
  const flightsTickets: Ticket[][] = [];
  for (const row of tickets) {
    const rowLength = row.files?.length ?? 0;
    flightsTickets.push(
      res.slice(index, index + rowLength).map(({ data }, i) => ({
        url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/${bucket.replaceAll(" ", "%20")}/${data?.path}`,
        name: row.files?.[i]?.name,
      })),
    );
    index += rowLength;
  }

  return flightsTickets;
}

export async function updateFlightTickets<T>({
  tickets,
  internalBookingId,
  bucket = "flight tickets",
}: {
  tickets: ArrivalDeparturePair<T>[];
  internalBookingId: string;
  bucket: "flight tickets" | "international flights tickets";
}) {
  const date = Date.now();
  const updatedTickets = tickets.map(({ urls }) => urls).flat();

  const res2 = await Promise.all(
    updatedTickets.map((file) =>
      file.image
        ? supabase.storage
            .from(bucket)
            .upload(
              `${internalBookingId}/${date}-${file.image?.name}`,
              file.image,
            )
        : undefined,
    ),
  );
  const flightsTickets: Ticket[][] = [];
  let index = 0;
  for (const row of tickets) {
    const rowLength = row.urls?.length ?? 0;
    flightsTickets.push(
      res2.slice(index, index + rowLength).map((res, i) =>
        res
          ? {
              url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/${bucket.replaceAll(" ", "%20")}/${res.data?.path}`,
              name: row.urls?.[i]?.name,
            }
          : row.urls[i],
      ),
    );
    index += rowLength;
  }
  return flightsTickets;
}
