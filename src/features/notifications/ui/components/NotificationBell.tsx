import { useState } from "react";
import {
  Badge,
  ClickAwayListener,
  IconButton,
  Popper,
  Tooltip,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useToast } from "@/shared/ui/feedback/useToast";
import { noticeSentFeedback } from "../../domain/notice";
import type { AppNotification } from "../../domain/notification";
import { useNotifications } from "../../application/useNotifications";
import NotificationsPanel from "./NotificationsPanel";
import SendNoticeDialog from "./SendNoticeDialog";

const NotificationBell = ({ canSendNotice }: { canSendNotice: boolean }) => {
  const { unreadCount, reload, openNotification } = useNotifications();
  const toast = useToast();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const handleOpen = (notification: AppNotification) => {
    close();
    openNotification(notification);
  };

  const handleSent = (recipients: number) => {
    setNoticeOpen(false);
    const { message, severity } = noticeSentFeedback(recipients);
    toast.show(message, severity);
  };

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          aria-label={
            unreadCount
              ? `Notificações, ${unreadCount} não lidas`
              : "Notificações"
          }
          onClick={(event) => {
            if (open) {
              close();
              return;
            }
            setAnchorEl(event.currentTarget);
            void reload();
          }}
        >
          <Badge color="error" badgeContent={unreadCount} max={99}>
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}
      >
        <ClickAwayListener onClickAway={close}>
          <div>
            <NotificationsPanel
              canSendNotice={canSendNotice}
              onOpen={handleOpen}
              onSendNotice={() => {
                close();
                setNoticeOpen(true);
              }}
            />
          </div>
        </ClickAwayListener>
      </Popper>

      {canSendNotice && (
        <SendNoticeDialog
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          onSent={handleSent}
        />
      )}
    </>
  );
};

export default NotificationBell;
