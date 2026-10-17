/**
 * Online scan opens the vehicle page.
 * Offline scan opens the phone dialer.
 */
export function isUnassignedTag(vehicle) {
  if (!vehicle) return false;
  const plate = String(vehicle.registrationNumber || vehicle.vehicleNumber || '').trim().toUpperCase();
  const name = String(vehicle.ownerName || vehicle.customerName || '').trim().toLowerCase();
  const phone = String(vehicle.phoneNumber || '').replace(/\D/g, '');
  return (
    vehicle.status === 'unassigned' ||
    plate === 'UNASSIGNED' ||
    plate.startsWith('STOCK-') ||
    name.includes('unassigned') ||
    phone === '03000000000'
  );
}

export function decideScanResult({ browserOffline = false, lookupOk = false, networkFailed = false } = {}) {
  if (lookupOk && !browserOffline && !networkFailed) return 'page';
  if (browserOffline || networkFailed) return 'dial';
  return 'not_found';
}
