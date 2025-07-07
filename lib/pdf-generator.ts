import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Fonction utilitaire pour nettoyer les caractères non-ASCII
function cleanTextForPDF(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u202F\u00A0]/g, ' ') // Remplacer les espaces insécables par des espaces normales
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Remplacer les caractères accentués par leurs équivalents ASCII
      const accents: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        'ñ': 'n',
        'ç': 'c',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ý': 'Y',
        'Ñ': 'N',
        'Ç': 'C'
      };
      return accents[char] || char;
    });
}

// Types pour la génération de PDF
export interface DocumentData {
  type: 'devis' | 'facture';
  number: string;
  date: Date;
  dueDate?: Date;
  customer: {
    name: string;
    address?: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    reference: string;
    color?: string;
    mileage?: number;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
  notes?: string;
  paymentTerms?: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    siret?: string;
    tva?: string;
  };
}

// Fonction pour générer un PDF de devis ou facture avec logo MKB
export async function generateDocumentPDF(data: DocumentData): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  
  // Ajouter une page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
  // Charger les polices
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Définir les couleurs MKB
  const mkbBlue = rgb(0.17, 0.73, 0.86); // #2bbbdc
  const mkbYellow = rgb(1, 0.84, 0); // #FFD700
  const blackColor = rgb(0.1, 0.1, 0.1);
  const grayColor = rgb(0.5, 0.5, 0.5);
  
  // Définir les marges
  const margin = 50;
  const width = page.getWidth() - 2 * margin;
  
  // Créer l'en-tête avec le logo MKB (simulé avec du texte stylisé)
  const headerHeight = 80;
  
  // Rectangle d'en-tête avec couleur MKB
  page.drawRectangle({
    x: margin,
    y: page.getHeight() - margin - headerHeight,
    width: width,
    height: headerHeight,
    color: mkbBlue,
  });
  
  // Logo MKB (texte stylisé)
  page.drawText('MKB', {
    x: margin + 20,
    y: page.getHeight() - margin - 30,
    size: 32,
    font: helveticaBold,
    color: rgb(1, 1, 1), // Blanc
  });
  
  page.drawText('AUTOMOBILE', {
    x: margin + 20,
    y: page.getHeight() - margin - 55,
    size: 16,
    font: helveticaBold,
    color: mkbYellow,
  });
  
  // Informations de l'entreprise (côté droit de l'en-tête)
  const companyInfo = [
    data.companyInfo.address,
    `Tél: ${data.companyInfo.phone}`,
    `Email: ${data.companyInfo.email}`,
    data.companyInfo.website || '',
    data.companyInfo.siret ? `SIRET: ${data.companyInfo.siret}` : '',
    data.companyInfo.tva ? `TVA: ${data.companyInfo.tva}` : '',
  ].filter((info): info is string => Boolean(info));
  
  let companyY = page.getHeight() - margin - 25;
  companyInfo.forEach((info, index) => {
    page.drawText(cleanTextForPDF(info), {
      x: page.getWidth() - margin - 200,
      y: companyY - (index * 12),
      size: 9,
      font: helvetica,
      color: rgb(1, 1, 1), // Blanc
    });
  });
  
  // Titre du document (après l'en-tête)
  const documentTitle = data.type === 'devis' ? 'DEVIS' : 'FACTURE';
  page.drawText(documentTitle, {
    x: page.getWidth() - margin - 150,
    y: page.getHeight() - margin - headerHeight - 30,
    size: 28,
    font: helveticaBold,
    color: mkbBlue,
  });
  
  // Informations du document
  const documentInfo = [
    `N° ${data.number}`,
    `Date: ${format(data.date, 'dd/MM/yyyy', { locale: fr })}`,
    data.dueDate ? `Échéance: ${format(data.dueDate, 'dd/MM/yyyy', { locale: fr })}` : '',
  ].filter(Boolean);
  
  let docInfoY = page.getHeight() - margin - headerHeight - 55;
  documentInfo.forEach((info, index) => {
    page.drawText(cleanTextForPDF(info), {
      x: page.getWidth() - margin - 150,
      y: docInfoY - (index * 15),
      size: 11,
      font: helvetica,
      color: blackColor,
    });
  });
  
  // Section client et véhicule
  const sectionTop = page.getHeight() - margin - headerHeight - 100;
  
  // Client
  page.drawText('CLIENT', {
    x: margin,
    y: sectionTop,
    size: 14,
    font: helveticaBold,
    color: mkbBlue,
  });
  
  const customerInfo = [
    data.customer.name,
    data.customer.address,
    `Email: ${data.customer.email}`,
    data.customer.phone ? `Tél: ${data.customer.phone}` : '',
  ].filter(Boolean);
  
  let customerY = sectionTop - 20;
  customerInfo.forEach((info, index) => {
    page.drawText(cleanTextForPDF(info || ''), {
      x: margin,
      y: customerY - (index * 12),
      size: 10,
      font: helvetica,
      color: blackColor,
    });
  });
  
  // Véhicule
  page.drawText('VÉHICULE', {
    x: page.getWidth() - margin - 200,
    y: sectionTop,
    size: 14,
    font: helveticaBold,
    color: mkbBlue,
  });
  
  const vehicleInfo = [
    `${data.vehicle.brand} ${data.vehicle.model} (${data.vehicle.year})`,
    `Ref: ${data.vehicle.reference}`,
    data.vehicle.color ? `Couleur: ${data.vehicle.color}` : '',
    data.vehicle.mileage ? `Kilometrage: ${data.vehicle.mileage.toLocaleString()} km` : '',
  ].filter((info): info is string => Boolean(info));
  
  let vehicleY = sectionTop - 20;
  vehicleInfo.forEach((info, index) => {
    page.drawText(cleanTextForPDF(info), {
      x: page.getWidth() - margin - 200,
      y: vehicleY - (index * 12),
      size: 10,
      font: helvetica,
      color: blackColor,
    });
  });
  
  // Tableau des articles
  const tableTop = sectionTop - 80;
  const rowHeight = 25;
  const colWidths = [width * 0.5, width * 0.15, width * 0.15, width * 0.2];
  
  // En-têtes du tableau avec couleur MKB
  page.drawRectangle({
    x: margin,
    y: tableTop - rowHeight,
    width: width,
    height: rowHeight,
    color: mkbBlue,
  });
  
  const headers = ['Description', 'Quantité', 'Prix unitaire', 'Total HT'];
  headers.forEach((header, i) => {
    let xPos = margin;
    for (let j = 0; j < i; j++) {
      xPos += colWidths[j];
    }
    xPos += 5; // Padding
    
    page.drawText(header, {
      x: xPos,
      y: tableTop - rowHeight + 8,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1), // Blanc
    });
  });
  
  // Contenu du tableau
  let currentY = tableTop - rowHeight - 5;
  
  data.items.forEach((item, index) => {
    // Alterner les couleurs de fond
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: currentY - rowHeight,
        width: width,
        height: rowHeight,
        color: rgb(0.95, 0.95, 0.95), // Gris très clair
      });
    }
    
    // Description
    page.drawText(cleanTextForPDF(item.description), {
      x: margin + 5,
      y: currentY - rowHeight + 8,
      size: 10,
      font: helvetica,
      color: blackColor,
    });
    
    // Quantité
    page.drawText(item.quantity.toString(), {
      x: margin + colWidths[0] + 5,
      y: currentY - rowHeight + 8,
      size: 10,
      font: helvetica,
      color: blackColor,
    });
    
    // Prix unitaire
    page.drawText(`${item.unitPrice.toFixed(2)} €`, {
      x: margin + colWidths[0] + colWidths[1] + 5,
      y: currentY - rowHeight + 8,
      size: 10,
      font: helvetica,
      color: blackColor,
    });
    
    // Total HT
    const totalHT = item.quantity * item.unitPrice;
    page.drawText(`${totalHT.toFixed(2)} €`, {
      x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      y: currentY - rowHeight + 8,
      size: 10,
      font: helvetica,
      color: blackColor,
    });
    
    currentY -= rowHeight;
  });
  
  // Calculs des totaux
  const totalHT = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTVA = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const totalTTC = totalHT + totalTVA;
  
  // Section des totaux
  const totalsY = currentY - 20;
  const totalsX = page.getWidth() - margin - 200;
  
  page.drawText('TOTAL HT:', {
    x: totalsX,
    y: totalsY,
    size: 12,
    font: helveticaBold,
    color: blackColor,
  });
  
  page.drawText(`${totalHT.toFixed(2)} €`, {
    x: totalsX + 100,
    y: totalsY,
    size: 12,
    font: helveticaBold,
    color: blackColor,
  });
  
  page.drawText('TVA:', {
    x: totalsX,
    y: totalsY - 20,
    size: 12,
    font: helveticaBold,
    color: blackColor,
  });
  
  page.drawText(`${totalTVA.toFixed(2)} €`, {
    x: totalsX + 100,
    y: totalsY - 20,
    size: 12,
    font: helveticaBold,
    color: blackColor,
  });
  
  // Ligne de séparation
  page.drawLine({
    start: { x: totalsX, y: totalsY - 30 },
    end: { x: totalsX + 150, y: totalsY - 30 },
    thickness: 1,
    color: mkbBlue,
  });
  
  page.drawText('TOTAL TTC:', {
    x: totalsX,
    y: totalsY - 50,
    size: 14,
    font: helveticaBold,
    color: mkbBlue,
  });
  
  page.drawText(`${totalTTC.toFixed(2)} €`, {
    x: totalsX + 100,
    y: totalsY - 50,
    size: 14,
    font: helveticaBold,
    color: mkbBlue,
  });
  
  // Notes et conditions
  if (data.notes || data.paymentTerms) {
    const notesY = totalsY - 100;
    
    if (data.notes) {
      page.drawText('Notes:', {
        x: margin,
        y: notesY,
        size: 12,
        font: helveticaBold,
        color: mkbBlue,
      });
      
      page.drawText(cleanTextForPDF(data.notes || ''), {
        x: margin,
        y: notesY - 20,
        size: 10,
        font: helvetica,
        color: blackColor,
        maxWidth: width,
      });
    }
    
    if (data.paymentTerms) {
      page.drawText('Conditions de paiement:', {
        x: margin,
        y: notesY - 60,
        size: 12,
        font: helveticaBold,
        color: mkbBlue,
      });
      
      page.drawText(cleanTextForPDF(data.paymentTerms || ''), {
        x: margin,
        y: notesY - 80,
        size: 10,
        font: helvetica,
        color: blackColor,
        maxWidth: width,
      });
    }
  }
  
  // Pied de page
  const footerY = 50;
  page.drawText('MKB Automobile - Votre partenaire de confiance', {
    x: margin,
    y: footerY,
    size: 10,
    font: helveticaOblique,
    color: grayColor,
  });
  
  page.drawText(cleanTextForPDF(`Document genere le ${format(new Date(), 'dd/MM/yyyy a HH:mm', { locale: fr })}`), {
    x: page.getWidth() - margin - 200,
    y: footerY,
    size: 10,
    font: helveticaOblique,
    color: grayColor,
  });
  
  // Retourner le PDF en bytes
  return await pdfDoc.save();
}

// Générer un numéro de document unique
export function generateDocumentNumber(type: 'devis' | 'facture'): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const prefix = type === 'devis' ? 'D' : 'F';
  return `${prefix}${year}${month}-${random}`;
}

// Convertir un Uint8Array en Base64
export function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}