import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "#app/styles/app.css?url";
import { Button } from "./components/ui/button";
import { GeneralErrorBoundary } from "./components/error-boundary";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Recret Mixages" },
    { name: "description", content: "Secret your messages!" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex h-full min-h-screen flex-col">
          <header className="flex justify-center py-4 sm:py-8">
            <Button className="text-3xl sm:text-5xl" variant="link" asChild>
              <Link to={"/"}>Recret Mixages</Link>
            </Button>
          </header>

          <main className="flex-1">{children}</main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
