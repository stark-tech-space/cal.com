import timekitInstance from '../init';
import axios from 'axios';

export default async function timekitResourceDelete({
  resourceId,
}: {
  resourceId: string;
}): Promise<void> {
  try {
    await timekitInstance.delete(`resources/${resourceId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `delete resource for resource ${resourceId} axios error`,
        error.response?.data || error,
      );
    } else {
      console.error(`delete resource for resource ${resourceId} error`, error);
    }
  }
}
