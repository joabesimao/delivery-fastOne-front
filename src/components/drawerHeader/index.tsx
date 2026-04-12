import { styled } from "@mui/material/styles";

const DrawerHeader = styled("div")(({ theme }) => ({
  height: "75px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
export default DrawerHeader;
