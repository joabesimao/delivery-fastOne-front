import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import FormDialogActions from "@/shared/ui/dialogs/FormDialogActions";
import { useActionFeedback } from "@/shared/ui/feedback/useActionFeedback";
import type { User, UserInput } from "../../domain/user";
import { useCreateUser, useUpdateUser } from "../../application/userQueries";
import UserForm from "./UserForm";

interface UserFormDialogProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const UserFormDialog = ({
  open,
  user = null,
  onClose,
  onSaved,
}: UserFormDialogProps) => {
  const runWithFeedback = useActionFeedback();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const submitting = createUser.isPending || updateUser.isPending;

  const handleSubmit = async (input: UserInput) => {
    const saved = await runWithFeedback(
      () =>
        user
          ? updateUser.mutateAsync({ id: user.id, input })
          : createUser.mutateAsync(input),
      user
        ? {
            success: "Usuário atualizado com sucesso.",
            error: "Erro ao atualizar usuário. Tente novamente.",
          }
        : {
            success: "Usuário cadastrado com sucesso.",
            error: "Erro ao cadastrar usuário. Tente novamente.",
          },
    );
    if (saved) onSaved();
    return saved;
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
      <UserForm key={user?.id ?? "new"} user={user} onSubmit={handleSubmit}>
        {({ fields, submitting: formSubmitting }) => (
          <>
            <DialogContent dividers>{fields}</DialogContent>
            <FormDialogActions
              submitting={formSubmitting}
              onCancel={onClose}
              submitLabel={user ? "Salvar alterações" : "Cadastrar"}
            />
          </>
        )}
      </UserForm>
    </Dialog>
  );
};

export default UserFormDialog;
