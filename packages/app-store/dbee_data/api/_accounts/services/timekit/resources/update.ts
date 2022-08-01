import timekitInstance from '../init';

import { UpdateResourceRequest, AvailabilityConstraints } from '../../../types/timekit/resource';
import axios from 'axios';

export default async function timekitResourceUpdate({
  resourceId,
  image = '',
  availabilityConstraints = [],
}: {
  resourceId: string;
  image?: string;
  availabilityConstraints?: Array<AvailabilityConstraints>;
}): Promise<void> {
  try {
    await timekitInstance.put(`resources/${resourceId}`, {
      image,
      availability_constraints: availabilityConstraints,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `update resource for resource ${resourceId} axios error`,
        error.response?.data || error,
      );
    } else {
      console.error(`update resource for resource ${resourceId} error`, error);
    }
  }
}
