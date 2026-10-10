/**
 * Utility for exporting data to Microsoft Excel compatible spreadsheet files (.xlsx / .xml / .csv)
 * with complete UTF-8 support for Vietnamese characters and professional table formatting.
 */

export interface ExportColumn<T> {
  header: string
  key: keyof T | string
  formatter?: (value: unknown, item: T) => string | number
  width?: number
}

/**
 * Generates an XML Spreadsheet 2003 document (compatible with Excel .xls/.xlsx and modern office suites)
 * with custom styling, borders, and bold headers.
 */
export function exportToExcelXml<T>(options: {
  filename: string
  sheetName: string
  title: string
  subtitle?: string
  columns: ExportColumn<T>[]
  data: T[]
}) {
  const { filename, sheetName, title, subtitle, columns, data } = options

  const sanitizeXml = (str: unknown): string => {
    if (str === null || str === undefined) return ""
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${sanitizeXml(title)}</Title>
  <Author>FER202_Group4 Dormitory Management</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="0" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="0" ss:Size="16" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="SubtitleStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="0" ss:Size="11" ss:Italic="1" ss:Color="#4B5563"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#9CA3AF"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="0" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#EA580C" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataRowEven">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataRowOdd">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitizeXml(sheetName)}">
  <Table ss:DefaultRowHeight="20">`

  // Column definitions
  columns.forEach((col) => {
    const width = col.width || 120
    xml += `\n   <Column ss:Width="${width}"/>`
  })

  // Title Row
  xml += `\n   <Row ss:Height="30">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="TitleStyle">
     <Data ss:Type="String">${sanitizeXml(title)}</Data>
    </Cell>
   </Row>`

  // Subtitle Row
  if (subtitle) {
    xml += `\n   <Row ss:Height="20">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="SubtitleStyle">
     <Data ss:Type="String">${sanitizeXml(subtitle)}</Data>
    </Cell>
   </Row>`
  }

  // Blank row separator
  xml += `\n   <Row ss:Height="10"/>`

  // Table Headers
  xml += `\n   <Row ss:Height="26">`
  columns.forEach((col) => {
    xml += `\n    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitizeXml(col.header)}</Data></Cell>`
  })
  xml += `\n   </Row>`

  // Table Data Rows
  data.forEach((item, index) => {
    const rowStyle = index % 2 === 0 ? "DataRowEven" : "DataRowOdd"
    xml += `\n   <Row ss:Height="22">`

    columns.forEach((col) => {
      let rawVal = (item as Record<string, unknown>)[col.key as string]
      if (col.formatter) {
        rawVal = col.formatter(rawVal, item)
      }

      const isNumeric = typeof rawVal === "number"
      const type = isNumeric ? "Number" : "String"
      const formattedVal = sanitizeXml(rawVal)

      xml += `\n    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="${type}">${formattedVal}</Data></Cell>`
    })

    xml += `\n   </Row>`
  })

  // End Table & Worksheet
  xml += `\n  </Table>
 </Worksheet>
</Workbook>`

  // Trigger download as .xls (recognized by Excel with full XML formatting)
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".xls") || filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Alternative CSV export with UTF-8 BOM so Excel opens Vietnamese characters cleanly
 */
export function exportToCsv<T>(options: {
  filename: string
  columns: ExportColumn<T>[]
  data: T[]
}) {
  const { filename, columns, data } = options

  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",")

  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val = (item as Record<string, unknown>)[col.key as string]
        if (col.formatter) {
          val = col.formatter(val, item)
        }
        if (val === null || val === undefined) val = ""
        const strVal = String(val).replace(/"/g, '""')
        return `"${strVal}"`
      })
      .join(",")
  )

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
