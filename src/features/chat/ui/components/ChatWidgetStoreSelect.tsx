import { Badge, Box, MenuItem, Stack, TextField } from "@mui/material";
import type { ChatSession, UnreadByStore } from "../../domain/chatMessage";

interface ChatWidgetStoreSelectProps {
  session: ChatSession | null;
  value: string;
  unreadByStore: UnreadByStore;
  onChange: (unitId: string) => void;
}

const ChatWidgetStoreSelect = ({
  session,
  value,
  unreadByStore,
  onChange,
}: ChatWidgetStoreSelectProps) => (
  <Box
    sx={{
      px: 1.25,
      py: 0.9,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <TextField
      size="small"
      select
      fullWidth
      label="Loja"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={!session || session.units.length === 0}
    >
      {(session?.units ?? []).map((unit) => (
        <MenuItem key={unit.id} value={String(unit.id)}>
          <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
            <Box
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                pr: 1,
              }}
            >
              {unit.name} {unit.isMain ? "(Matriz)" : "(Filial)"}
            </Box>
            {(unreadByStore[unit.id] ?? 0) > 0 && (
              <Badge
                color="error"
                badgeContent={unreadByStore[unit.id]}
                sx={{ mr: 1 }}
              />
            )}
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  </Box>
);

export default ChatWidgetStoreSelect;
