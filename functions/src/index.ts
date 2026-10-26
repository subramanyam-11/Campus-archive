/**
 * Cloud Functions entrypoint for CampusArchive CCEAS Portal.
 * Exports typed Firestore triggers, Pub/Sub cron triggers, and callable APIs.
 */

export { onEventStatusChange } from './onEventStatusChange';
export { checkOverdueAtr } from './checkOverdueAtr';
export { generateCertificatePdf } from './generateCertificatePdf';
export { generateEventDossierPdf } from './generateEventDossierPdf';
export { setUserRole } from './setUserRole';
