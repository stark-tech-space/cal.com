import timekitInstance from '../init';
import axios from 'axios';
import { QueryResourceResponse } from '../../../types/timekit/resource';
export default async function timekitResourceGet({
  resourceId,
}: {
  resourceId: string;
}): Promise<QueryResourceResponse | null> {
  try {
    const response = await timekitInstance.get(`resources/${resourceId}?include=tags`);

    return response.data.data as QueryResourceResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `get resource for resource ${resourceId} axios error`,
        error.response?.data || error,
      );
    } else {
      console.error(`get resource for resource ${resourceId} error`, error);
    }
    return null;
  }
}
