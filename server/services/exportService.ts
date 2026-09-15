import { HospitalRecord, OrganizationItem } from '../../src/types.js';

export function exportToCSV(items: OrganizationItem[]): string {
  const headers = [
    'Name',
    'Type',
    'Category',
    'Business/Hospital Type',
    'Specialities',
    'Phone',
    'Emergency Phone',
    'Email',
    'Website',
    'Address',
    'Area',
    'City',
    'State',
    'Postal Code',
    'Latitude',
    'Longitude',
    'Distance (km)',
    'Verification Status',
    'Verification Score',
    'Primary Source',
    'Source URL',
    'Last Verified'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map((item) => {
    const isHosp = item.type === 'hospital';
    const hosp = item as HospitalRecord;

    return [
      escapeCSV(item.name),
      escapeCSV(item.type),
      escapeCSV(item.category),
      escapeCSV(isHosp ? hosp.hospital_type : (item as any).business_type || ''),
      escapeCSV(isHosp && hosp.specialities ? hosp.specialities.join(', ') : ''),
      escapeCSV(item.normalized_phone || item.phone),
      escapeCSV(isHosp ? hosp.emergency_phone : ''),
      escapeCSV(item.email),
      escapeCSV(item.website),
      escapeCSV(item.address),
      escapeCSV(item.area),
      escapeCSV(item.city),
      escapeCSV(item.state),
      escapeCSV(item.postal_code),
      item.latitude,
      item.longitude,
      item.distance_km,
      escapeCSV(item.verification_status),
      item.verification_score,
      escapeCSV(item.source_name),
      escapeCSV(item.source_url),
      escapeCSV(item.last_verified)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportToExcelXML(items: OrganizationItem[]): string {
  // Generates genuine Microsoft Excel XML Spreadsheet format (opens directly in Excel with full formatting)
  const rows = items
    .map((item) => {
      const isHosp = item.type === 'hospital';
      const hosp = item as HospitalRecord;
      const clean = (val: any) =>
        String(val || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      return `
      <Row>
        <Cell><Data ss:Type="String">${clean(item.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.type)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.category)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(isHosp ? hosp.hospital_type : (item as any).business_type)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(isHosp && hosp.specialities ? hosp.specialities.join(', ') : '')}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.normalized_phone)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(isHosp ? hosp.emergency_phone : '')}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.email)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.website)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.address)}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.city)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.latitude}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.longitude}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.distance_km}</Data></Cell>
        <Cell><Data ss:Type="String">${clean(item.verification_status)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.verification_score}</Data></Cell>
      </Row>`;
    })
    .join('\n');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Discovered Organizations">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Name</Data></Cell>
    <Cell><Data ss:Type="String">Type</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Classification</Data></Cell>
    <Cell><Data ss:Type="String">Specialities</Data></Cell>
    <Cell><Data ss:Type="String">Phone</Data></Cell>
    <Cell><Data ss:Type="String">Emergency Phone</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
    <Cell><Data ss:Type="String">Website</Data></Cell>
    <Cell><Data ss:Type="String">Address</Data></Cell>
    <Cell><Data ss:Type="String">City</Data></Cell>
    <Cell><Data ss:Type="String">Latitude</Data></Cell>
    <Cell><Data ss:Type="String">Longitude</Data></Cell>
    <Cell><Data ss:Type="String">Distance (km)</Data></Cell>
    <Cell><Data ss:Type="String">Verification Status</Data></Cell>
    <Cell><Data ss:Type="String">Verification Score</Data></Cell>
   </Row>
   ${rows}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function exportToJSON(items: OrganizationItem[]): string {
  return JSON.stringify(items, null, 2);
}
