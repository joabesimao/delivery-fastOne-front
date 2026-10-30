import { Box, Button, CircularProgress, Divider } from "@mui/material";

interface FormActionsProps {
  submitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  resetLabel?: string;
}

const FormActions = ({
  submitting,
  submitLabel = "Cadastrar",
  submittingLabel = "Salvando...",
  resetLabel,
}: FormActionsProps) => (
  <>
    <Divider sx={{ mt: 2.5, mb: 2.5 }} />
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "stretch", sm: "flex-end" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.25,
      }}
    >
      {resetLabel && (
        <Button
          type="reset"
          variant="outlined"
          color="inherit"
          disabled={submitting}
          sx={{
            textTransform: "none",
            borderColor: "divider",
            color: "text.secondary",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {resetLabel}
        </Button>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        sx={{
          textTransform: "none",
          bgcolor: "#4361EE",
          "&:hover": { bgcolor: "#3451D1" },
          width: { xs: "100%", sm: "auto" },
        }}
        startIcon={
          submitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
      >
        {submitting ? submittingLabel : submitLabel}
      </Button>
    </Box>
  </>
);

export default FormActions;
