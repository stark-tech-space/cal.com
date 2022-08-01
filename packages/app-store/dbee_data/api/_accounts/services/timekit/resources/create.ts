import timekitInstance from '../init';
import axios from 'axios';

import {
  CreateResourceRequest,
  AvailabilityConstraints,
  CreateResourceResponse,
} from '../../../types/timekit/resource';

const TIMEZONE = 'Asia/Taipei';

export default async function timekitResourceCreate({
  accountId,
  doctorId,
  name,
  email = '',
  image = '',
  availabilityConstraints = [],
}: {
  accountId: string;
  doctorId: string;
  name: string;
  email?: string;
  image?: string;
  availabilityConstraints?: Array<AvailabilityConstraints>;
}): Promise<CreateResourceResponse | null> {
  try {
    const response = await timekitInstance.post('resources', {
      name,
      email,
      timezone: TIMEZONE,
      image,
      tags: [`account-${accountId}`.toLowerCase(), `doctor-${accountId}-${doctorId}`.toLowerCase()], // help search resources
      availability_constraints: availabilityConstraints,
    } as CreateResourceRequest);

    return response.data.data as CreateResourceResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `create resource for account ${accountId}:${name} axios error`,
        error.response?.data || error,
      );
    } else {
      console.error(`create resource for account ${accountId}:${name} error`, error);
    }
    return null;
  }
}
