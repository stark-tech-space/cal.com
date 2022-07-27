
export type CreateUserRequest = {
  name: string;
  timeZone: string;
  email: string; // can't create another resource with same email
  tags?: Array<string>; // alphanumeric lowercase characters and normal dashes
};

export type Metadata = {
  tag: string
}

export type User = {
  id: number,
  name: string,
  email: string,
  timeZone: string,
  metadata: Metadata,
};

export type CreateUserResponse = {
  user: User,
  apiKey: string
};