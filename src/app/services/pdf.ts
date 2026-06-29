import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  async exportToPDF(elementId: string, filename: string = 'rapport-energiecam.pdf') {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Afficher un indicateur de chargement
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    try {
      // Cacher les boutons pendant l'export
      const noPrintEls = element.querySelectorAll('.no-print');
      noPrintEls.forEach((el: any) => el.style.display = 'none');

      // Attendre que le DOM se mette à jour
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Si le contenu est plus grand qu'une page, on divise en plusieurs pages
      const pageHeightPx = pdfHeight / ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pageHeightPx;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeightPx;
      }

      pdf.save(filename);
      // Remettre les boutons
      noPrintEls.forEach((el: any) => el.style.display = '');

    } finally {
      document.body.style.overflow = originalOverflow;
    }
  }

  async exportProjectPDF(projectName: string, projectData: any, type: string) {
    // Créer un élément HTML temporaire avec toutes les données
    const tempDiv = document.createElement('div');
    tempDiv.id = 'pdf-export-temp';
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#1A1A2E';
    tempDiv.style.fontFamily = 'Segoe UI, sans-serif';
    tempDiv.style.padding = '40px';

    const isSolar = type === 'solaire';
    const date = new Date().toLocaleString('fr-FR');

    tempDiv.innerHTML = `
      <div style="background: linear-gradient(135deg,#F5A623,#27AE60); padding:30px; text-align:center; color:white; border-radius:12px; margin-bottom:24px;">
        <h1 style="margin:0; font-size:1.8rem;">⚡ EnergieCam</h1>
        <p style="margin:8px 0 0;">Rapport de Dimensionnement Professionnel</p>
        <p style="margin:4px 0 0; opacity:0.9; font-size:0.9rem;">${projectName} | ${date}</p>
        <p style="margin:4px 0 0; opacity:0.8; font-size:0.85rem;">Créé par NJOCK YAMB CESAR ADAM – Ingénieur Logiciel | 2026</p>
      </div>

      ${isSolar ? `
      <div style="margin-bottom:24px;">
        <h2 style="color:#F5A623; border-bottom:2px solid #F5A623; padding-bottom:8px;">☀️ Résultats Solaires</h2>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:16px;">
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#F5A623;">${projectData.nPanels}</div>
            <div style="font-size:0.85rem; color:#666;">Panneaux (${projectData.panelPower}Wc)</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#F5A623;">${projectData.battCapAh || Math.round(projectData.battCapAh)}</div>
            <div style="font-size:0.85rem; color:#666;">Batteries (Ah)</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#F5A623;">${projectData.nBatt}</div>
            <div style="font-size:0.85rem; color:#666;">Nombre batteries</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#F5A623;">${projectData.regCurrent}A</div>
            <div style="font-size:0.85rem; color:#666;">Régulateur MPPT</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#F5A623;">${projectData.inverterKva} kVA</div>
            <div style="font-size:0.85rem; color:#666;">Onduleur</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#27AE60;">${projectData.costTotal?.toLocaleString()}</div>
            <div style="font-size:0.85rem; color:#666;">Coût total (FCFA)</div>
          </div>
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <h2 style="color:#F5A623; border-bottom:2px solid #F5A623; padding-bottom:8px;">💰 Détail des Coûts</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <thead>
            <tr style="background:#F5A623; color:white;">
              <th style="padding:10px; text-align:left;">Composant</th>
              <th style="padding:10px; text-align:right;">Coût (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">Panneaux solaires</td><td style="padding:10px; text-align:right;">${projectData.costPanels?.toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">Batteries</td><td style="padding:10px; text-align:right;">${projectData.costBatt?.toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">Régulateur MPPT</td><td style="padding:10px; text-align:right;">${projectData.costReg?.toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">Onduleur</td><td style="padding:10px; text-align:right;">${projectData.costInv?.toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">Installation</td><td style="padding:10px; text-align:right;">${projectData.costInstall?.toLocaleString()}</td></tr>
            <tr style="background:#f8f9fa; font-weight:bold;"><td style="padding:10px;">TOTAL</td><td style="padding:10px; text-align:right; color:#27AE60;">${projectData.costTotal?.toLocaleString()} FCFA</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2 style="color:#F5A623; border-bottom:2px solid #F5A623; padding-bottom:8px;">📍 Localisation & Paramètres</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;">
          <div><strong>Ville :</strong> ${projectData.city || 'Non spécifiée'}</div>
          <div><strong>Ensoleillement :</strong> ${projectData.sunHours} kWh/m²/j</div>
          <div><strong>Autonomie :</strong> ${projectData.autonomyDays} jours</div>
          <div><strong>Tension :</strong> ${projectData.voltage}V</div>
        </div>
      </div>
      ` : `
      <div style="margin-bottom:24px;">
        <h2 style="color:#2980B9; border-bottom:2px solid #2980B9; padding-bottom:8px;">💨 Résultats Éoliens</h2>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:16px;">
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#2980B9;">${projectData.nTurb}</div>
            <div style="font-size:0.85rem; color:#666;">Éoliennes</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#2980B9;">${projectData.D}m</div>
            <div style="font-size:0.85rem; color:#666;">Diamètre rotor</div>
          </div>
          <div style="background:#f8f9fa; border-radius:8px; padding:16px; text-align:center;">
            <div style="font-size:2rem; font-weight:800; color:#27AE60;">${projectData.totalCost?.toLocaleString()}</div>
            <div style="font-size:0.85rem; color:#666;">Coût total (FCFA)</div>
          </div>
        </div>
      </div>
      `}

      <div style="background:#1A1A2E; color:white; padding:20px; text-align:center; border-radius:8px; margin-top:24px;">
        <p style="margin:0;">EnergieCam v1.0 | © 2026 NJOCK YAMB CESAR ADAM – Ingénieur Logiciel</p>
        <p style="margin:4px 0 0; opacity:0.7; font-size:0.85rem;">Données PVGIS intégrées | Rapport généré automatiquement</p>
      </div>
    `;

    document.body.appendChild(tempDiv);

    try {
      await this.exportToPDF('pdf-export-temp', `${projectName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } finally {
      document.body.removeChild(tempDiv);
    }
  }
}
