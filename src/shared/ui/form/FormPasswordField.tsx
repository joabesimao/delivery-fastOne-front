import { useState } from "react";
import FormTextField, { type FormTextFieldProps } from "./FormTextField";
import PasswordVisibilityToggle from "./PasswordVisibilityToggle";

type FormPasswordFieldProps = Omit<FormTextFieldProps, "type" | "slotProps">;

const FormPasswordField = (props: FormPasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <FormTextField
      autoComplete="new-password"
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <PasswordVisibilityToggle
              visible={visible}
              onToggle={() => setVisible((current) => !current)}
            />
          ),
        },
      }}
    />
  );
};

export default FormPasswordField;
