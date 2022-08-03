import type { App } from "@calcom/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Apple Calendar",
  description: _package.description,
  installed: true,
  type: "apple_calendar",
  title: "Apple Calendar",
  imageSrc: "/api/app-store/applecalendar/icon.svg",
  variant: "calendar",
  category: "calendar",
  logo: "/api/app-store/applecalendar/icon.svg",
  publisher: "DBee Calendar",
  rating: 5,
  reviews: 69,
  slug: "apple-calendar",
  trending: false,
  url: "https://calendar.dbeedata.com/",
  verified: true,
  email: "help@calendar.dbeedata.com",
} as App;

export default metadata;
