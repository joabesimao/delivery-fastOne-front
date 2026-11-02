import { Chip, MenuItem, Stack, TextField } from "@mui/material";
import { useField } from "formik";
import { ROLE_OPTIONS, type UserRole } from "@/features/users";
import { roleLabel } from "../../domain/notice";

const NoticeRolesField = ({ name }: { name: string }) => {
  const [field, , helpers] = useField<UserRole[]>(name);

  return (
    <TextField
      select
      name={name}
      label="Perfis"
      value={field.value}
      onChange={(event) => {
        const value = event.target.value as unknown as UserRole[] | string;
        void helpers.setValue(
          typeof value === "string" ? (value.split(",") as UserRole[]) : value,
        );
      }}
      helperText="Vazio = todos os perfis"
      slotProps={{
        select: {
          multiple: true,
          renderValue: (selected) => (
            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
              {(selected as UserRole[]).map((role) => (
                <Chip key={role} label={roleLabel(role)} size="small" />
              ))}
            </Stack>
          ),
        },
      }}
      fullWidth
    >
      {ROLE_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default NoticeRolesField;
