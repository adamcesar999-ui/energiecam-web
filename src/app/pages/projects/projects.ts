import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService, Project } from '../../services/project';
import { Router } from '@angular/router';
import { PdfService } from '../../services/pdf';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private pdfService: PdfService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteProject(id: number) {
    if (!confirm(this.t('Supprimer ce projet ?', 'Delete this project?'))) return;
    this.projectService.delete(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  deleteAll() {
    if (!confirm(this.t('Supprimer TOUS vos projets ? Cette action est irréversible.', 'Delete ALL your projects? This action cannot be undone.'))) return;
    this.projectService.deleteAll().subscribe({
      next: () => this.loadProjects()
    });
  }

  viewProject(project: Project) {
    ProjectService.selectedProject = project;
    if (project.type === 'solaire') {
      this.router.navigate(['/calculator'], { queryParams: { load: project.id } });
    } else {
      this.router.navigate(['/wind-calculator'], { queryParams: { load: project.id } });
    }
  }

  async exportProjectPDF(project: Project) {
    await this.pdfService.exportProjectPDF(
      project.name || 'Rapport',
      project.result_data,
      project.type
    );
  }

  // ✅ Méthode ajoutée pour correspondre à l'appel (click)="exportPDF(p)" dans le template
  exportPDF(project: Project) {
    this.exportProjectPDF(project);
  }

  generatePDFHTML(project: Project): string {
    const data = project.result_data;
    const isSolar = project.type === 'solaire';
    const date = project.created_at ? new Date(project.created_at).toLocaleString('fr-FR') : '';

    let body = '';

    if (isSolar) {
      body = `
        <div class="section">
          <h2>☀️ Résultats du Dimensionnement Solaire</h2>
          <div class="grid">
            <div class="box"><div class="val">${data.nPanels}</div><div class="lbl">Panneaux solaires (${data.panelPower}Wc)</div></div>
            <div class="box"><div class="val">${data.actualPower}</div><div class="lbl">Puissance crête (Wc)</div></div>
            <div class="box"><div class="val">${data.battCapAh}</div><div class="lbl">Capacité batteries (Ah)</div></div>
            <div class="box"><div class="val">${data.nBatt}</div><div class="lbl">Nombre de batteries</div></div>
            <div class="box"><div class="val">${data.regCurrent}</div><div class="lbl">Régulateur MPPT (A)</div></div>
            <div class="box"><div class="val">${data.inverterKva}</div><div class="lbl">Onduleur (kVA)</div></div>
          </div>
        </div>
        <div class="section">
          <h2>💰 Estimation des Coûts</h2>
          <table><thead><tr><th>Composant</th><th>Coût (FCFA)</th></tr></thead><tbody>
            <tr><td>Panneaux (${data.nPanels} unités)</td><td>${data.costPanels.toLocaleString()}</td></tr>
            <tr><td>Batteries (${data.nBatt} unités)</td><td>${data.costBatt.toLocaleString()}</td></tr>
            <tr><td>Régulateur MPPT</td><td>${data.costReg.toLocaleString()}</td></tr>
            <tr><td>Onduleur</td><td>${data.costInv.toLocaleString()}</td></tr>
            <tr><td>Installation & câblage</td><td>${data.costInstall.toLocaleString()}</td></tr>
            <tr><td><strong>TOTAL</strong></td><td><strong>${data.costTotal.toLocaleString()} FCFA</strong></td></tr>
          </tbody></table>
        </div>
        <div class="section">
          <h2>📍 Localisation & Paramètres</h2>
          <div class="grid2">
            <div><strong>Ville :</strong> ${data.city}</div>
            <div><strong>Ensoleillement :</strong> ${data.sunHours} kWh/m²/j</div>
            <div><strong>Autonomie :</strong> ${data.autonomyDays} jours</div>
            <div><strong>Tension système :</strong> ${data.voltage}V</div>
          </div>
        </div>
      `;
    } else {
      body = `
        <div class="section">
          <h2>💨 Résultats du Dimensionnement Éolien</h2>
          <div class="grid">
            <div class="box"><div class="val">${data.nTurb}</div><div class="lbl">Éoliennes</div></div>
            <div class="box"><div class="val">${data.D}</div><div class="lbl">Diamètre rotor (m)</div></div>
            <div class="box"><div class="val">${data.mast}</div><div class="lbl">Hauteur mât (m)</div></div>
            <div class="box"><div class="val">${data.A}</div><div class="lbl">Surface balayée (m²)</div></div>
          </div>
        </div>
        <div class="section">
          <h2>💰 Coût Total Estimé</h2>
          <div style="font-size:1.5rem;font-weight:800;color:#27AE60;">${data.totalCost.toLocaleString()} FCFA</div>
          <p>Modèle recommandé : ${data.rec.name} (${data.rec.brand})</p>
        </div>
        <div class="section">
          <h2>📍 Paramètres</h2>
          <div class="grid2">
            <div><strong>Région :</strong> ${data.region}</div>
            <div><strong>Vitesse du vent :</strong> ${data.windSpeed} m/s</div>
            <div><strong>Puissance requise :</strong> ${data.requiredPower} W</div>
            <div><strong>Efficacité turbine :</strong> ${data.efficiency}%</div>
          </div>
        </div>
      `;
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${project.name}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;margin:0;padding:0;color:#1A1A2E;}
      .header{background:linear-gradient(135deg,#F5A623,#27AE60);padding:40px;color:white;text-align:center;}
      .header h1{font-size:2rem;margin:0 0 8px;}
      .header p{margin:0;opacity:.9;}
      .section{padding:30px 40px;border-bottom:1px solid #eee;}
      .section h2{color:#F5A623;font-size:1.2rem;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #F5A623;}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
      .box{background:#f8f9fa;border-radius:8px;padding:16px;text-align:center;border:1px solid #e0e0e0;}
      .box .val{font-size:1.8rem;font-weight:800;color:#F5A623;}
      .box .lbl{font-size:.8rem;color:#666;margin-top:4px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#F5A623;color:white;padding:10px;text-align:left;}
      td{padding:10px;border-bottom:1px solid #eee;}
      .footer{background:#1A1A2E;color:white;padding:20px 40px;text-align:center;font-size:.85rem;}
      @media print{body{margin:0;}}
    </style></head><body>
    <div class="header">
      <h1>⚡ EnergieCam – Rapport de Dimensionnement</h1>
      <p>${project.name} | Date : ${date}</p>
      <p>Créé par : NJOCK YAMB CESAR ADAM – Ingénieur Logiciel | 2026</p>
    </div>
    ${body}
    <div class="footer">
      <p>EnergieCam v1.0 | © 2026 | Données PVGIS intégrées</p>
    </div>
    </body></html>`;
  }
}
