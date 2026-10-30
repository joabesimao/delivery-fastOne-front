import { Button, Grid, IconButton, Stack } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { FieldArray } from "formik";
import FormTextField from "@/shared/ui/form/FormTextField";
import type { ProductFormValues } from "../../domain/product";

interface ProductVariationsFieldProps {
  variations: ProductFormValues["variations"];
}

const ProductVariationsField = ({
  variations,
}: ProductVariationsFieldProps) => (
  <FieldArray name="variations">
    {({ push, remove }) => (
      <Stack spacing={1.5} sx={{ mb: 1 }}>
        {variations.map((_, index) => (
          <Grid container spacing={1.5} key={index} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormTextField
                name={`variations.${index}.attribute`}
                placeholder="Atributo (Ex: Tamanho)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormTextField
                name={`variations.${index}.value`}
                placeholder="Valor (Ex: M)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => remove(index)}
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => push({ attribute: "", value: "" })}
          sx={{ alignSelf: "flex-start" }}
        >
          Adicionar variação
        </Button>
      </Stack>
    )}
  </FieldArray>
);

export default ProductVariationsField;
