import jsPDF from 'jspdf';

export const generateWorkOrderPDF = async (workOrder) => {
  // Cargar configuración de impresión desde localStorage
  const printSettings = JSON.parse(localStorage.getItem('printTemplateSettings')) || {
    companyName: 'CMG HIDRÁULICA S.L.',
    companySubtitle: 'Reparación y Mantenimiento de Maquinaria Hidráulica',
    companyAddress: 'Polígono Industrial Norte, Calle Hidráulica 123, 46000 Valencia',
    companyPhone: '+34 961 234 567',
    companyEmail: 'info@cmghidraulica.com',
    companyWebsite: 'www.cmghidraulica.com',
    companyCIF: 'B-12345678',
    documentTitle: 'PARTE DE TRABAJO',
    footerText: 'CMG HIDRÁULICA S.L. - Especialistas en Reparación de Maquinaria Hidráulica',
    headerColor: '#2563eb',
    accentColor: '#1d4ed8'
  };

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Header empresarial compacto
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  // Logo y nombre de empresa
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(printSettings.companyName, margin, 15);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(printSettings.companySubtitle, margin, 22);
  
  // Información del documento en el header
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(printSettings.documentTitle, pageWidth - margin - 50, 15);
  
  pdf.setFontSize(12);
  pdf.text(workOrder.id, pageWidth - margin - 50, 22);

  yPosition = 35;

  // Información de la empresa compacta
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`${printSettings.companyAddress} | CIF: ${printSettings.companyCIF}`, margin, yPosition);
  yPosition += 4;
  pdf.text(`Tel: ${printSettings.companyPhone} | Email: ${printSettings.companyEmail}`, margin, yPosition);
  yPosition += 8;

  // Datos del Cliente y Máquina en dos columnas
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('DATOS DEL CLIENTE', margin + 2, yPosition + 4);
  pdf.text('DATOS DE LA MÁQUINA', pageWidth / 2 + 5, yPosition + 4);
  
  yPosition += 10;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  // Columna izquierda - Cliente
  const clientInfo = [
    `Cliente: ${workOrder.client}`,
    `Contacto: ${workOrder.clientContact}`,
    `Teléfono: ${workOrder.clientPhone || 'No especificado'}`,
    `Email: ${workOrder.clientEmail || 'No especificado'}`,
    `Ubicación: ${workOrder.location}`
  ];
  
  // Columna derecha - Máquina
  const machineInfo = [
    `Máquina: ${workOrder.machine}`,
    `Marca/Modelo: ${workOrder.brand} ${workOrder.model}`,
    `Matrícula: ${workOrder.plate}`,
    `Serie: ${workOrder.serial}`,
    `Tipo: ${workOrder.type} | Prioridad: ${workOrder.priority}`
  ];
  
  const maxLines = Math.max(clientInfo.length, machineInfo.length);
  for (let i = 0; i < maxLines; i++) {
    if (clientInfo[i]) {
      pdf.text(clientInfo[i], margin + 2, yPosition);
    }
    if (machineInfo[i]) {
      pdf.text(machineInfo[i], pageWidth / 2 + 5, yPosition);
    }
    yPosition += 4;
  }

  yPosition += 5;

  // Trabajos Realizados compacto
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('TRABAJOS REALIZADOS', margin + 2, yPosition + 4);
  
  yPosition += 10;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('Problema inicial:', margin + 2, yPosition);
  yPosition += 4;
  
  // Dividir texto en líneas más cortas
  const problemLines = pdf.splitTextToSize(workOrder.description, pageWidth - 2 * margin - 4);
  const maxProblemLines = Math.min(problemLines.length, 3); // Máximo 3 líneas
  for (let i = 0; i < maxProblemLines; i++) {
    pdf.text(problemLines[i], margin + 2, yPosition);
    yPosition += 3;
  }
  
  if (workOrder.workDescription) {
    yPosition += 2;
    pdf.text('Trabajos realizados:', margin + 2, yPosition);
    yPosition += 4;
    
    const workLines = pdf.splitTextToSize(workOrder.workDescription, pageWidth - 2 * margin - 4);
    const maxWorkLines = Math.min(workLines.length, 3); // Máximo 3 líneas
    for (let i = 0; i < maxWorkLines; i++) {
      pdf.text(workLines[i], margin + 2, yPosition);
      yPosition += 3;
    }
  }

  yPosition += 5;

  // Materiales Utilizados compacto
  const finalMaterials = workOrder.validatedMaterials || workOrder.materials || [];
  
  if (finalMaterials.length > 0) {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('MATERIALES UTILIZADOS', margin + 2, yPosition + 4);
    
    yPosition += 10;
    
    // Tabla compacta de materiales
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    
    const colWidths = [35, 70, 20, 20];
    const colPositions = [margin + 2, margin + 37, margin + 107, margin + 127];
    
    pdf.text('Referencia', colPositions[0], yPosition);
    pdf.text('Descripción', colPositions[1], yPosition);
    pdf.text('Cantidad', colPositions[2], yPosition);
    pdf.text('Unidad', colPositions[3], yPosition);
    
    yPosition += 4;
    
    // Mostrar máximo 8 materiales para que quepa en una página
    pdf.setFont('helvetica', 'normal');
    const maxMaterials = Math.min(finalMaterials.length, 8);
    for (let i = 0; i < maxMaterials; i++) {
      const material = finalMaterials[i];
      
      pdf.text(material.reference || 'N/A', colPositions[0], yPosition);
      
      // Truncar descripción
      const description = material.name.length > 30 ? material.name.substring(0, 27) + '...' : material.name;
      pdf.text(description, colPositions[1], yPosition);
      
      pdf.text(material.quantity.toString(), colPositions[2], yPosition);
      pdf.text(material.unit || 'ud', colPositions[3], yPosition);
      
      yPosition += 3;
    }
    
    if (finalMaterials.length > 8) {
      pdf.setFont('helvetica', 'italic');
      pdf.text(`... y ${finalMaterials.length - 8} materiales más`, margin + 2, yPosition);
      yPosition += 3;
    }
  }

  yPosition += 5;

  // Horas y Técnicos en dos columnas
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('HORAS DE TRABAJO', margin + 2, yPosition + 4);
  pdf.text('TÉCNICOS ASIGNADOS', pageWidth / 2 + 5, yPosition + 4);
  
  yPosition += 10;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  const finalHours = workOrder.validatedHours !== undefined ? workOrder.validatedHours : workOrder.workedHours;
  
  // Columna izquierda - Horas
  pdf.text(`Horas facturadas: ${finalHours}h`, margin + 2, yPosition);
  pdf.text(`Fecha: ${formatDate(new Date())}`, margin + 2, yPosition + 4);
  
  // Columna derecha - Técnicos
  if (workOrder.assignedTechnicians && workOrder.assignedTechnicians.length > 0) {
    workOrder.assignedTechnicians.forEach((tech, index) => {
      if (index < 4) { // Máximo 4 técnicos
        pdf.text(`• ${tech}`, pageWidth / 2 + 5, yPosition + (index * 4));
      }
    });
  }

  yPosition += 20;

  // Firma del Cliente compacta
  if (workOrder.clientSignature) {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('CONFORMIDAD DEL CLIENTE', margin + 2, yPosition + 4);
    
    yPosition += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Información de firma en dos columnas
    pdf.text(`Nombre: ${workOrder.clientSignature.clientName}`, margin + 2, yPosition);
    pdf.text(`Fecha: ${workOrder.clientSignature.signedDate}`, pageWidth / 2 + 5, yPosition);
    
    if (workOrder.clientSignature.clientPosition) {
      pdf.text(`Cargo: ${workOrder.clientSignature.clientPosition}`, margin + 2, yPosition + 4);
    }
    pdf.text('DNI: ___________________', pageWidth / 2 + 5, yPosition + 4);
    
    yPosition += 12;
    
    // Área de firma más pequeña
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin + 2, yPosition, 60, 20);
    pdf.setFontSize(7);
    pdf.text('Firma digital verificada', margin + 25, yPosition + 12);
    
    yPosition += 25;
    
    // Declaración de conformidad compacta
    pdf.setFillColor(240, 248, 255);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Declaración de conformidad:', margin + 2, yPosition + 4);
    
    pdf.setFont('helvetica', 'normal');
    const conformityText = 'El cliente confirma que el trabajo ha sido realizado satisfactoriamente y está conforme con el servicio prestado.';
    const conformityLines = pdf.splitTextToSize(conformityText, pageWidth - 2 * margin - 4);
    
    let conformityY = yPosition + 7;
    conformityLines.forEach(line => {
      pdf.text(line, margin + 2, conformityY);
      conformityY += 3;
    });
  }

  // Footer compacto
  const footerY = pageHeight - 15;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text(printSettings.footerText, pageWidth / 2, footerY, { align: 'center' });
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${printSettings.companyPhone} | ${printSettings.companyEmail} | ${printSettings.companyWebsite}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Guardar el PDF
  const fileName = `Parte_${workOrder.id}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
};