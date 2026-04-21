import { Button, type ButtonProps } from "@mui/material";
import type React from "react";

interface ButtonRegisterProps extends ButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ButtonRegister: React.FC<ButtonRegisterProps> = ({
  onClick,
  children = "Cadastrar",
  ...props
}) => {
  return (
    <Button variant="contained" onClick={onClick} {...props}>
      {children}
    </Button>
  );
};
