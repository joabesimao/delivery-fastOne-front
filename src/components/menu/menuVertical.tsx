import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  Avatar,
  Box,
  Collapse,
  Button,
} from "@mui/material";
import DrawerHeader from "../drawerHeader";
import CustomDrawer from "./components/CustomDrawer";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import PersonIcon from "@mui/icons-material/Person";
import { SvgIcons } from "../../components/SvgIcons";
import IconMagistter from "../../assets/img/icon-maggister.svg";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "@/hooks/globalState/auth/useAuth";
import { useTitle } from "@/hooks/globalState/titleHeader/useTitle";
import { useTheme, useMediaQuery } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ModalAlterUnit from "./components/alterUnit";
import { useMenu } from "../../hooks/globalState/menu/useMenu";
import MenuIcon from "@mui/icons-material/Menu";
import { MdDashboard } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { PiBagSimpleFill } from "react-icons/pi";
import { MdOutlineMenuBook } from "react-icons/md";
import { BsTools } from "react-icons/bs";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BiSolidCalendar } from "react-icons/bi";
import { IoCalendarSharp } from "react-icons/io5";
import { PiListFill } from "react-icons/pi";
import { IoMdCalendar } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { SiGoogleclassroom } from "react-icons/si";
import { usePermissions } from "@/hooks/globalState/permissions/usePermissions";
import { ModuleEnumType } from "@/enums/moduleEnum";
import { ActionEnum } from "@/enums/actionEnum";
import { useMunicipality } from "@/hooks/globalState/municipality/useMunicipality";
import { BiSolidBook } from "react-icons/bi";
import { MdAutoStories } from "react-icons/md";
import { TbArrowBack } from "react-icons/tb";
import { MdViewModule } from "react-icons/md";

import { GiHomeGarage } from "react-icons/gi";
import { FaShuttleVan } from "react-icons/fa";
import { FaRoute } from "react-icons/fa";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { IoMap } from "react-icons/io5";
import { LuListRestart } from "react-icons/lu";
import { RiPlayListAddLine } from "react-icons/ri";
import { MdEditDocument } from "react-icons/md";
import { BiSolidCalendarX } from "react-icons/bi";
import { ImUserPlus } from "react-icons/im";
import { MdMapsHomeWork } from "react-icons/md";
import { MdEngineering } from "react-icons/md";


interface MenuVerticalProps {
  open: boolean;
  drawerWidth: number;
}

