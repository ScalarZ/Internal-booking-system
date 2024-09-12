import { XCircle } from "lucide-react";

export default function SelectedItems({
  items,
  removeItem,
}: {
  items: { id: string; name: string }[];
  removeItem?: (id: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2 p-2 text-white">
      {items?.map(({ id, name }) => (
        <li
          key={id}
          className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
        >
          {name}
          <XCircle
            size={18}
            className="cursor-pointer"
            onClick={() => removeItem?.(id)}
          />
        </li>
      ))}
    </ul>
  );
}
