import { useMutation } from "@tanstack/react-query";
import type { BroadcastNoticePayload } from "../domain/notice";
import { notificationsRepository } from "../data/notificationsRepository";

export const useBroadcastNotice = () =>
  useMutation({
    mutationFn: (payload: BroadcastNoticePayload) =>
      notificationsRepository.broadcast(payload),
  });
