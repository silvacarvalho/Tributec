/**
 * Componente de Paginação Reutilizável
 * Integrado com Material-UI e resposta padronizada do backend
 */
import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

export interface PaginacaoMeta {
  pagina_atual: number;
  total_paginas: number;
  total_itens: number;
  itens_por_pagina: number;
  tem_proxima: boolean;
  tem_anterior: boolean;
}

interface PaginationProps {
  paginacao: PaginacaoMeta;
  onPageChange: (pagina: number) => void;
  onLimitChange?: (limite: number) => void;
  showLimitSelector?: boolean;
  limitOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  paginacao,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  limitOptions = [10, 20, 50, 100]
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const handleLimitChange = (event: any) => {
    const newLimit = Number(event.target.value);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  // Calcula o range de itens exibidos
  const primeiroItem = (paginacao.pagina_atual - 1) * paginacao.itens_por_pagina + 1;
  const ultimoItem = Math.min(
    paginacao.pagina_atual * paginacao.itens_por_pagina,
    paginacao.total_itens
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Informação de itens */}
      <Typography variant="body2" color="text.secondary">
        Exibindo {primeiroItem} a {ultimoItem} de {paginacao.total_itens} {paginacao.total_itens === 1 ? 'item' : 'itens'}
      </Typography>

      {/* Controles de paginação */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Seletor de limite */}
        {showLimitSelector && onLimitChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="pagination-limit-label">Itens por página</InputLabel>
            <Select
              labelId="pagination-limit-label"
              id="pagination-limit"
              value={paginacao.itens_por_pagina}
              label="Itens por página"
              onChange={handleLimitChange}
            >
              {limitOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Componente de paginação do MUI */}
        {paginacao.total_paginas > 1 && (
          <MuiPagination
            count={paginacao.total_paginas}
            page={paginacao.pagina_atual}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            disabled={paginacao.total_itens === 0}
          />
        )}
      </Box>
    </Box>
  );
};

export default Pagination;
