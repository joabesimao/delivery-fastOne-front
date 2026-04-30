import { useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Checkbox,
  Box,
  Collapse,
  styled,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Notification } from "@/hooks/notification/useListNotifications";
import { ModuleEnumType, moduleTypeLabels } from "@/enums/moduleEnum";
interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

interface ExpandMoreProps {
  expand: boolean;
}

const ExpandMore = styled(
  (
    props: ExpandMoreProps & { onClick: () => void; children: React.ReactNode }
  ) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  }
)(({ theme, expand }) => ({
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
}));

const NotificationCard = ({
  notification,
  onMarkAsRead,
}: NotificationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(notification.is_read);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCheckChange = () => {
    if (!notification.is_read) {
      setIsChecked(true);
      
      setTimeout(() => {
        onMarkAsRead(notification.id);
      }, 300);
    }
  };

  return (
    <Card
      sx={{
        mb: "15px",
        backgroundColor: isChecked
          ? "action.hover"
          : "background.paper",
        opacity: isChecked ? 0.7 : 1,
         boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent sx={{ p: 0, m: 0, "&:last-child": { pb: 0 } }}>
        <Stack p="5px">
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <Box sx={{ pl: "5px", flex: 1 }}>
              <Typography variant="subtitle1" component="div" fontWeight="bold">
                {notification.title}
              </Typography>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography variant="body2" color="text.secondary">
                  Módulo:{" "}
                  {moduleTypeLabels[notification.module as ModuleEnumType] ||
                    notification.module}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {new Date(notification.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Checkbox
                checked={isChecked}
                onChange={handleCheckChange}
                size="small"
              />
              <ExpandMore
                expand={expanded}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="mostrar mais"
                sx={{
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </Box>
          </Box>
        </Stack>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ mt: "3px" }}>
          <Typography variant="body2" color="text.secondary">
            {notification?.message}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default NotificationCard;