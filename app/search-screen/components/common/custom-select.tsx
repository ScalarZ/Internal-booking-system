import CostumePopover from "./custom-popover";
import SelectedItems from "./select-items";

export default function CustomSelect({
  disabled = false,
  title,
  children,
  items,
  icon,
  removeItem,
  triggerWrapper,
}: {
  disabled: boolean;
  title: string | string[] | React.ReactNode;
  children: React.ReactNode;
  items?: { id: string; name: string }[];
  icon?: React.ReactNode;
  removeItem?: (id: string) => void;
  triggerWrapper?: React.ElementType;
}) {
  return (
    <>
      <CostumePopover
        disabled={disabled}
        title={title}
        icon={icon}
        triggerWrapper={triggerWrapper}
      >
        {children}
      </CostumePopover>
      {!!items?.length && (
        <SelectedItems items={items} removeItem={removeItem} />
      )}
    </>
  );
}
