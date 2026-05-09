import React, { useState } from 'react';
import {
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  InsertDriveFile as XlsIcon,
} from '@mui/icons-material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactElement;
}

interface ExportTableProps<T = any> {
  data?: T[];
  filename?: string;
  enabledFormats?: ExportFormat[];
  columns?: Array<{
    key: string;
    label: string;
    getValue?: (item: T) => string | number;
  }>;
  title?: string;
  tooltip?: string;
  loadAllData?: () => Promise<T[]>;
  iconVariant?: 'download' | 'menu';
  size?: 'small' | 'medium';
  buttonSize?: 'small' | 'medium';

  layout?: 'menu' | 'single';
  singleFormat?: ExportFormat;
  buttonText?: string;
}

const ExportTable = <T extends Record<string, any>>({
  data = [],
  filename = 'dados_exportados',
  enabledFormats = ['pdf', 'csv', 'excel'],
  columns,
  title = 'Relatório',
  tooltip = 'Exportar dados',
  loadAllData,
  iconVariant = 'menu',
  size,
  buttonSize = 'small',

  layout = 'menu',
  singleFormat = 'pdf',
  buttonText,
}: ExportTableProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);
  const effectiveSize: 'small' | 'medium' = size ?? buttonSize ?? 'small';

  const exportOptions: ExportOption[] = [
    { format: 'pdf', label: 'PDF', icon: <PdfIcon fontSize="small" /> },
    { format: 'csv', label: 'CSV', icon: <CsvIcon fontSize="small" /> },
    { format: 'excel', label: 'Excel', icon: <XlsIcon fontSize="small" /> },
  ];

  const filteredOptions = exportOptions.filter(option =>
    enabledFormats.includes(option.format),
  );

  const singleOption = exportOptions.find(
    option => option.format === singleFormat,
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getColumnsConfig = (currentData: T[]) => {
    if (columns) return columns;
    if (!currentData.length) return [];

    return Object.keys(currentData[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      getValue: (item: T) => item[key]?.toString() || '',
    }));
  };

  const exportToPDF = async (dataToExport: T[]) => {
    const doc = new jsPDF();
    const columnsConfig = getColumnsConfig(dataToExport);

    doc.setFontSize(16);
    doc.text(title, 14, 20);

    autoTable(doc, {
      head: [columnsConfig.map(col => col.label)],
      body: dataToExport.map(item =>
        columnsConfig.map(col =>
          col.getValue ? col.getValue(item) : item[col.key] ?? '',
        ),
      ),
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save(`${filename}.pdf`);
  };

  const exportToCSV = async (dataToExport: T[]) => {
    const columnsConfig = getColumnsConfig(dataToExport);
    const headers = columnsConfig.map(c => c.label).join(',');

    const rows = dataToExport
      .map(item =>
        columnsConfig
          .map(col =>
            String(col.getValue ? col.getValue(item) : item[col.key] ?? ''),
          )
          .join(','),
      )
      .join('\n');

    const blob = new Blob(['\ufeff' + `${headers}\n${rows}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = async (dataToExport: T[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');
    const columnsConfig = getColumnsConfig(dataToExport);

    worksheet.columns = columnsConfig.map(col => ({
      header: col.label,
      key: col.key,
      width: 25,
    }));

    dataToExport.forEach(item => {
      const row: Record<string, any> = {};
      columnsConfig.forEach(col => {
        row[col.key] = col.getValue
          ? col.getValue(item)
          : item[col.key];
      });
      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xlsx`;
    link.click();
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);

      let dataToExport = data;
      if (loadAllData) dataToExport = await loadAllData();

      if (!dataToExport?.length) {
        setError('Não há dados para exportar');
        return;
      }

      if (format === 'pdf') await exportToPDF(dataToExport);
      if (format === 'csv') await exportToCSV(dataToExport);
      if (format === 'excel') await exportToExcel(dataToExport);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  if (layout === 'single' && singleOption) {
    return (
      <Box>
        <Tabs
          value={0}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: '#71717A',
              minHeight: 48,
              fontSize: '0.875rem',
              padding: '12px 16px',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              gap: 1,
              '&:hover': {
                color: '#374151',
                backgroundColor: '#F9FAFB',
              },
            },
            '& .Mui-selected': {
              color: '#181C32',
              backgroundColor: '#f1f1f1ff',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#181C32',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            icon={loading ? <CircularProgress size={16} /> : singleOption.icon}
            iconPosition="start"
            label={`Exportar ${singleOption.label}`}
            disabled={loading}
            onClick={() => handleExport(singleOption.format)}
          />
        </Tabs>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title={tooltip}>
        {buttonText ? (
          <Button
            onClick={handleClick}
            size={effectiveSize}
            disabled={loading}
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={16} />
              ) : iconVariant === 'menu' ? (
                <MenuRoundedIcon />
              ) : (
                <FileDownloadIcon />
              )
            }
            sx={{
              textTransform: 'none',
              color: '#6C757D',
              borderColor: '#E4E4E7',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            {buttonText}
          </Button>
        ) : (
          <IconButton
            onClick={handleClick}
            size={effectiveSize}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : iconVariant === 'menu' ? (
              <MenuRoundedIcon />
            ) : (
              <FileDownloadIcon />
            )}
          </IconButton>
        )}
        
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {error && (
          <MenuItem disabled>
            <Alert severity="error">{error}</Alert>
          </MenuItem>
        )}

        {filteredOptions.map(option => (
          <MenuItem
            key={option.format}
            onClick={() => handleExport(option.format)}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>Exportar {option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportTable;