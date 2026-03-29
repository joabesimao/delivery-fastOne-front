import { Box, Button, Stack, Typography, type BoxProps } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface PropsHeader {
  title: string;
  buttonText?: string;
  action?: () => void;
  directionTitle?: string;
  childrenActions?: React.ReactNode[];
  titleBoxProps?: BoxProps;
}

const Header = ({
  title,
  buttonText = "Voltar",
  action,
  directionTitle = "center",
  childrenActions,
  titleBoxProps,
}: PropsHeader) => {
  return (
    <Stack
      flexDirection={{ xs: "column-reverse", sm: "row" }}
      width="100%"
      alignItems="center"
      justifyContent={{ xs: "center", sm: "space-between" }}
      sx={{ padding: { xs: 1 }, sm: 2 }}
      gap={{ xs: 1, sm: 0 }}
    >
      <Box
        display="flex"
        justifyContent={directionTitle}
        alignItems="center"
        {...titleBoxProps}
      >
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          {title}
        </Typography>
      </Box>
      <Stack
        display="flex"
        flexDirection={{ xs: "column-reverse", sm: "row" }}
        alignItems="center"
        mt={{ xs: "5px", sm: 0 }}
        gap={{ xs: "10px", sm: 0 }}
        width={{ xs: "100%", sm: "auto" }}
      >
        {childrenActions?.map((child, idx) => (
          <span key={idx} style={{ paddingRight: "5px" }}>
            {child}
          </span>
        ))}
        {action && (
          <Button
            variant="contained"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 2,
              bgcolor: "#e42020",
              color: "#1389f0",
              "&:hover": {
                bgcolor: "#f01414",
              },
              width: { xs: "100%", sm: "auto" },
            }}
            onClick={action}
          >
            {buttonText}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default Header;
