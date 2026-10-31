import type { ReactNode } from "react";
import { Checkbox, FormControlLabel, Stack } from "@mui/material";
import { Form, Formik } from "formik";
import FormPasswordField from "@/shared/ui/form/FormPasswordField";
import FormSelectField from "@/shared/ui/form/FormSelectField";
import FormTextField from "@/shared/ui/form/FormTextField";
import {
  ROLE_OPTIONS,
  toUserFormValues,
  toUserInput,
  validateUserForm,
  type User,
  type UserInput,
} from "../../domain/user";

interface UserFormProps {
  user?: User | null;
  onSubmit: (input: UserInput) => Promise<boolean>;
  children: (form: { fields: ReactNode; submitting: boolean }) => ReactNode;
}

const UserForm = ({ user = null, onSubmit, children }: UserFormProps) => (
  <Formik
    initialValues={toUserFormValues(user)}
    validate={validateUserForm}
    onSubmit={async (values) => {
      await onSubmit(toUserInput(values));
    }}
  >
    {({ values, isSubmitting, setFieldValue }) => (
      <Form noValidate>
        {children({
          submitting: isSubmitting,
          fields: (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <div>
                <FormTextField name="name" label="Nome" />
              </div>
              <div>
                <FormTextField name="email" label="E-mail" type="email" />
              </div>
              <div>
                <FormSelectField
                  name="role"
                  label="Papel"
                  options={ROLE_OPTIONS}
                />
              </div>

              {user && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.resetPassword}
                      onChange={(event) =>
                        void setFieldValue(
                          "resetPassword",
                          event.target.checked,
                        )
                      }
                    />
                  }
                  label="Redefinir senha"
                />
              )}

              {values.resetPassword && (
                <>
                  <div>
                    <FormPasswordField name="password" label="Senha" />
                  </div>
                  <div>
                    <FormPasswordField
                      name="passwordConfirmation"
                      label="Confirmar senha"
                    />
                  </div>
                </>
              )}
            </Stack>
          ),
        })}
      </Form>
    )}
  </Formik>
);

export default UserForm;