const MenuVertical: React.FC<MenuVerticalProps> = ({ open, drawerWidth }) => {
  const { municipalityLogo } = useMunicipality();
  const setIsMenuExpanded = useMenu((state) => state.setIsMenuExpanded);
  const isMenuExpanded = useMenu((state) => state.isMenuExpanded);

  const loginWithUnit = useAuth((s) => s.loginWithUnit);
  const [openModalAlterUnit, setOpenModalAlterUnit] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const setMenuTitle = useTitle((state) => state.setMenuTitle);

  const navigateRouter = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [openNestedSubMenu, setOpenNestedSubMenu] = useState<string | null>(
    null,
  );

  const listRef = useRef<HTMLUListElement | null>(null);
  const settingsAnchorRef = useRef<HTMLDivElement | null>(null);
  const firstSettingsItemRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSubMenu = useCallback((menuKey: string) => {
    setOpenSubMenu((current) => (current === menuKey ? null : menuKey));
  }, []);

  const handleToggleNestedSubMenu = useCallback((menuKey: string) => {
    setOpenNestedSubMenu((current) => (current === menuKey ? null : menuKey));
  }, []);

  const unitId = useMemo(() => localStorage.getItem("unit_id"), []);
  const user = useAuth((s) => s.user);

  const loggedInWithSchool = useMemo(() => !!unitId, [unitId]);

  const permissions = usePermissions((s) => s.permissions);
  const getModulePermissions = usePermissions((s) => s.getModulePermissions);
  const profileVersion = useAuth((s) => s.profileVersion);

  const hasReadPermission = useCallback(
    (module: ModuleEnumType): boolean => {
      const modulePermissions = getModulePermissions(module);
      return modulePermissions[ActionEnum.READ] === true;
    },
    [getModulePermissions, permissions, profileVersion],
  );

  const handleDrawerClose = () => {
    setIsMenuExpanded(false);
  };

  const isStudent = useMemo(
    () => user?.userRole?.some((ur) => ur.role.slug === "estudante"),
    [user?.userRole],
  );

  const studentMenuItems = useMemo(
    () => [
      ...(hasReadPermission(ModuleEnumType.DASHBOARD_STUDENT)
        ? [
            {
              text: "Dashboard",
              icon: (
                <img
                  src={SvgIcons.Dashboard}
                  alt="Dashboard"
                  style={{
                    width: "19px",
                    height: "19px",
                    objectFit: "contain",
                  }}
                />
              ),
              path: "/dashboard-aluno",
              title: "Dashboard",
            },
          ]
        : []),
      ...(hasReadPermission(ModuleEnumType.STUDENT_CLASS)
        ? [
            {
              text: "Turma",
              icon: <GroupsIcon sx={{ color: "#fff" }} />,
              path: "/turma-aluno",
              title: "Turma",
            },
          ]
        : []),
      ...(hasReadPermission(ModuleEnumType.STUDENT_FREQUENCY)
        ? [
            {
              text: "Frequência",
              icon: <CalendarTodayIcon sx={{ color: "#fff" }} />,
              path: "/frequencia-aluno",
              title: "Frequência",
            },
          ]
        : []),
      ...(hasReadPermission(ModuleEnumType.STUDENT_REPORT)
        ? [
            {
              text: "Boletim",
              icon: <AssessmentIcon sx={{ color: "#fff" }} />,
              path: "/boletim-aluno",
              title: "Boletim",
            },
          ]
        : []),
      ...(hasReadPermission(ModuleEnumType.STUDENT_SCHEDULE)
        ? [
            {
              text: "Horários",
              icon: <AccessTimeIcon sx={{ color: "#fff" }} />,
              path: "/horarios-aluno",
              title: "Horários",
            },
          ]
        : []),
    ],
    [hasReadPermission, permissions, profileVersion],
  );

  const listItemsMenu = useMemo(
    () =>
      isStudent
        ? studentMenuItems
        : [
            // Dashboard
            ...(hasReadPermission(ModuleEnumType.DASHBOARD_GENERAL) ||
            hasReadPermission(ModuleEnumType.DASHBOARD_UNIT)
              ? [
                  {
                    text: "Dashboard",
                    icon: <MdDashboard size={24} color="#ffffffff" />,
                    path: null,
                    title: "Dashboard",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.DASHBOARD_GENERAL)
                        ? [
                            {
                              text: "Geral",
                              icon: (
                                <StackedLineChartIcon sx={{ color: "#fff" }} />
                              ),
                              path: "/dashboard/dashboard-geral",
                              title: "Dashboard",
                            },
                          ]
                        : []),

                      ...(hasReadPermission(ModuleEnumType.DASHBOARD_UNIT)
                        ? [
                            {
                              text: "Escolar",
                              icon: <ShowChartIcon sx={{ color: "#fff" }} />,
                              path: "/dashboard/dashboard-da-escola",
                              title: "Dashboard",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            // Turmas
            ...(hasReadPermission(ModuleEnumType.CLASS)
              ? [
                  {
                    text: "Turmas",
                    icon: <GroupsIcon sx={{ color: "#fff" }} />,
                    path: "/turmas",
                    title: "Visualizar Turmas",
                  },
                ]
              : []),

            // Avaliações
            ...(hasReadPermission(ModuleEnumType.ASSESSMENTS) ||
            hasReadPermission(ModuleEnumType.ASSESSMENTS_FINAL_AVERAGES)
              ? [
                  {
                    text: "Avaliações",
                    icon: <IoDocumentText size={25} color="#ffffffff" />,
                    path: "/avaliacoes",
                    title: "Avaliações e Notas",
                  },
                ]
              : []),

            // Plano de trabalho
            ...(hasReadPermission(ModuleEnumType.WORK_PLAN)
              ? [
                  {
                    text: "Plano de trabalho",
                    icon: <PiBagSimpleFill size={25} color="#ffffffff" />,
                    path: "/plano-de-trabalho",
                    title: "Plano de trabalho",
                  },
                ]
              : []),

            // Estoque
            ...(hasReadPermission(ModuleEnumType.STOCK_OVERVIEW) ||
            hasReadPermission(ModuleEnumType.MANAGE_STOCK) ||
            hasReadPermission(ModuleEnumType.CONFIG_STOCK_MANAGE_INVENTORY) ||
            hasReadPermission(ModuleEnumType.CONFIG_STOCK_PRODUCT_CATEGORIES) ||
            hasReadPermission(ModuleEnumType.CONFIG_STOCK_SUPPLIERS)
              ? [
                  {
                    text: "Estoque",
                    icon: <InventoryIcon sx={{ color: "#fff" }} />,
                    path: null,
                    title: "Gestão de Estoque",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.STOCK_OVERVIEW)
                        ? [
                            {
                              text: "Visão geral",
                              icon: <DashboardIcon sx={{ color: "#fff" }} />,
                              path: "/estoque",
                              title: "Estoque - Visão geral",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.MANAGE_STOCK_INVENTORY,
                      ) ||
                      hasReadPermission(
                        ModuleEnumType.MANAGE_STOCK_INBOUND_MOVEMENTS,
                      ) ||
                      hasReadPermission(
                        ModuleEnumType.MANAGE_STOCK_OUTBOUND_MOVEMENTS,
                      ) ||
                      hasReadPermission(ModuleEnumType.MANAGE_STOCK_PRODUCTS) ||
                      hasReadPermission(ModuleEnumType.MANAGE_STOCK_TRANSFER)
                        ? [
                            {
                              text: "Gerenciar estoque",
                              icon: <Inventory2Icon sx={{ color: "#fff" }} />,
                              path: "/estoque/gerenciar",
                              title: "Estoque - Gerenciar estoque",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.CONFIG_STOCK_MANAGE_INVENTORY,
                      ) ||
                      hasReadPermission(
                        ModuleEnumType.CONFIG_STOCK_PRODUCT_CATEGORIES,
                      ) ||
                      hasReadPermission(ModuleEnumType.CONFIG_STOCK_SUPPLIERS)
                        ? [
                            {
                              text: "Configuração",
                              icon: <SettingsIcon sx={{ color: "#fff" }} />,
                              path: "/estoque/configuracao",
                              title: "Configuração do Estoque",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            // Diário da Merendeira
            ...(hasReadPermission(ModuleEnumType.KITCHEN_DIARY) ||
            hasReadPermission(ModuleEnumType.KITCHEN_DIARY_WEEKLY_MENU) ||
            hasReadPermission(ModuleEnumType.KITCHEN_DIARY_DAILY_LOG) ||
            hasReadPermission(ModuleEnumType.KITCHEN_DIARY_WASTE_RECORD) ||
            hasReadPermission(ModuleEnumType.KITCHEN_DIARY_STOCK_ALERT)
              ? [
                  {
                    text: "Diário da Merendeira",
                    icon: <MdOutlineMenuBook size={24} color="#ffffffff" />,
                    path: "/diario-de-merendeira",
                    title: "Controle do cardápio escolar",
                  },
                ]
              : []),

            // Manutenção Escolar - Menu completo
            ...(hasReadPermission(ModuleEnumType.MAINTENANCE_REQUESTS_UNIT) ||
            hasReadPermission(ModuleEnumType.SCHOOL_MAINTENANCE_REQUESTS) ||
            hasReadPermission(ModuleEnumType.SCHOOL_MAINTENANCE_REPORTS) ||
            hasReadPermission(
              ModuleEnumType.SCHOOL_MAINTENANCE_REQUESTS_HISTORY,
            ) ||
            hasReadPermission(ModuleEnumType.SCHOOL_MAINTENANCE_CONFIG)
              ? [
                  {
                    text: "Manutenção",
                    icon: <BsTools size={23} color="#ffffffff" />,
                    path: null,
                    title: "Manutenção escolar",
                    subItems: [
                      ...(hasReadPermission(
                        ModuleEnumType.MAINTENANCE_REQUESTS_UNIT,
                      )
                        ? [
                            {
                              text: "Realizar solicitação",
                              icon: <BsTools size={23} color="#ffffffff" />,
                              path: "/manutencao-escolar/unidade-escolar",
                              title: "Realizar solicitação de manutenção",
                            },
                          ]
                        : []),

                      ...(hasReadPermission(
                        ModuleEnumType.SCHOOL_MAINTENANCE_REQUESTS,
                      )
                        ? [
                            {
                              text: "Solicitações",
                              icon: (
                                <img
                                  src={SvgIcons.solicitations}
                                  alt="Solicitações"
                                  style={{
                                    width: "22px",
                                    height: "22px",
                                    objectFit: "contain",
                                  }}
                                />
                              ),
                              path: "/manutencao-escolar/solicitacoes",
                              title: "Solicitações",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.SCHOOL_MAINTENANCE_REPORTS,
                      )
                        ? [
                            {
                              text: "Relatório",
                              icon: (
                                <IoDocumentText size={23} color="#ffffffff" />
                              ),
                              path: "/manutencao-escolar/relatorios",
                              title: "Relatório de manutenção escolar",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.SCHOOL_MAINTENANCE_REQUESTS_HISTORY,
                      )
                        ? [
                            {
                              text: "Histórico de solicitações",
                              icon: (
                                <img
                                  src={SvgIcons.History}
                                  alt="Histórico de solicitações"
                                  style={{
                                    width: "23px",
                                    height: "23px",
                                    objectFit: "contain",
                                  }}
                                />
                              ),
                              path: "/manutencao-escolar/historico-de-solicitacoes",
                              title: "Histórico de solicitações",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.MAINTENANCE_CATEGORIES,
                      ) ||
                      hasReadPermission(ModuleEnumType.MAINTENANCE_STATUS) ||
                      hasReadPermission(
                        ModuleEnumType.MAINTENANCE_PRIORITIES,
                      ) ||
                      hasReadPermission(ModuleEnumType.MAINTENANCE_ADJUSTMENTS)
                        ? [
                            {
                              text: "Configurações",
                              icon: <SettingsIcon sx={{ color: "#fff" }} />,
                              path: "/manutencao-escolar/configuracao",
                              title: "Configurações da manutenção escolar",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

              //Obras
            {
              text: "Obras",
              icon: <MdMapsHomeWork size={24} color="#fff" />,
              path: null,
              title: "Obras",
              subItems: [
                {
                  text: "Dashboard",
                  icon: <DashboardIcon sx={{ color: "#fff" }} />,
                  path: "/obras/dashboard",
                  title: "Dashboard de acompanhamento de obras",
                },
                {
                  text: "Obras",
                  icon: <MdEngineering size={23} color="#ffffffff" />,
                  path: "/obras",
                  title: "Obras em andamento",
                },
                {
                  text: "Mapas",
                  icon: <IoMap size={23} color="#ffffffff" />,
                  path: "/obras/mapas",
                  title: "Mapa de obras",
                },
                {
                  text: "Relatórios",
                  icon: <IoDocumentText size={23} color="#ffffffff" />,
                  path: "/obras/relatorios",
                  title: "Relatório de obras",
                },
              ]
            },


            // EAD
            ...(hasReadPermission(ModuleEnumType.EAD)
              ? [
                  {
                    text: "EAD",
                    icon: (
                      <img
                        src={SvgIcons.EAD}
                        alt="EAD"
                        style={{
                          width: "24px",
                          height: "24px",
                          objectFit: "contain",
                        }}
                      />
                    ),
                    path: "/ead",
                    title: "EAD",
                  },
                ]
              : []),

            // Escolas
            ...(hasReadPermission(ModuleEnumType.SCHOOLS)
              ? [
                  {
                    text: "Escolas",
                    icon: (
                      <Avatar
                        src={SvgIcons.SchoolIcon2}
                        alt="Escolas"
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "0px",
                        }}
                      />
                    ),
                    path: "/escolas",
                    title: "Escolas cadastradas",
                  },
                ]
              : []),
            //Biblioteca
            ...(hasReadPermission(ModuleEnumType.LIBRARY_DASHBOARD) ||
            hasReadPermission(ModuleEnumType.LIBRARY_COLLECTION) ||
            hasReadPermission(ModuleEnumType.LIBRARY_LOAN) ||
            hasReadPermission(ModuleEnumType.LIBRARY_RETURN) ||
            hasReadPermission(ModuleEnumType.LIBRARY_OVERDUE)
              ? [
                  {
                    text: "Biblioteca",
                    icon: <BiSolidBook size={23} color="#ffffffff" />,
                    path: null,
                    title: "Biblioteca",

                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.LIBRARY_DASHBOARD)
                        ? [
                            {
                              text: "Dashboard",
                              icon: <DashboardIcon sx={{ color: "#fff" }} />,
                              path: "/biblioteca/dashboard",
                              title: "Biblioteca Escolar",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.LIBRARY_COLLECTION)
                        ? [
                            {
                              text: "Acervo",
                              icon: <MdAutoStories size={23} color="#fff" />,
                              path: "/biblioteca/acervo",
                              title: "Gestão de Acervo (Obras)",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.LIBRARY_LOAN) ||
                      hasReadPermission(ModuleEnumType.LIBRARY_RETURN) ||
                      hasReadPermission(ModuleEnumType.LIBRARY_OVERDUE)
                        ? [
                            {
                              text: "Empréstimo e devolução",
                              icon: (
                                <TbArrowBack
                                  size={25}
                                  color="#fff"
                                  strokeWidth={2}
                                />
                              ),
                              path: "/biblioteca/emprestimos-devolucoes",
                              title: "Empréstimos e devoluções",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            //Ônibus escolares
            ...(hasReadPermission(ModuleEnumType.SCHOOL_BUS_ROUTES) ||
            hasReadPermission(ModuleEnumType.SCHOOL_BUS_GARAGE) ||
            hasReadPermission(ModuleEnumType.SCHOOL_BUS_REGISTERED)
              ? [
                  {
                    text: "Ônibus Escolares",
                    icon: <FaShuttleVan size={24} color="#fff" />,
                    path: null,
                    title: "Ônibus Escolares",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.SCHOOL_BUS_GARAGE)
                        ? [
                            {
                              text: "Garagem",
                              icon: <GiHomeGarage size={24} color="#fff" />,
                              path: "/onibus-escolares/garagem",
                              title: "Garagem",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.SCHOOL_BUS_ROUTES)
                        ? [
                            {
                              text: "Rotas",
                              icon: (
                                <FaRoute
                                  size={25}
                                  color="#fff"
                                  strokeWidth={2}
                                />
                              ),
                              path: "/onibus-escolares/rotas",
                              title: "Rotas",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.SCHOOL_BUS_REGISTERED,
                      )
                        ? [
                            {
                              text: "Ônibus",
                              icon: <FaShuttleVan size={24} color="#fff" />,
                              path: "/onibus-escolares/onibus",
                              title: "Ônibus",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            //Rastreamento
            ...(hasReadPermission(ModuleEnumType.SCHOOL_BUS_MAP) ||
            hasReadPermission(ModuleEnumType.SCHOOL_BUS_HISTORY)
              ? [
                  {
                    text: "Rastreamento",
                    icon: <LocationOnIcon sx={{ color: "#fff" }} />,
                    path: null,
                    title: "Rastreamento",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.SCHOOL_BUS_MAP)
                        ? [
                            {
                              text: "Mapa de ônibus",
                              icon: <IoMap size={24} color="#fff" />,
                              path: "/rastreamento/mapa",
                              title: "Mapa de ônibus",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.SCHOOL_BUS_HISTORY_ROUTES,
                      )
                        ? [
                            {
                              text: "Histórico de percursos",
                              icon: <IoMap size={24} color="#fff" />,
                              path: "/rastreamento/historico-de-percursos",
                              title: "Histórico de percursos",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            // Alunos
            ...(hasReadPermission(ModuleEnumType.STUDENTS) ||
            hasReadPermission(ModuleEnumType.STUDENT_INFREQUENCY) ||
            hasReadPermission(ModuleEnumType.ENROLLMENTS) ||
            hasReadPermission(ModuleEnumType.RE_ENROLLMENTS)
              ? [
                  {
                    text: "Alunos",
                    icon: (
                      <Avatar
                        src={SvgIcons.Student}
                        alt="Alunos"
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "0px",
                        }}
                      />
                    ),
                    path: null,
                    title: "Alunos",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.STUDENTS)
                        ? [
                            {
                              text: "Alunos",
                              icon: (
                                <Avatar
                                  src={SvgIcons.Student}
                                  alt="Alunos"
                                  sx={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "0px",
                                  }}
                                />
                              ),
                              path: "/alunos",
                              title: "Visualizar alunos cadastrados",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.STUDENT_INFREQUENCY,
                      )
                        ? [
                            {
                              text: "Gestão de Infrequência",
                              icon: <BiSolidCalendarX size={22} color="#fff" />,
                              path: "/infrequencia",
                              title: "Gestão de Infrequência",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.ENROLLMENTS) ||
                      hasReadPermission(ModuleEnumType.RE_ENROLLMENTS)
                        ? [
                            {
                              text: "Gestão de Matrícula",
                              icon: <MdEditDocument size={22} color="#fff" />,
                              path: null,
                              title: "Gestão de Matrícula",
                              subItems: [
                                ...(hasReadPermission(
                                  ModuleEnumType.ENROLLMENTS,
                                )
                                  ? [
                                      {
                                        text: "Matrículas",
                                        icon: (
                                          <RiPlayListAddLine
                                            size={22}
                                            color="#fff"
                                          />
                                        ),
                                        path: "/matriculas",
                                        title: "Matrículas de alunos",
                                      },
                                    ]
                                  : []),
                                ...(hasReadPermission(
                                  ModuleEnumType.RE_ENROLLMENTS,
                                )
                                  ? [
                                      {
                                        text: "Rematrículas",
                                        icon: (
                                          <LuListRestart
                                            size={22}
                                            color="#fff"
                                          />
                                        ),
                                        path: "/alunos/rematriculas",
                                        title: "Rematrículas",
                                      },
                                    ]
                                  : []),
                              ],
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            // Gestão de Vagas
            ...(hasReadPermission(ModuleEnumType.VACANCY_MANAGEMENT)
              ? [
                  {
                    text: "Gestão de Vagas",
                    icon: <ImUserPlus size={22} color="#fff" />,
                    path: "/vagas",
                    title: "Vagas disponibilizadas",
                  },
                ]
              : []),

            // Professores
            ...(hasReadPermission(ModuleEnumType.TEACHERS)
              ? [
                  {
                    text: "Professores",
                    icon: <FaChalkboardTeacher size={23} color="#ffffffff" />,
                    path: "/professores",
                    title: "Professores cadastrados",
                  },
                ]
              : []),

            // Calendário
            ...(hasReadPermission(ModuleEnumType.SCHOOL_CALENDAR) ||
            hasReadPermission(ModuleEnumType.VIEW_MODULE_CALENDAR_UNIT) ||
            hasReadPermission(ModuleEnumType.CREATE_CALENDAR) ||
            hasReadPermission(ModuleEnumType.VIEW_MODULE_CREATE_CALENDAR) ||
            hasReadPermission(ModuleEnumType.CREATE_TYPE_EVENT_CALENDAR) ||
            hasReadPermission(ModuleEnumType.VIEW_MODULE_CREATE_TYPE_EVENT)
              ? [
                  {
                    text: "Calendário",
                    icon: <BiSolidCalendar size={25} color="#ffffffff" />,
                    path: null,
                    title: "Calendário",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.SCHOOL_CALENDAR) ||
                      hasReadPermission(
                        ModuleEnumType.VIEW_MODULE_CALENDAR_UNIT,
                      )
                        ? [
                            {
                              text: "Calendário escolar",
                              icon: (
                                <IoCalendarSharp size={20} color="#ffffffff" />
                              ),
                              path: "/calendario/calendario-escolar",
                              title: "Calendário escolar",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.CREATE_CALENDAR) ||
                      hasReadPermission(
                        ModuleEnumType.VIEW_MODULE_CREATE_CALENDAR,
                      )
                        ? [
                            {
                              text: "Criar calendário",
                              icon: <PiListFill size={22} color="#ffffffff" />,
                              path: "/calendario/criar-calendario",
                              title: "Calendário",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.CREATE_TYPE_EVENT_CALENDAR,
                      ) ||
                      hasReadPermission(
                        ModuleEnumType.VIEW_MODULE_CREATE_TYPE_EVENT,
                      )
                        ? [
                            {
                              text: "Criar tipo de evento",
                              icon: (
                                <IoMdCalendar size={22} color="#ffffffff" />
                              ),
                              path: "/calendario/criar-tipo-de-evento",
                              title: "Tipo de evento",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),

            // Configurações
            ...(hasReadPermission(ModuleEnumType.USERS) ||
            hasReadPermission(ModuleEnumType.PROFILES) ||
            hasReadPermission(ModuleEnumType.DISCIPLINE_CONFIG) ||
            hasReadPermission(ModuleEnumType.HOURS_CONFIG) ||
            hasReadPermission(ModuleEnumType.EAD_CONFIG_MAIN_BANNERS) ||
            hasReadPermission(ModuleEnumType.EAD_CONFIG_MODULES)
              ? [
                  {
                    text: "Configurações",
                    icon: <SettingsIcon sx={{ color: "#fff" }} />,
                    path: null,
                    title: "Configurações",
                    subItems: [
                      ...(hasReadPermission(ModuleEnumType.LIBRARY_CONFIG)
                        ? [
                            {
                              text: "Módulos",
                              icon: (
                                <MdViewModule size={20} color="#ffffffff" />
                              ),
                              path: "/configuracoes/modulos",
                              title: "Configurações dos módulos",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.USERS)
                        ? [
                            {
                              text: "Usuários",
                              icon: <PersonIcon sx={{ color: "#fff" }} />,
                              path: "/configuracoes/usuarios",
                              title: "Usuários cadastrados",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.PROFILES)
                        ? [
                            {
                              text: "Perfis",
                              icon: (
                                <FaUnlockKeyhole size={20} color="#ffffffff" />
                              ),
                              path: "/configuracoes/perfis",
                              title: "Gerenciar Perfis",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.DISCIPLINE_CONFIG)
                        ? [
                            {
                              text: "Disciplinas",
                              icon: <FaBookOpen size={20} color="#ffffffff" />,
                              path: "/configuracoes/disciplinas",
                              title: "Gerenciar disciplinas",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(ModuleEnumType.HOURS_CONFIG)
                        ? [
                            {
                              text: "Horários",
                              icon: <FaClock size={21} color="#ffffffff" />,
                              path: "/configuracoes/horarios",
                              title: "Gerenciar horários",
                            },
                          ]
                        : []),
                      ...(hasReadPermission(
                        ModuleEnumType.EAD_CONFIG_MAIN_BANNERS,
                      ) || hasReadPermission(ModuleEnumType.EAD_CONFIG_MODULES)
                        ? [
                            {
                              text: "EAD",
                              icon: (
                                <SiGoogleclassroom
                                  size={21}
                                  color="#ffffffff"
                                />
                              ),
                              path: null,
                              title: "Configurações EAD",
                              subItems: [
                                ...(hasReadPermission(
                                  ModuleEnumType.EAD_CONFIG_MAIN_BANNERS,
                                )
                                  ? [
                                      {
                                        text: "Banners principais",
                                        icon: (
                                          <SiGoogleclassroom
                                            size={20}
                                            color="#ffffffff"
                                          />
                                        ),
                                        path: "/configuracoes/ead/banners",
                                        title: "Banners principais",
                                      },
                                    ]
                                  : []),
                                ...(hasReadPermission(
                                  ModuleEnumType.EAD_CONFIG_MODULES,
                                )
                                  ? [
                                      {
                                        text: "Módulos / Vídeos",
                                        icon: (
                                          <SiGoogleclassroom
                                            size={20}
                                            color="#ffffffff"
                                          />
                                        ),
                                        path: "/configuracoes/ead/modulos",
                                        title: "Módulos / Vídeos",
                                      },
                                    ]
                                  : []),
                              ],
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),
          ],
    [
      isStudent,
      studentMenuItems,
      hasReadPermission,
      permissions,
      profileVersion,
    ],
  );

  useEffect(() => {
    if (openSubMenu !== "Configurações") return;
    const t = setTimeout(() => {
      if (listRef.current && settingsAnchorRef.current) {
        const list = listRef.current;
        const anchorTop = settingsAnchorRef.current.offsetTop;
        list.scrollTo({ top: Math.max(anchorTop - 16, 0), behavior: "smooth" });
      }
      if (firstSettingsItemRef.current) {
        firstSettingsItemRef.current.focus();
      }
    }, 200);
    return () => clearTimeout(t);
  }, [openSubMenu]);

  const drawerInnerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <DrawerHeader sx={{ height: open ? "195px" : "75px", flexShrink: 0 }}>
        <Stack
          sx={{
            position: open ? "absolute" : "relative",
            right: open ? "10px" : "auto",
            top: open ? "18px" : "auto",
            height: open ? "auto" : "75px",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => {
              setIsMenuExpanded(!isMenuExpanded);
            }}
            aria-label={isMenuExpanded ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuExpanded ? (
              <KeyboardDoubleArrowLeftIcon sx={{ color: "#fff" }} />
            ) : (
              <MenuIcon sx={{ color: "#fff" }} />
            )}
          </IconButton>
        </Stack>
        <Stack
          flexDirection={open ? "column" : "row"}
          gap={open ? "15px" : "0px"}
          alignItems="center"
          justifyContent="center"
          mt={open ? "20px" : "0px"}
          width="100%"
          height={open ? "100%" : "auto"}
        >
          <Avatar
            alt="Unidade"
            src={municipalityLogo}
            sx={{
              display: open ? "block" : "none",
              width: open ? "85px" : "50px",
              height: open ? "85px" : "50px",
              bgcolor: "#fff",
              padding: "5px",
            }}
          />
          <Stack
            display={open ? "flex" : "none"}
            width={"100%"}
            alignItems="center"
            gap="4px"
            sx={{ mb: "8px" }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#fff",
                fontWeight: 700,
                display: loggedInWithSchool ? "block" : "none",
                wordBreak: "break-word",
                whiteSpace: "normal",
                textAlign: "center",
                lineHeight: "20px",
              }}
            >
              {loginWithUnit?.name || ""}
            </Typography>
            <Button
              startIcon={<SyncAltIcon sx={{ color: "#fff" }} />}
              size="small"
              variant="outlined"
              sx={{
                color: "#fff",
                bgcolor: "transparent",
                border: "none",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                fontWeight: 400,
                fontSize: "14px",
                "&:hover": {
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                },
              }}
              onClick={() => setOpenModalAlterUnit(true)}
            >
              Alterar unidade
            </Button>
          </Stack>
        </Stack>
      </DrawerHeader>
      <Divider sx={{ bgcolor: "#fff", flexShrink: 0 }} />
      <List
        ref={listRef}
        sx={{
          pl: open ? "15px" : "5px",
          pr: open ? "15px" : "5px",
          flexGrow: 1,
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#9ec9f0 transparent",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9ec9f0",
            borderRadius: "8px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#74b5ee" },
          "&::-webkit-scrollbar-thumb:active": { backgroundColor: "#509CDB" },
        }}
      >
        {listItemsMenu.map((item, index) => {
          const isSelected = item.path
            ? location.pathname === item.path
            : false;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isThisSubmenuOpen = openSubMenu === item.text;
          return (
            <div
              key={`${item.text}-${index}`}
              ref={
                item.text === "Configurações" ? settingsAnchorRef : undefined
              }
            >
              <ListItem
                disablePadding
                sx={{
                  bgcolor: isSelected && !hasSubItems ? "#509CDB" : "inherit",
                  color: "#fff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: open ? "initial" : "center",
                  }}
                  onClick={() => {
                    if (hasSubItems) {
                      handleToggleSubMenu(item.text);
                    } else if (item.path && location.pathname !== item.path) {
                      navigateRouter(item.path);
                      setMenuTitle(item?.title);
                      if (openSubMenu) setOpenSubMenu(null);
                    }
                    if (isMobile) handleDrawerClose();
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center",
                      mr: open ? "15px" : "auto",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: { sx: { fontSize: "14px", fontWeight: "600" } },
                    }}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {hasSubItems && open && (
                    <>
                      {isThisSubmenuOpen ? (
                        <ExpandLess sx={{ color: "#fff" }} />
                      ) : (
                        <ExpandMore sx={{ color: "#fff" }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              {hasSubItems && (
                <Collapse in={isThisSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems?.map((subItem, subIdx) => {
                      const subIsSelected = location.pathname === subItem.path;
                      const hasNestedSubItems =
                        subItem?.subItems && subItem?.subItems.length > 0;
                      const isNestedSubmenuOpen =
                        openNestedSubMenu === subItem.text;
                      return (
                        <div key={`${subItem.text}-${subIdx}`}>
                          <ListItem
                            disablePadding
                            sx={{
                              bgcolor:
                                subIsSelected && !hasNestedSubItems
                                  ? "#509CDB"
                                  : "inherit",
                              color: "#fff",
                              borderRadius: "4px",
                              pl: open ? "23px" : "8px",
                              width: "100%",
                              minWidth: "100%",
                              display: "flex",
                              alignItems: "center",
                              overflow: "visible",
                            }}
                          >
                            <ListItemButton
                              ref={
                                item.text === "Configurações" && subIdx === 0
                                  ? firstSettingsItemRef
                                  : undefined
                              }
                              sx={{
                                minHeight: open ? 48 : 40,
                                px: 1,
                                py: 1,
                                justifyContent: open ? "initial" : "center",
                                width: "100%",
                                minWidth: "100%",
                                display: "flex",
                                alignItems: "center",
                                overflow: "visible",
                                textOverflow: "unset",
                                flex: "1 1 auto",
                                flexGrow: 1,
                                borderRadius: "4px",
                              }}
                              onClick={() => {
                                if (hasNestedSubItems) {
                                  handleToggleNestedSubMenu(subItem.text);
                                } else if (
                                  subItem.path &&
                                  location.pathname !== subItem.path
                                ) {
                                  navigateRouter(subItem.path);
                                  setMenuTitle(subItem.title);
                                }
                                if (isMobile) handleDrawerClose();
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 0,
                                  justifyContent: "center",
                                  mr: open ? "10px" : "auto",
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                slotProps={{
                                  primary: {
                                    sx: {
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      overflow: "visible",
                                      textOverflow: "unset",
                                      width: "100%",
                                      display: "block",
                                    },
                                  },
                                }}
                                sx={{
                                  opacity: open ? 1 : 0,
                                  flex: "1 1 auto",
                                  minWidth: 0,
                                  width: "100%",
                                  flexGrow: 1,
                                  margin: 0,
                                }}
                              />
                              {hasNestedSubItems && open && (
                                <>
                                  {isNestedSubmenuOpen ? (
                                    <ExpandLess
                                      sx={{ color: "#fff", fontSize: "20px" }}
                                    />
                                  ) : (
                                    <ExpandMore
                                      sx={{ color: "#fff", fontSize: "20px" }}
                                    />
                                  )}
                                </>
                              )}
                            </ListItemButton>
                          </ListItem>
                          {hasNestedSubItems && (
                            <Collapse
                              in={isNestedSubmenuOpen}
                              timeout="auto"
                              unmountOnExit
                            >
                              <List component="div" disablePadding>
                                {subItem.subItems?.map(
                                  (nestedItem, nestedIdx) => {
                                    const nestedIsSelected =
                                      location.pathname === nestedItem.path;
                                    return (
                                      <ListItem
                                        key={`${nestedItem.text}-${nestedIdx}`}
                                        disablePadding
                                        sx={{
                                          bgcolor: nestedIsSelected
                                            ? "#509CDB"
                                            : "inherit",
                                          color: "#fff",
                                          borderRadius: "4px",
                                          pl: open ? "50px" : "none",
                                        }}
                                      >
                                        <ListItemButton
                                          sx={{
                                            minHeight: open ? 44 : 36,
                                            px: 2,
                                            justifyContent: open
                                              ? "initial"
                                              : "center",
                                          }}
                                          onClick={() => {
                                            if (
                                              nestedItem.path &&
                                              location.pathname !==
                                                nestedItem.path
                                            ) {
                                              navigateRouter(nestedItem.path);
                                              setMenuTitle(nestedItem.title);
                                            }
                                            if (isMobile) handleDrawerClose();
                                          }}
                                        >
                                          <ListItemIcon
                                            sx={{
                                              minWidth: 0,
                                              justifyContent: "center",
                                              mr: open ? "10px" : "auto",
                                            }}
                                          >
                                            {nestedItem.icon}
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={nestedItem.text}
                                            slotProps={{
                                              primary: {
                                                sx: {
                                                  fontSize: "12px",
                                                  fontWeight: "400",
                                                },
                                              },
                                            }}
                                            sx={{ opacity: open ? 1 : 0 }}
                                          />
                                        </ListItemButton>
                                      </ListItem>
                                    );
                                  },
                                )}
                              </List>
                            </Collapse>
                          )}
                        </div>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <img
          src={open ? SvgIcons.MagistterWhite : IconMagistter}
          alt={open ? "Magistter" : "Magistter Icon"}
          style={{
            width: open ? "163px" : "24px",
            height: "auto",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: drawerWidth,
              backgroundColor: "#006DAB",
              borderRight: "none",
            },
          }}
        >
          {drawerInnerContent}
        </Drawer>
        <ModalAlterUnit
          open={openModalAlterUnit}
          onClose={() => setOpenModalAlterUnit(false)}
        />
      </>
    );
  }

  return (
    <>
      <CustomDrawer open={open} drawerWidth={drawerWidth} variant="permanent">
        {drawerInnerContent}
      </CustomDrawer>
      <ModalAlterUnit
        open={openModalAlterUnit}
        onClose={() => setOpenModalAlterUnit(false)}
      />
    </>
  );
};
export default MenuVertical;