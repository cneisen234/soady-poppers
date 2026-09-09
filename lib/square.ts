// Square API client — single source of truth for talking to Square.
//
// This module is server-only. Never import it into a Client Component; the
// access token must not reach the browser.

import { SquareClient, SquareEnvironment } from "square";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.example to .env.local and fill in your Square Sandbox values.`,
    );
  }
  return value;
}

/** "sandbox" (default, while building) or "production" (at launch). */
export const squareEnv = (process.env.SQUARE_ENV ?? "sandbox").toLowerCase();

const environment =
  squareEnv === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

/** The seller location every order/catalog call is scoped to. */
export function locationId(): string {
  return required("SQUARE_LOCATION_ID");
}

/** Lazily-constructed shared client (reads the token on first use). */
let client: SquareClient | null = null;

export function square(): SquareClient {
  if (!client) {
    client = new SquareClient({
      token: required("SQUARE_ACCESS_TOKEN"),
      environment,
    });
  }
  return client;
}
