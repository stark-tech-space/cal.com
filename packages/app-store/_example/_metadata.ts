import type { App } from "@calcom/types/App";

import _package from "./package.json";

export const metadata = {
  name: _package.name,
  description: _package.description,
  installed: true,
  category: "video",
  // If using static next public folder, can then be referenced from the base URL (/).
  imageSrc: "/api/app-store/_example/icon.svg",
  logo: "/api/app-store/_example/icon.svg",
  publisher: "DBee Calendar",
  rating: 5,
  reviews: 69,
  slug: "example_video",
  title: "Example App",
  trending: true,
  type: "example_video",
  url: "https://calendar.dbeedata.com/",
  variant: "conferencing",
  verified: true,
  email: "help@calendar.dbeedata.com",
} as App;

export default metadata;
