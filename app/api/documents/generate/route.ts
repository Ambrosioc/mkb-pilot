import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateDocumentPDF, generateDocumentNumber, arrayBufferToBase64, DocumentData } from '@/lib/pdf-generator';

// Vérification de l'authentification
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// Enregistrement du document dans la base de données
async function saveDocument(
  userId: string,
  documentData: DocumentData,
  pdfBase64: string
) {
  try {
    // Calculer les montants
    let totalHT = 0;
    let totalTVA = 0;
    
    documentData.items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      totalHT += itemTotal;
      totalTVA += itemTotal * (item.taxRate / 100);
    });
    
    const totalTTC = totalHT + totalTVA;
    
    // Récupérer l'ID du véhicule à partir de la référence
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('cars_v2')
      .select('id')
      .eq('reference', documentData.vehicle.reference)
      .single();
    
    if (vehicleError) {
      console.error('Erreur lors de la récupération du véhicule:', vehicleError);
      return null;
    }
    
    // Récupérer l'ID du contact à partir de l'email
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', documentData.customer.email)
      .single();
    
    if (contactError) {
      console.error('Erreur lors de la récupération du contact:', contactError);
      return null;
    }
    
    // Insérer le document dans la base de données
    const { data, error } = await supabase
      .from('sales_documents')
      .insert({
        type: documentData.type,
        number: documentData.number,
        vehicle_id: vehicleData.id,
        contact_id: contactData.id,
        date: documentData.date.toISOString(),
        due_date: documentData.dueDate?.toISOString(),
        base_price: totalHT,
        tva_rate: documentData.items[0]?.taxRate || 20,
        tva_amount: totalTVA,
        final_price: totalTTC,
        notes: documentData.notes,
        payment_terms: documentData.paymentTerms,
        status: 'created',
        pdf_url: null,
        pdf_content: pdfBase64,
        created_by: userId
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Erreur lors de l\'enregistrement du document:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du document:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Générer un numéro de document si non fourni
    if (!body.number) {
      body.number = generateDocumentNumber(body.type);
    }
    
    // Convertir les dates
    if (body.date) {
      body.date = new Date(body.date);
    } else {
      body.date = new Date();
    }
    
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }
    
    // Générer le PDF
    const pdfBytes = await generateDocumentPDF(body);
    const pdfBase64 = arrayBufferToBase64(pdfBytes);
    
    // Enregistrer le document dans la base de données
    const documentId = await saveDocument(user.id, body, pdfBase64);
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'enregistrement du document' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      documentId,
      documentNumber: body.number,
      pdfBase64
    });
  } catch (error) {
    console.error('Erreur lors de la génération du document:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}