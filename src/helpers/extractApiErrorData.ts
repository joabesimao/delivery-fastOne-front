import axios from "axios";

export function extractApiErrorData(error: unknown): any {
  let responseData: any = null;

  if (axios.isAxiosError(error)) {
    responseData = error.response?.data;
  } else if (typeof error === "object" && error !== null) {
    responseData = (error as any).response?.data || error;
  }

  return responseData;
}
