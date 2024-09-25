import { isValid, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function useFilterParams() {
  const searchParams = useSearchParams();
  const getParam = (key: string) => searchParams.get(key);
  const parseDateRange = (dateRange: string | null): DateRange | null => {
    if (!dateRange) return null;
    const [from, to] = dateRange.split("|");
    return isValid(parseISO(from)) && isValid(parseISO(to))
      ? { from, to }
      : null;
  };

  return {
    country: getParam("country") || "Egypt",
    city: {
      name: getParam("city"),
      dateRange: parseDateRange(getParam("cityDateRange")),
    },
    activity: {
      name: getParam("activity"),
      dateRange: parseDateRange(getParam("activityDateRange")),
    },
    guide: {
      name: getParam("guide"),
      dateRange: parseDateRange(getParam("guideDateRange")),
    },
  };
}
