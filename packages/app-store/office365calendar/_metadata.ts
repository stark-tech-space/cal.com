import type { App } from "@calcom/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Office 365 / Outlook.com Calendar",
  description: _package.description,
  type: "office365_calendar",
  title: "Office 365 / Outlook.com Calendar",
  imageSrc: "/api/app-store/office365calendar/icon.svg",
  variant: "calendar",
  category: "calendar",
  logo: "/api/app-store/office365calendar/icon.svg",
  publisher: "DBee Calendar",
  rating: 5,
  reviews: 69,
  slug: "office365-calendar",
  trending: false,
  url: "https://calendar.dbeedata.com/",
  verified: true,
  email: "help@calendar.dbeedata.com",
} as App;

export default metadata;
