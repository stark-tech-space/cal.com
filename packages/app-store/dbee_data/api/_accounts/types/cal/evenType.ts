export type CalEventTypeCreateRequest = {
  title: string,
  slug: string,
  metadata: eventypeMetadata,
  eventName: string,
  length: number // 时长
};

type eventypeMetadata = {
  treatmentId: string // treatment id
}

export type CreateEventTypeResponse = {
  id: number,
  title: string,
  slug: string,
  hidden: boolean,
  userId: number,
  eventName: string | null,
  timeZone: string | null,
  metadata: eventypeMetadata,
  length: number, // 时长
  exist?: boolean, // 用来控制是否要删除
}
