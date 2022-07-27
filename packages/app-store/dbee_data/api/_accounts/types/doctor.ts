import { WeekDay, Gender } from './common';

export enum AvailabilityType {
  OPD = 'OPD', // 門診
  TREATMENT = 'TREATMENT', // 療程
}

export type Treatment = {
  id: string; // 療程id
  name: string;
  maxSeats: number; // 人數上限
  isPublic: boolean; // 向客戶顯示
  duration: number; // 療程時長
  eventTypeId?: number
};

export type Availability = {
  type: AvailabilityType; // 門診/療程
  start: number; // start time, minutes from 00:00
  end: number; // end time, minutes from 00:00
  treatments: Array<Treatment>; // 時段內的療程
};

export type Doctor = {
  name: string;
  introduction: string;
  gender: Gender;
  image: string;
  phoneNumber: string;
  email: string;
  division: string; // 科別
  availabilities: Record<WeekDay, Array<Availability>>; // 每週服務時間
  extraAvailabilities: Record<string, Array<Availability>>; // 特別服務時間 yyyy-MM-dd as key, empty array as 全日休息(take a leave)
  bookingStartMinsModulus: number; // 5 -> display 5, 10, 15, 20, 25..., 10 -> display 10, 20, 30, 40...
  tags: Array<string>; // 服務內容標籤
  calUserId?: number;
  calApiKey?: string;
  timekitResourceId: string;
  doctorId: string
};
