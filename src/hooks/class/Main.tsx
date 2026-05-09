import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Stack,
  Typography,
  Divider,
  Grid,
  Box,
  Tooltip,
} from "@mui/material";
import ModalCreateOrUpdate from "./components/modalCreateOrUpdate";
import { TypeClassData } from "../../types/class";
import { darken } from "@mui/material/styles";
import { useListClass } from "../../hooks/class/useListClass";
import ModalConfirm from "../../components/modalConfirm";
import { SvgIcons } from "../../components/SvgIcons";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { FieldSearch } from "../../components/FieldSearch";
import { Filters } from "../../components/Filters";
import { CardShowItem } from "../../components/CardShowItem";
import CircularProgress from "@mui/material/CircularProgress";
import { useListShifts } from "../../hooks/shifts/useListShifts";
import AutocompleteComponent from "../../components/AutocompleteComponent";
import { useSeriesSchool } from "../../hooks/schools/useSeriesSchool";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { ModuleEnum } from "@/hooks/globalState/auth/roles";
import { useNavigate } from "react-router-dom";
import { useListYearsFromRegisterClass } from "../../hooks/class/useListYearsFromRegisterClass";
import { Option } from "../../components/AutocompleteComponent";
import { MdAccessTime } from "react-icons/md";
import { MdGroups } from "react-icons/md";
import {
  stageTeachingEnumLabel,
  StageTeachingEnumType,
} from "../../types/curriculum";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MdFileDownload, MdUploadFile } from "react-icons/md";
import ModalImport from "../../components/ModalImport/ModalImport";
import ModalGenerateBulletins from "./components/ModalGenerateBulletins";
import { generateBulletinsPdf } from "./utils/generateBulletinsPdf";
import ModalStudentsSituation from "./components/ModalStudentsSituation";
import { useUploadFileClass } from "../../hooks/class/useUploadFileClass";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadTemplate } from "@/hooks/template/useUploadTemplate";
import { useToast } from "@/hooks/useToast";
import { extractApiErrorData } from "@/helpers/extractApiErrorData";
import { usePermissions } from "@/hooks/globalState/permissions/usePermissions";
import { ModuleEnumType } from "@/enums/moduleEnum";
import { ActionEnum } from "@/enums/actionEnum";

