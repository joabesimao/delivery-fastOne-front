import { useCallback } from "react";
import { extractApiErrorMessage } from "@/shared/lib/errors/extractApiErrorMessage";
import { useToast } from "./useToast";

interface FeedbackMessages {
  success: string;
  error: string;
  showApiError?: boolean;
}

export const useActionFeedback = () => {
  const toast = useToast();

  return useCallback(
    async (
      action: () => Promise<unknown>,
      { success, error, showApiError = true }: FeedbackMessages,
    ): Promise<boolean> => {
      try {
        await action();
        toast.success(success);
        return true;
      } catch (caught) {
        toast.error(
          showApiError ? extractApiErrorMessage(caught, error) : error,
        );
        return false;
      }
    },
    [toast],
  );
};
