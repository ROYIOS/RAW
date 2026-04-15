import OrderSuccessView from "./OrderSuccessView";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params?.orderId ?? "";

  return <OrderSuccessView orderId={orderId} />;
}