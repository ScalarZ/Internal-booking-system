import { Bookings, SelectBookingOptionalTours } from "@/drizzle/schema";
import { updateDoneStatus } from "@/utils/db-queries/tour";
import { File } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function OptionalTourInfo({
  booking,
}: {
  booking: Bookings & { optionalTour: SelectBookingOptionalTours };
}) {
  async function handleOnCheckedChange(checked: boolean) {
    await updateDoneStatus({
      id: booking.optionalTour.id,
      done: checked,
    });
  }
  return (
    booking.optionalTour && (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <Label>Done</Label>
          <Switch
            defaultChecked={booking.optionalTour.done}
            onCheckedChange={handleOnCheckedChange}
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <div>
            <span className="mr-2 text-sm font-medium">Representatives:</span>
            {booking.optionalTour.representatives?.map(({ name }, i, arr) => (
              <Badge key={i}>{name}</Badge>
            ))}
          </div>
          <p className="text-sm font-medium">
            PAX: <Badge>{booking.optionalTour.pax}</Badge>
          </p>
          <p className="text-sm font-medium">
            Currency: <Badge>{booking.optionalTour.currency}</Badge>
          </p>
          <p className="text-sm font-medium">
            Price: <Badge>{booking.optionalTour.price}</Badge>
          </p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-sm">
              <th className="border border-gray-200 px-4 py-2 text-left">
                Activity
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {booking.optionalTour.optionalActivities.map((item, index) => (
              <tr key={index} className="text-sm">
                <td className="border border-gray-200 px-4 py-2">
                  {item.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {format(item.date ?? new Date(), "PPP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <span className="text-sm font-medium">Files:</span>
          <ul className="flex flex-wrap gap-4">
            {booking.optionalTour.files?.map(({ url, name }) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <File size={28} strokeWidth={1.5} />
                  <p className="w-24   overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {name}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
}