const Main = () => {
  const getModulePermissions = usePermissions((s) => s.getModulePermissions);

  const classAttendancePermissions = getModulePermissions(
    ModuleEnumType.CLASS_ATTENDANCE,
  );
  const classStudentsPermissions = getModulePermissions(
    ModuleEnumType.CLASS_STUDENTS,
  );
  const classStatisticsPermissions = getModulePermissions(
    ModuleEnumType.CLASS_STATISTICS,
  );
  const classSchedulesPermissions = getModulePermissions(
    ModuleEnumType.CLASS_SCHEDULE,
  );

  const canViewClass =
    classAttendancePermissions[ActionEnum.READ] ||
    classStudentsPermissions[ActionEnum.READ] ||
    classStatisticsPermissions[ActionEnum.READ] ||
    classSchedulesPermissions[ActionEnum.READ];

  const ClassPermissions = getModulePermissions(ModuleEnumType.CLASS);
  const hasCreate = ClassPermissions[ActionEnum.CREATE];
  const hasEdit = ClassPermissions[ActionEnum.UPDATE];

  const uploadFileClass = useUploadFileClass();
  const user = useAuth((s) => s.user);
  const loginWithUnit = useAuth((s) => s.loginWithUnit);
  const canEditClass = useAuth((s) => s.canAccessModule);
  const navigate = useNavigate();

  const { refetch: downloadTemplate, isFetching: isFetchingDownloadTemplate } =
    useUploadTemplate("CLASS");

  const queryClient = useQueryClient();

  const [openModalImport, setOpenModalImport] = useState(false);
  const [anchorElImport, setAnchorElImport] = useState<null | HTMLElement>(
    null,
  );

  const openImportMenu = Boolean(anchorElImport);

  const handleOpenImportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElImport(event.currentTarget);
  };

  const handleCloseImportMenu = () => {
    setAnchorElImport(null);
  };

  const toast = useToast();

  const hasEditClass = canEditClass(
    user?.userRole ?? [],
    ModuleEnum.EDIT_CLASS,
  );
  const unitId = localStorage.getItem("unit_id");

  const [searchClass, setSearchClass] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState<string>("");

  const [selectedSerieId, setSelectedSerieId] = useState<number | undefined>(
    undefined,
  );
  const [selectedYears, setSelectedYears] = useState<Option | null>(null);

  const { data: seriesSchool = [], isLoading: isLoadingSeries } =
    useSeriesSchool(
      Number(unitId) || null,
      selectedYears?.name ? { year: String(selectedYears.name) } : undefined,
    );

  const {
    data: yearsFromRegisterClass = [],
    isFetched: isFetchedYears,
    isLoading: isLoadingYears,
    isError: isErrorYears,
  } = useListYearsFromRegisterClass(unitId ? Number(unitId) : null);

  const {
    data: listClass = [],
    isLoading: isLoadingClass,
    isError: isErrorClass,
  } = useListClass({
    name: searchClass,
    shift_id: filterPeriod ? Number(filterPeriod) : undefined,
    unit_id: unitId ?? Number(unitId),
    year_serie_id: selectedSerieId && Number(selectedSerieId),
    page: 1,
    year: selectedYears?.name,
    limit: 1000,
  });

  const { data: shifts = [] } = useListShifts();

  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [openConfirModal, setOpenConfirmModal] = useState(false);

  const [openBoletinsModal, setOpenBoletinsModal] = useState(false);
  const [boletinsClassId, setBoletinsClassId] = useState<number | null>(null);
  const [isImprimindoBulletins, setIsImprimindoBulletins] = useState(false);

  const handleOpenBoletins = (classId: number) => {
    setBoletinsClassId(classId);
    setOpenBoletinsModal(true);
  };

  const handleCloseBoletins = () => {
    setOpenBoletinsModal(false);
    setBoletinsClassId(null);
  };

  const handlePrintBulletins = async (
    selectedIds: number[],
    classId: number | null,
  ) => {
    setIsImprimindoBulletins(true);
    try {
      const success = await generateBulletinsPdf(selectedIds, classId);
      if (!success) {
        toast.error("Não foi possível gerar os PDF dos boletins.");
      }
    } catch (error) {
      toast.error("Erro ao preparar os boletins para impressão.");
      console.error(error);
    } finally {
      setIsImprimindoBulletins(false);
      handleCloseBoletins();
    }
  };

  const [alunosSituacaoModal, setAlunosSituacaoModal] = useState<{
    open: boolean;
    type: "aprovados" | "reprovados";
    classId: number | null;
    className: string;
    classPeriod: string;
    yearSerie: string;
  }>({
    open: false,
    type: "aprovados",
    classId: null,
    className: "",
    classPeriod: "",
    yearSerie: "",
  });

  const handleOpenSituacao = (
    type: "aprovados" | "reprovados",
    classId: number,
    className: string,
    classPeriod: string,
    yearSerie: string,
  ) => {
    setAlunosSituacaoModal({
      open: true,
      type,
      classId,
      className,
      classPeriod,
      yearSerie,
    });
  };

  const handleCloseSituacao = () => {
    setAlunosSituacaoModal((prev) => ({ ...prev, open: false, classId: null }));
  };

  const handleOpenModal = (rowData?: TypeClassData): void => {
    if (rowData && rowData.id) {
      setSelectedClassId(rowData.id);
    } else {
      setSelectedClassId(null);
    }
    setOpen(true);
  };
  const handleOpenView = (rowData: TypeClassData) => {
    navigate(`/unidade/${unitId}/visualizar-turma/${rowData.id}`);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedClassId(null);
  };

  const handleUpload = async () => {
    try {
      const result = await downloadTemplate();

      if (result.isError || result.error) {
        console.error("Erro no download:", result.error);
        toast.error("Não foi possível realizar o download do template");
      } else {
        toast.success("Template baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao baixar template:", error);
      toast.error("Não foi possível realizar o download do template");
    }
  };

  const handleConfirmImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadFileClass.mutateAsync(formData as any);
      toast.success("Arquivo importado com sucesso!");
      setOpenModalImport(false);
      queryClient.invalidateQueries({ queryKey: ["class"] });
      return { success: true };
    } catch (error) {
      const extractError = extractApiErrorData(error);
      const errors = extractError.data?.errors || [];
      const emptySpreadsheet = extractError.data?.empty_spreadsheet || false;
      return { success: false, errors, emptySpreadsheet };
    }
  };

  useEffect(() => {
    if (isFetchedYears && yearsFromRegisterClass.length > 0) {
      const currentYear = new Date().getFullYear();
      const foundYear = yearsFromRegisterClass.find(
        (y: number) => y === currentYear,
      );
      const yearToSelect = foundYear ?? yearsFromRegisterClass[0];
      setSelectedYears({
        id: yearToSelect,
        name: yearToSelect,
      });
    }
  }, [isFetchedYears, yearsFromRegisterClass]);

  return (
    <>
      <Stack sx={{ mt: { xs: "20px", sm: "15px" } }}>
        <Paper
          elevation={0}
          sx={{
            pl: { xs: "10px", sm: "25px" },
            pr: { xs: "10px", sm: "25px" },
            pb: { xs: "10px", sm: "25px" },
            backgroundColor: "#fff",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Stack
            display="flex"
            flexDirection={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mt={{ xs: "10px", sm: "20px" }}
            mb={{ xs: "10px", sm: "20px" }}
            sx={{ gap: { xs: 1.5, sm: 0 } }}
          >
            <Typography variant="h6" fontWeight={600} color="#181C32">
              Selecione uma de suas turmas
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "08px",
              }}
            >
              <Tooltip
                title={
                  hasCreate ? "Importar dados" : "Sem permissão para cadastrar"
                }
              >
                <span>
                  <Button
                    disableElevation
                    disabled={!hasCreate}
                    variant="contained"
                    startIcon={
                      isFetchingDownloadTemplate ? (
                        <CircularProgress size={20} sx={{ color: "#fff" }} />
                      ) : (
                        <MdFileDownload />
                      )
                    }
                    sx={{
                      pl: "20px",
                      pr: "20px",
                      color: "#fff",
                      bgcolor: "#07A7DF",
                      textTransform: "none",
                      fontSize: "15.25px",
                      fontWeight: 500,
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        bgcolor: darken("#07A7DF", 0.1),
                      },
                    }}
                    onClick={handleOpenImportMenu}
                  >
                    Importar dados
                  </Button>
                </span>
              </Tooltip>
              <Menu
                anchorEl={anchorElImport}
                open={openImportMenu}
                onClose={handleCloseImportMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  mt: 0.5,
                  "& .MuiPaper-root": { borderRadius: 1.5, minWidth: 170 },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseImportMenu();
                    handleUpload();
                  }}
                >
                  <Stack direction="row" gap={1} alignItems="center">
                    <MdFileDownload color="#757575" />
                    <Typography variant="body2" fontWeight="600">
                      Baixar arquivo
                    </Typography>
                  </Stack>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleCloseImportMenu();
                    setOpenModalImport(true);
                  }}
                >
                  <Stack direction="row" gap={1} alignItems="center">
                    <MdUploadFile color="#757575" />
                    <Typography variant="body2" fontWeight="600">
                      Importar arquivo
                    </Typography>
                  </Stack>
                </MenuItem>
              </Menu>
              <Tooltip
                title={
                  hasCreate ? "Cadastrar turma" : "Sem permissão para cadastrar"
                }
              >
                <span>
                  <Button
                    disableElevation
                    disabled={!hasCreate}
                    variant="contained"
                    startIcon={<GroupAddIcon />}
                    sx={{
                      pl: "18px",
                      pr: "18px",
                      bgcolor: "#07A7DF",
                      textTransform: "none",
                      fontSize: "15.17px",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        bgcolor: darken("#07A7DF", 0.1),
                      },
                    }}
                    onClick={() => handleOpenModal()}
                  >
                    Adicionar turmas
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
          <Divider
            sx={{
              mt: { xs: "5px", sm: "10px" },
              mb: { xs: "5px", sm: "10px" },
              width: "100%",
              borderColor: "#C8C8C8",
            }}
          />
          <Grid
            container
            mb={{ xs: "10px", sm: "15px" }}
            spacing={{ xs: 0.5, sm: 2 }}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <FieldSearch
                label="Buscar turmas"
                placeholder="Digite o nome da turma"
                value={searchClass}
                onChange={(e) => {
                  setSearchClass(e.target.value);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <AutocompleteComponent
                name="year"
                label="Ano Letivo"
                placeholder="Selecione o ano Letivo"
                options={yearsFromRegisterClass.map((year: number) => ({
                  id: year,
                  name: year,
                }))}
                value={selectedYears}
                loading={!isErrorYears && isLoadingYears}
                onChange={(_, newValue) => {
                  if (!!selectedYears) {
                    setSelectedSerieId(undefined);
                  }
                  setSelectedYears(
                    newValue as { id: number; name: string } | null,
                  );
                }}
                hasFormik={false}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AutocompleteComponent
                name="year_serie_id"
                label="Série/Ano"
                placeholder={
                  !selectedYears
                    ? "Selecione o ano letivo para continuar"
                    : " Selecione a série/ano"
                }
                options={seriesSchool || []}
                loading={isLoadingSeries}
                value={
                  seriesSchool.find(
                    (item: any) => String(item.id) === String(selectedSerieId),
                  ) || null
                }
                onChange={(_, newValue) => {
                  setSelectedSerieId(
                    Array.isArray(newValue)
                      ? undefined
                      : newValue
                        ? (newValue as { id: number }).id
                        : undefined,
                  );
                }}
                disabled={!selectedYears}
                hasFormik={false}
              />
            </Grid>
          </Grid>

          <Grid container mb={{ xs: "10px", sm: "15px" }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Filters
                selected={filterPeriod}
                filters={[
                  {
                    label: "Todas",
                    value: "",
                    onClick: () => {
                      setFilterPeriod("");
                    },
                  },
                  ...shifts.map((shift: any) => ({
                    label: shift.name,
                    value: String(shift.id),

                    onClick: () => {
                      setFilterPeriod(String(shift.id));
                    },
                  })),
                ]}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {isLoadingClass ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  padding: "20px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : isErrorClass ? (
              <Stack
                sx={{
                  width: "100%",
                  display: "flex",
                  padding: "20px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" color="error">
                  Erro ao carregar a listagem de turmas. Selecione uma unidade
                </Typography>
              </Stack>
            ) : listClass.length ? (
              listClass.map((item) => (
                <Grid size={{ xs: 12, md: 4 }}>
                  <CardShowItem
                    title={`Turma: ${item.name} | Ano/Série: ${item.yearSerie.name} ${stageTeachingEnumLabel[item.yearSerie?.stageTeaching?.type as StageTeachingEnumType] ?? item.yearSerie?.stageTeaching?.type ?? ""}`}
                    items={[
                      {
                        icon: <MdGroups size={19} />,
                        label: `${item.max_enrolments ?? 0} alunos`,
                      },
                      {
                        icon: <MdAccessTime size={19} />,
                        label: `Período: ${item.shift.name}`,
                      },
                      {
                        icon: (
                          <img
                            src={SvgIcons.Room}
                            alt="Sala"
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "0px",
                            }}
                          />
                        ),
                        label: item.room,
                      },
                    ]}
                    buttonLabel="Visualizar Turma"
                    onButtonClick={() => handleOpenView(item)}
                    hasEditClass={hasEditClass}
                    onEditClick={() => handleOpenModal(item)}
                    hasView={canViewClass}
                    hasEdit={hasEdit}
                    menuOptions={[
                      {
                        label: "Gerar Boletins",
                        onClick: () => handleOpenBoletins(item.id),
                      },
                      {
                        label: "Alunos Aprovados",
                        onClick: () =>
                          handleOpenSituacao(
                            "aprovados",
                            item.id,
                            item.name,
                            item.shift.name,
                            item.yearSerie.name,
                          ),
                      },
                      {
                        label: "Alunos Reprovados",
                        onClick: () =>
                          handleOpenSituacao(
                            "reprovados",
                            item.id,
                            item.name,
                            item.shift.name,
                            item.yearSerie.name,
                          ),
                      },
                    ]}
                  />
                </Grid>
              ))
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  padding: "20px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {loginWithUnit.hasUnit && loginWithUnit.unit !== 1
                    ? "Nenhuma turma para exibir."
                    : "Verifique se a unidade escolar está selecionada"}
                </Typography>
              </Box>
            )}
          </Grid>
        </Paper>
      </Stack>

      <ModalImport
        open={openModalImport}
        handleClose={() => {
          setOpenModalImport(false);
        }}
        handleConfirmImport={handleConfirmImport}
      />

      <ModalCreateOrUpdate
        open={open}
        handleClose={handleCloseModal}
        classId={selectedClassId}
        selectedUnitId={unitId ? Number(unitId) : null}
      />

      <ModalConfirm
        open={openConfirModal}
        handleClose={() => setOpenConfirmModal(false)}
        handleConfirm={() => {
          setOpenConfirmModal(false);
        }}
        children={
          <Typography>Tem certeza que deseja realizar esta ação?</Typography>
        }
      />

      <ModalGenerateBulletins
        open={openBoletinsModal}
        classId={boletinsClassId}
        handleClose={handleCloseBoletins}
        onGeneratePDF={handlePrintBulletins}
        isGenerating={isImprimindoBulletins}
      />

      <ModalStudentsSituation
        open={alunosSituacaoModal.open}
        type={alunosSituacaoModal.type}
        classId={alunosSituacaoModal.classId}
        className={alunosSituacaoModal.className}
        classPeriod={alunosSituacaoModal.classPeriod}
        yearSerie={alunosSituacaoModal.yearSerie}
        handleClose={handleCloseSituacao}
      />
    </>
  );
};

export default Main;
