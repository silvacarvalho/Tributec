import { ReactNode, useRef } from 'react'
import { Box, Button, Paper } from '@mui/material'
import { Print as PrintIcon } from '@mui/icons-material'

interface PrintableDocumentProps {
  children: ReactNode
  title?: string
  buttonText?: string
}

export function PrintableDocument({ children, title = 'Documento', buttonText = 'Imprimir' }: PrintableDocumentProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                @media print {
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    font-size: 12pt;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                table th, table td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                table th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                h1, h2, h3 {
                  color: #1976d2;
                  margin-top: 20px;
                  margin-bottom: 10px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 2px solid #1976d2;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  text-align: center;
                  font-size: 10pt;
                  color: #666;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 10px 0;
                }
                .info-label {
                  font-weight: bold;
                }
                .total {
                  font-size: 14pt;
                  font-weight: bold;
                  color: #1976d2;
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <div class="footer">
                <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
                <p>Sistema de Gestão Tributária Municipal - Tributec</p>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  return (
    <Box>
      <Box className="no-print" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          {buttonText}
        </Button>
      </Box>
      <Paper ref={printRef} sx={{ p: 3 }}>
        {children}
      </Paper>
    </Box>
  )
}
