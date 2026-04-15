import ClientProformaView from "./ClientProformaView";

export default async function ClientProformaPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.orderId ?? "";

  return <ClientProformaView orderId={orderId} />;
}