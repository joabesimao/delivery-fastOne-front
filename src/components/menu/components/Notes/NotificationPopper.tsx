import {
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationCard from "./NotificationCard";
import { useInfiniteListNotifications } from "@/hooks/notification/useListNotifications";
import { useMarkAsRead } from "@/hooks/notification/useMarkAsRead";
import { useEffect, useRef, useCallback } from "react";
import { extractApiErrorMessage } from "@/helpers/extractApiErrorMessage";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { useNotificationCountSync } from "@/hooks/globalState/notification/useNotificationCount";
import { useToast } from "@/hooks/useToast";

interface NotificationPopperProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const NotificationPopper = ({
  open,
  anchorEl,
  onClose,
}: NotificationPopperProps) => {
  const toast = useToast();
  const user = useAuth((state) => state.user);
  const { refetch: refetchUnread } = useNotificationCountSync(user?.id);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch: refetchNotifications,
  } = useInfiniteListNotifications(
    {
      limit: 5,
      user_id: user?.id,
      // is_read: false, // added when filter corrected
    },
    {
      enabled: !!user?.id && open,
    },
  );
  const notifications = data?.pages.flatMap((page) => page.data) || [];

  const { mutateAsync: markAsRead } = useMarkAsRead();

  const onMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      await Promise.all([refetchUnread(), refetchNotifications()]);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Erro ao marcar notificação como lida.",
      );
      toast.error(errorMessage);
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isFetching],
  );

  useEffect(() => {
    if (!open || !notifications.length) return;

    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, open, notifications.length]);

  useEffect(() => {
    if (open && user?.id && !data) {
      refetchNotifications();
    }
  }, [open, user?.id, data, refetchNotifications]);

  return (
    <>
      <Popper
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-end" ? "right top" : "right bottom",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 400,
                maxWidth: "90vw",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                mt: 1,
                boxShadow: "-12px 12px 18px rgba(0,0,0,0.1)",
              }}
            >
              <ClickAwayListener onClickAway={onClose}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      pb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      fontFamily="'Kumbh Sans', sans-serif"
                    >
                      Notificações
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={onClose}
                      sx={{ width: "30px", height: "30px" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      overflowY: "auto",
                      maxHeight: "calc(80vh - 80px)",
                      p: 2,
                    }}
                  >
                    {!notifications ||
                    notifications.filter((n) => !n.is_read).length === 0 ? (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Nenhuma notificação para exibir.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {notifications
                          ?.filter((notification) => !notification.is_read)
                          ?.map((notification) => (
                            <NotificationCard
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={onMarkAsRead}
                            />
                          ))}

                        <div ref={observerTarget} style={{ height: "20px" }} />

                        {isFetchingNextPage && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              py: 2,
                            }}
                          >
                            <CircularProgress size={24} />
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default NotificationPopper;
