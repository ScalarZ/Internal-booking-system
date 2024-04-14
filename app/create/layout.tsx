import Tabs from "./_components/tabs";

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative w-full p-4">
      <Tabs />
      <div>{children}</div>
    </div>
  );
}
