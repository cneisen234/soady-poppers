import type { Metadata } from "next";
import { squareEnv } from "@/lib/square";
import { CartProvider } from "@/components/order/CartProvider";
import CheckoutForm from "@/components/order/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Soady Poppers",
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  // App id + location id are public identifiers used by the Web Payments SDK on
  // the client (not secrets). Passed as props so we don't need NEXT_PUBLIC vars.
  const appId = process.env.SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.SQUARE_LOCATION_ID ?? "";

  return (
    <CartProvider>
      <CheckoutForm appId={appId} locationId={locationId} squareEnv={squareEnv} />
    </CartProvider>
  );
}
