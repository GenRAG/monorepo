import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const isFetchBaseQueryErrorType = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export const useGetErrorMessageRequest = (error: unknown): { errorMessage: string } => {
    if (error && isFetchBaseQueryErrorType(error)) {
      const errorMessage =
        typeof error.data === "object" && error.data !== null && "error" in error.data && "message" in (error.data as any).error
          ? (error.data as any).error.message
          : "An unknown error occurred";

      return { errorMessage };
    }

    return { errorMessage: "An unknown error occurred" };
};
