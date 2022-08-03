import type { App } from "@calcom/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Microsoft Exchange 2013 Calendar",
  description: _package.description,
  installed: true,
  type: "exchange2013_calendar",
  title: "Microsoft Exchange 2013 Calendar",
  imageSrc: "/api/app-store/exchange2013calendar/icon.svg",
  variant: "calendar",
  category: "calendar",
  label: "Exchange Calendar",
  logo: "/api/app-store/exchange2013calendar/icon.svg",
  publisher: "DBee Calendar",
  rating: 5,
  reviews: 69,
  slug: "exchange2013-calendar",
  trending: false,
  url: "https://calendar.dbeedata.com/",
  verified: true,
  email: "help@calendar.dbeedata.com",
} as App;

export default metadata;
