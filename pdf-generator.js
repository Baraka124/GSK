// pdf-generator.js - COMPLETE REWRITE WITH ALL IMPROVEMENTS
// Version: 3.0 - Advanced Clinical Report Generation
// Features: Bilingual Reports, Interactive PDFs, Charts, Executive Summaries


class ClinicalPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 0;
        this.config = {
            language: 'en', // 'en' or 'es'
            includeCharts: true,
            includeGuidelines: true,
            patientInfo: null,
            clinicianInfo: null,
            institutionInfo: null
        };
        
        // Color scheme for clinical reports
        this.colors = {
            primary: [28, 78, 128],    // Clinical blue
            secondary: [74, 139, 201], // Light blue
            accent: [214, 69, 80],     // Red for critical
            warning: [224, 122, 95],   // Orange
            success: [129, 178, 154],  // Green
            gray: [100, 100, 100]
        };
        
        // Bilingual text database
        this.text = {
            en: {
                // Report sections
                coverPage: 'COMPREHENSIVE CLINICAL ASSESSMENT',
                executiveSummary: 'EXECUTIVE SUMMARY',
                clinicalTraits: 'CLINICAL TRAITS DETAILS',
                networkAnalysis: 'CLINICAL NETWORK ANALYSIS',
                treatmentPathways: 'TREATMENT PATHWAYS & RECOMMENDATIONS',
                managementPlan: 'CLINICAL MANAGEMENT PLAN',
                biomarkerProfile: 'BIOMARKER PROFILE',
                guidelines: 'CLINICAL GUIDELINES',
                references: 'REFERENCES',
                
                // Labels
                patientInfo: 'PATIENT INFORMATION',
                clinicianInfo: 'CLINICIAN INFORMATION',
                reportInfo: 'REPORT INFORMATION',
                generatedOn: 'Generated on',
                reportId: 'Report ID',
                confidential: 'CONFIDENTIAL MEDICAL DOCUMENT - FOR CLINICAL USE ONLY',
                page: 'Page',
                of: 'of',
                
                // Clinical terms
                severity: 'Severity',
                category: 'Category',
                evaluation: 'Clinical Evaluation',
                biomarkers: 'Biomarkers',
                treatment: 'Treatment',
                evidence: 'Evidence Level',
                connections: 'Connections',
                critical: 'Critical',
                high: 'High',
                moderate: 'Moderate',
                low: 'Low',
                
                // Management plan
                immediateActions: 'IMMEDIATE ACTIONS (0-2 weeks)',
                shortTerm: 'SHORT-TERM MANAGEMENT (2-8 weeks)',
                longTerm: 'LONG-TERM FOLLOW-UP (8+ weeks)',
                monitoring: 'Monitoring',
                followUp: 'Follow-up',
                referrals: 'Referrals',
                patientEducation: 'Patient Education',
                
                // Recommendations
                recommendations: 'KEY RECOMMENDATIONS',
                priority: 'Priority',
                firstLine: 'First-line',
                secondLine: 'Second-line',
                nonPharmacological: 'Non-pharmacological'
            },
            es: {
                // Report sections
                coverPage: 'EVALUACIÓN CLÍNICA COMPREHENSIVA',
                executiveSummary: 'RESUMEN EJECUTIVO',
                clinicalTraits: 'DETALLES DE RASGOS CLÍNICOS',
                networkAnalysis: 'ANÁLISIS DE RED CLÍNICA',
                treatmentPathways: 'VÍAS DE TRATAMIENTO Y RECOMENDACIONES',
                managementPlan: 'PLAN DE MANEJO CLÍNICO',
                biomarkerProfile: 'PERFIL DE BIOMARCADORES',
                guidelines: 'GUÍAS CLÍNICAS',
                references: 'REFERENCIAS',
                
                // Labels
                patientInfo: 'INFORMACIÓN DEL PACIENTE',
                clinicianInfo: 'INFORMACIÓN DEL CLÍNICO',
                reportInfo: 'INFORMACIÓN DEL INFORME',
                generatedOn: 'Generado el',
                reportId: 'ID del informe',
                confidential: 'DOCUMENTO MÉDICO CONFIDENCIAL - PARA USO CLÍNICO SOLAMENTE',
                page: 'Página',
                of: 'de',
                
                // Clinical terms
                severity: 'Gravedad',
                category: 'Categoría',
                evaluation: 'Evaluación Clínica',
                biomarkers: 'Biomarcadores',
                treatment: 'Tratamiento',
                evidence: 'Nivel de Evidencia',
                connections: 'Conexiones',
                critical: 'Crítico',
                high: 'Alto',
                moderate: 'Moderado',
                low: 'Bajo',
                
                // Management plan
                immediateActions: 'ACCIONES INMEDIATAS (0-2 semanas)',
                shortTerm: 'MANEJO A CORTO PLAZO (2-8 semanas)',
                longTerm: 'SEGUIMIENTO A LARGO PLAZO (8+ semanas)',
                monitoring: 'Monitoreo',
                followUp: 'Seguimiento',
                referrals: 'Referencias',
                patientEducation: 'Educación del Paciente',
                
                // Recommendations
                recommendations: 'RECOMENDACIONES CLAVE',
                priority: 'Prioridad',
                firstLine: 'Primera línea',
                secondLine: 'Segunda línea',
                nonPharmacological: 'No farmacológico'
            }
        };
    }
    
    // ============================================================================
    // MAIN GENERATION METHODS
    // ============================================================================
    
    generateReport(data, options = {}) {
        try {
            console.log('Generating clinical report...');
            
            // Merge options with config
            this.config = { ...this.config, ...options };
            
            // Initialize PDF
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Set document properties
            this.setDocumentProperties();
            
            // Generate report sections
            this.generateCoverPage(data);
            this.doc.addPage();
            
            this.generateExecutiveSummary(data);
            this.doc.addPage();
            
            this.generateClinicalTraits(data);
            this.doc.addPage();
            
            if (data.connections && data.connections.length > 0) {
                this.generateNetworkAnalysis(data);
                this.doc.addPage();
            }
            
            this.generateTreatmentPathways(data);
            this.doc.addPage();
            
            this.generateManagementPlan(data);
            this.doc.addPage();
            
            this.generateBiomarkerProfile(data);
            
            if (this.config.includeGuidelines) {
                this.doc.addPage();
                this.generateGuidelines(data);
            }
            
            // Add table of contents and page numbers
            this.addTableOfContents();
            this.addPageNumbers();
            
            // Save the PDF
            const fileName = this.getFileName();
            this.doc.save(fileName);
            
            console.log('Report generated successfully');
            return { success: true, fileName };
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`Failed to generate PDF report: ${error.message}`);
        }
    }
    
    generateExecutiveReport(data, options = {}) {
        // One-page executive summary for quick review
        try {
            this.config = { ...this.config, ...options };
            
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            this.setDocumentProperties();
            this.generateExecutiveSummary(data, true); // One-page version
            this.addPageNumbers();
            
            const fileName = `Clinical_Executive_Summary_${this.getFormattedDate()}.pdf`;
            this.doc.save(fileName);
            
            return { success: true, fileName };
            
        } catch (error) {
            throw new Error(`Failed to generate executive report: ${error.message}`);
        }
    }
    
    generatePatientReport(data, options = {}) {
        // Simplified report for patients
        try {
            this.config = { ...this.config, ...options, language: 'es' }; // Default to Spanish for patients
            
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            this.setDocumentProperties();
            
            // Patient-friendly cover page
            this.generatePatientCoverPage(data);
            this.doc.addPage();
            
            // Simplified sections
            this.generatePatientSummary(data);
            this.doc.addPage();
            
            this.generatePatientTreatmentPlan(data);
            
            this.addPageNumbers();
            
            const fileName = `Patient_Report_${this.getFormattedDate()}.pdf`;
            this.doc.save(fileName);
            
            return { success: true, fileName };
            
        } catch (error) {
            throw new Error(`Failed to generate patient report: ${error.message}`);
        }
    }
    
    generateReferralLetter(data, options = {}) {
        // Professional referral letter template
        try {
            this.config = { ...this.config, ...options };
            
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            this.setDocumentProperties();
            this.generateLetterhead();
            this.generateReferralContent(data);
            this.generateSignatureBlock();
            
            const fileName = `Referral_Letter_${this.getFormattedDate()}.pdf`;
            this.doc.save(fileName);
            
            return { success: true, fileName };
            
        } catch (error) {
            throw new Error(`Failed to generate referral letter: ${error.message}`);
        }
    }
    
    // ============================================================================
    // CORE GENERATION METHODS
    // ============================================================================
    
    generateCoverPage(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        // Title
        this.doc.setFontSize(28);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.coverPage, this.pageWidth / 2, 50, { align: 'center' });
        
        // Subtitle
        this.doc.setFontSize(16);
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('TraitMap Pro Clinical Intelligence Platform v3.0', this.pageWidth / 2, 65, { align: 'center' });
        
        // Date and time
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.gray);
        const now = new Date();
        const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.doc.text(`${t.generatedOn}: ${dateStr} ${timeStr}`, this.pageWidth / 2, 80, { align: 'center' });
        
        // Report ID
        const reportId = `RPT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        this.doc.text(`${t.reportId}: ${reportId}`, this.pageWidth / 2, 90, { align: 'center' });
        
        // Patient information box
        if (this.config.patientInfo) {
            this.currentY = 110;
            this.drawSectionBox(t.patientInfo, 100, 40);
            
            this.doc.setFontSize(11);
            this.doc.setTextColor(0, 0, 0);
            
            const patientInfo = this.config.patientInfo;
            const infoLines = [
                `Name: ${patientInfo.name || 'Not specified'}`,
                `Age: ${patientInfo.age || 'Not specified'}`,
                `Gender: ${patientInfo.gender || 'Not specified'}`,
                `MRN: ${patientInfo.mrn || 'Not specified'}`
            ];
            
            infoLines.forEach((line, index) => {
                this.doc.text(line, this.margin + 10, this.currentY + 15 + (index * 7));
            });
        }
        
        // Clinical summary box
        this.currentY = 160;
        const metrics = data.metrics || { totalTraits: 0, totalConnections: 0, avgSeverity: 0, complexityScore: 0 };
        
        this.drawSectionBox('CLINICAL ASSESSMENT SUMMARY', 100, 50);
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        
        const summaryItems = [
            `${t.totalTraits}: ${metrics.totalTraits}`,
            `${t.connections}: ${metrics.totalConnections}`,
            `${t.avgSeverity}: ${metrics.avgSeverity}%`,
            `${t.complexityScore}: ${metrics.complexityScore}/100`
        ];
        
        summaryItems.forEach((item, index) => {
            this.doc.text(item, this.pageWidth / 2, this.currentY + 15 + (index * 7), { align: 'center' });
        });
        
        // Risk level indicator
        if (metrics.avgSeverity >= 80) {
            this.doc.setFillColor(...this.colors.accent);
            this.doc.setTextColor(255, 255, 255);
            this.doc.roundedRect(this.margin, 225, this.pageWidth - (2 * this.margin), 12, 3, 3, 'F');
            this.doc.text('⚠️  HIGH CLINICAL RISK - URGENT ATTENTION REQUIRED', this.pageWidth / 2, 232, { align: 'center', fontSize: 10 });
        } else if (metrics.avgSeverity >= 65) {
            this.doc.setFillColor(...this.colors.warning);
            this.doc.setTextColor(0, 0, 0);
            this.doc.roundedRect(this.margin, 225, this.pageWidth - (2 * this.margin), 12, 3, 3, 'F');
            this.doc.text('⚠️  MODERATE CLINICAL RISK - PRIORITY ATTENTION', this.pageWidth / 2, 232, { align: 'center', fontSize: 10 });
        }
        
        // Confidentiality notice
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.gray);
        this.doc.text(t.confidential, this.pageWidth / 2, 280, { align: 'center' });
        
        // Add decorative elements
        this.addDecorativeElements();
    }
    
    generateExecutiveSummary(data, onePage = false) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.executiveSummary, this.margin, this.currentY);
        
        // Divider line
        this.doc.setDrawColor(...this.colors.secondary);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY + 5, this.pageWidth - this.margin, this.currentY + 5);
        
        this.currentY += 15;
        
        const metrics = data.metrics || {};
        const analytics = data.analytics || {};
        
        // Summary text
        this.doc.setFontSize(11);
        this.doc.setTextColor(60, 60, 60);
        
        const summaryText = this.getExecutiveSummaryText(data, lang);
        const splitText = this.doc.splitTextToSize(summaryText, this.pageWidth - (2 * this.margin));
        this.doc.text(splitText, this.margin, this.currentY);
        
        this.currentY += (splitText.length * 5) + 10;
        
        if (onePage) {
            // Compact version for one-page report
            this.generateCompactMetrics(data);
            this.generateKeyRecommendations(data);
        } else {
            // Key insights box
            this.drawSectionBox('KEY INSIGHTS', 100, 60);
            
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            const insights = this.getKeyInsights(data);
            insights.forEach((insight, index) => {
                this.doc.text(insight, this.margin + 10, this.currentY + 15 + (index * 6));
            });
            
            this.currentY += 70;
            
            // Pattern detection
            if (analytics.patterns && analytics.patterns.length > 0) {
                this.generatePatternSummary(analytics.patterns);
            }
            
            // Risk predictions
            if (analytics.predictions && analytics.predictions.length > 0) {
                this.generateRiskPredictions(analytics.predictions);
            }
        }
        
        // Add visual summary if charts are enabled
        if (this.config.includeCharts && !onePage) {
            this.currentY += 10;
            this.generateVisualSummary(data);
        }
    }
    
    generateClinicalTraits(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.clinicalTraits, this.margin, this.currentY);
        
        this.currentY += 10;
        
        if (!data.traits || data.traits.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text('No clinical traits available for analysis.', this.margin, this.currentY);
            return;
        }
        
        // Severity distribution chart
        if (this.config.includeCharts) {
            this.generateSeverityChart(data.traits);
            this.currentY += 50;
        }
        
        // Create enhanced table
        const tableData = data.traits.map((trait, index) => [
            (index + 1).toString(),
            trait.name,
            trait.category,
            `${trait.severity}%`,
            trait.evidence?.level || 'C',
            trait.connections?.length || '0'
        ]);
        
        // Generate table with autoTable plugin
        this.doc.autoTable({
            startY: this.currentY,
            head: [['#', t.clinicalTraits, t.category, t.severity, t.evidence, t.connections]],
            body: tableData,
            headStyles: { 
                fillColor: this.colors.primary,
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 2
            },
            alternateRowStyles: { 
                fillColor: [245, 245, 245] 
            },
            margin: { left: this.margin, right: this.margin },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 60 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' }
            },
            styles: {
                overflow: 'linebreak',
                lineWidth: 0.1,
                lineColor: [200, 200, 200]
            },
            didDrawCell: (data) => {
                // Add color coding for severity cells
                if (data.column.index === 3 && data.cell.section === 'body') {
                    const severity = parseInt(data.cell.raw.replace('%', ''));
                    const color = this.getSeverityColor(severity);
                    this.doc.setFillColor(...color);
                    this.doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                    this.doc.setTextColor(255, 255, 255);
                    this.doc.text(data.cell.raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, { align: 'center' });
                }
            }
        });
        
        // Update current Y position after table
        this.currentY = this.doc.lastAutoTable.finalY + 10;
        
        // Top 3 traits with details
        if (data.traits.length > 0) {
            this.generateTopTraitsDetails(data.traits);
        }
    }
    
    generateNetworkAnalysis(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.networkAnalysis, this.margin, this.currentY);
        
        this.currentY += 15;
        
        const metrics = data.metrics || {};
        const analytics = data.analytics || {};
        
        // Network statistics
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        
        const stats = [
            `${t.totalTraits}: ${metrics.totalTraits || 0}`,
            `${t.connections}: ${metrics.totalConnections || 0}`,
            `Network Density: ${this.calculateNetworkDensity(metrics)}%`,
            `Average Connection Strength: ${metrics.avgConnectionStrength || 0}`
        ];
        
        stats.forEach((stat, index) => {
            this.doc.text(stat, this.margin, this.currentY + (index * 8));
        });
        
        this.currentY += 40;
        
        // Most connected traits
        if (data.traits && data.traits.length > 0) {
            const connectedTraits = [...data.traits]
                .sort((a, b) => (b.connections?.length || 0) - (a.connections?.length || 0))
                .slice(0, 5);
            
            if (connectedTraits.length > 0) {
                this.doc.setFontSize(14);
                this.doc.setTextColor(...this.colors.primary);
                this.doc.text('Most Connected Clinical Traits', this.margin, this.currentY);
                
                this.currentY += 10;
                
                this.doc.setFontSize(10);
                connectedTraits.forEach((trait, index) => {
                    this.doc.text(`${index + 1}. ${trait.name}`, this.margin + 5, this.currentY);
                    this.doc.text(`Connections: ${trait.connections?.length || 0}`, this.pageWidth - this.margin - 40, this.currentY);
                    this.currentY += 7;
                });
                
                this.currentY += 10;
            }
        }
        
        // Pattern detection results
        if (analytics.patterns && analytics.patterns.length > 0) {
            this.generatePatternDetails(analytics.patterns);
        }
        
        // Connection strength analysis
        if (data.connections && data.connections.length > 0) {
            this.currentY += 10;
            this.generateConnectionAnalysis(data.connections);
        }
        
        // Network visualization (if charts enabled)
        if (this.config.includeCharts && data.traits && data.traits.length > 0) {
            this.currentY += 10;
            this.generateNetworkVisualization(data);
        }
    }
    
    generateTreatmentPathways(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.treatmentPathways, this.margin, this.currentY);
        
        this.currentY += 15;
        
        if (!data.traits || data.traits.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text('No treatment recommendations available.', this.margin, this.currentY);
            return;
        }
        
        // Sort by severity and get top traits
        const sortedTraits = [...data.traits].sort((a, b) => b.severity - a.severity);
        const topTraits = sortedTraits.slice(0, Math.min(8, sortedTraits.length));
        
        // Treatment priority matrix
        this.generateTreatmentPriorityMatrix(topTraits);
        this.currentY += 50;
        
        // Detailed treatment pathways
        topTraits.forEach((trait, index) => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.currentY = 30;
            }
            
            this.generateTraitTreatmentPathway(trait, index + 1);
            this.currentY += 30;
        });
        
        // Treatment conflicts
        if (data.analytics?.conflicts) {
            this.currentY += 10;
            this.generateTreatmentConflicts(data.analytics.conflicts);
        }
    }
    
    generateManagementPlan(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.managementPlan, this.margin, this.currentY);
        
        this.currentY += 15;
        
        const metrics = data.metrics || {};
        const complexity = metrics.complexityScore || 0;
        
        // Complexity-based management level
        let managementLevel = 'standard';
        if (complexity >= 80) managementLevel = 'complex';
        else if (complexity >= 60) managementLevel = 'moderate';
        
        // Management level indicator
        this.doc.setFontSize(14);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(`Management Level: ${managementLevel.toUpperCase()}`, this.margin, this.currentY);
        
        this.currentY += 10;
        
        // Management phases
        const phases = [
            {
                title: t.immediateActions,
                items: this.getImmediateActions(managementLevel, lang)
            },
            {
                title: t.shortTerm,
                items: this.getShortTermActions(managementLevel, lang)
            },
            {
                title: t.longTerm,
                items: this.getLongTermActions(managementLevel, lang)
            }
        ];
        
        phases.forEach((phase, phaseIndex) => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.currentY = 30;
            }
            
            // Phase title
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.secondary);
            this.doc.text(phase.title, this.margin, this.currentY);
            this.currentY += 8;
            
            // Phase items
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            phase.items.forEach((item, itemIndex) => {
                if (this.currentY > 280) {
                    this.doc.addPage();
                    this.currentY = 30;
                }
                
                this.doc.text(`• ${item}`, this.margin + 5, this.currentY);
                this.currentY += 6;
            });
            
            this.currentY += 5;
        });
        
        // Monitoring plan
        this.currentY += 5;
        this.generateMonitoringPlan(data, managementLevel);
        
        // Referral recommendations
        if (complexity >= 70) {
            this.currentY += 10;
            this.generateReferralRecommendations(data);
        }
    }
    
    generateBiomarkerProfile(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.biomarkerProfile, this.margin, this.currentY);
        
        this.currentY += 15;
        
        if (!data.traits || data.traits.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text('No biomarker data available.', this.margin, this.currentY);
            return;
        }
        
        // Extract all biomarkers
        const allBiomarkers = [];
        data.traits.forEach(trait => {
            if (trait.biomarkers) {
                allBiomarkers.push(...trait.biomarkers);
            }
        });
        
        const uniqueBiomarkers = [...new Set(allBiomarkers)];
        
        if (uniqueBiomarkers.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text('No specific biomarkers identified.', this.margin, this.currentY);
            return;
        }
        
        // Group biomarkers by type
        const biomarkerGroups = this.groupBiomarkers(uniqueBiomarkers);
        
        // Generate biomarker table
        let tableData = [];
        Object.entries(biomarkerGroups).forEach(([group, biomarkers]) => {
            biomarkers.forEach(biomarker => {
                const frequency = allBiomarkers.filter(b => b === biomarker).length;
                const percentage = ((frequency / data.traits.length) * 100).toFixed(0);
                tableData.push([group, biomarker, `${frequency} (${percentage}%)`]);
            });
        });
        
        if (tableData.length > 0) {
            this.doc.autoTable({
                startY: this.currentY,
                head: [['Group', 'Biomarker', 'Frequency']],
                body: tableData,
                headStyles: { 
                    fillColor: this.colors.primary,
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: { fontSize: 9 },
                margin: { left: this.margin, right: this.margin },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 80 },
                    2: { cellWidth: 30, halign: 'center' }
                },
                styles: {
                    overflow: 'linebreak',
                    lineWidth: 0.1
                }
            });
            
            this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
        
        // Monitoring recommendations
        this.currentY += 5;
        this.generateBiomarkerMonitoring(uniqueBiomarkers, data.traits.length);
        
        // Interpretation guide
        if (this.config.language === 'es') {
            this.currentY += 10;
            this.generateBiomarkerInterpretation(uniqueBiomarkers);
        }
    }
    
    generateGuidelines(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(t.guidelines, this.margin, this.currentY);
        
        this.currentY += 15;
        
        // Get relevant guidelines based on traits
        const guidelines = this.getRelevantGuidelines(data.traits || []);
        
        if (guidelines.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text('No specific guidelines identified for this case.', this.margin, this.currentY);
            return;
        }
        
        // Display guidelines
        guidelines.forEach((guideline, index) => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.currentY = 30;
            }
            
            this.doc.setFontSize(12);
            this.doc.setTextColor(...this.colors.primary);
            this.doc.text(`${index + 1}. ${guideline.name}`, this.margin, this.currentY);
            
            this.currentY += 7;
            
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            if (guideline.description) {
                const descLines = this.doc.splitTextToSize(guideline.description, this.pageWidth - (2 * this.margin));
                this.doc.text(descLines, this.margin + 5, this.currentY);
                this.currentY += (descLines.length * 5) + 5;
            }
            
            if (guideline.recommendations) {
                guideline.recommendations.forEach((rec, recIndex) => {
                    if (this.currentY > 280) {
                        this.doc.addPage();
                        this.currentY = 30;
                    }
                    
                    this.doc.text(`• ${rec}`, this.margin + 10, this.currentY);
                    this.currentY += 6;
                });
            }
            
            this.currentY += 10;
        });
        
        // References
        this.currentY += 5;
        this.generateReferences(guidelines);
    }
    
    // ============================================================================
    // VISUALIZATION METHODS
    // ============================================================================
    
    generateSeverityChart(traits) {
        // Calculate distribution
        const distribution = {
            critical: traits.filter(t => t.severity >= 90).length,
            high: traits.filter(t => t.severity >= 80 && t.severity < 90).length,
            moderate: traits.filter(t => t.severity >= 65 && t.severity < 80).length,
            low: traits.filter(t => t.severity < 65).length
        };
        
        // Draw simple bar chart
        const chartStartX = this.margin;
        const chartStartY = this.currentY;
        const chartWidth = this.pageWidth - (2 * this.margin);
        const chartHeight = 40;
        
        // Chart background
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(chartStartX, chartStartY, chartWidth, chartHeight, 'F');
        
        // Chart border
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.5);
        this.doc.rect(chartStartX, chartStartY, chartWidth, chartHeight);
        
        // Calculate bar dimensions
        const maxCount = Math.max(...Object.values(distribution));
        const barWidth = 15;
        const barSpacing = 30;
        const baseY = chartStartY + chartHeight - 10;
        
        const colors = {
            critical: this.colors.accent,
            high: this.colors.warning,
            moderate: [242, 204, 143],
            low: this.colors.success
        };
        
        const labels = {
            critical: 'Critical',
            high: 'High',
            moderate: 'Moderate',
            low: 'Low'
        };
        
        // Draw bars
        Object.entries(distribution).forEach(([level, count], index) => {
            const x = chartStartX + 20 + (index * barSpacing);
            const barHeight = maxCount > 0 ? (count / maxCount) * (chartHeight - 20) : 0;
            const y = baseY - barHeight;
            
            // Draw bar
            this.doc.setFillColor(...colors[level]);
            this.doc.rect(x, y, barWidth, barHeight, 'F');
            
            // Draw count label
            this.doc.setFontSize(8);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(count.toString(), x + barWidth / 2, y - 5, { align: 'center' });
            
            // Draw level label
            this.doc.text(labels[level], x + barWidth / 2, baseY + 5, { align: 'center' });
        });
        
        // Chart title
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Severity Distribution', chartStartX + chartWidth / 2, chartStartY - 5, { align: 'center' });
        
        this.currentY += chartHeight + 15;
    }
    
    generateNetworkVisualization(data) {
        if (!data.traits || data.traits.length === 0) return;
        
        const centerX = this.pageWidth / 2;
        const centerY = this.currentY + 40;
        const radius = 30;
        
        // Draw network diagram
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Clinical Network Visualization', this.margin, this.currentY);
        
        this.currentY += 10;
        
        // Draw connections first (so they appear behind nodes)
        if (data.connections && data.connections.length > 0) {
            data.connections.forEach(conn => {
                const source = data.traits.find(t => t.id === conn.source);
                const target = data.traits.find(t => t.id === conn.target);
                
                if (source && target) {
                    // Simplified visualization - in real implementation would use actual positions
                    this.doc.setDrawColor(...this.colors.secondary);
                    this.doc.setLineWidth(conn.strength / 50); // Thicker lines for stronger connections
                    this.doc.setLineDash(conn.strength < 50 ? [2, 2] : []);
                    this.doc.line(
                        centerX - radius + (Math.random() * 50 - 25),
                        centerY - radius + (Math.random() * 50 - 25),
                        centerX + radius + (Math.random() * 50 - 25),
                        centerY + radius + (Math.random() * 50 - 25)
                    );
                    this.doc.setLineDash([]);
                }
            });
        }
        
        // Draw trait nodes
        data.traits.forEach((trait, index) => {
            const angle = (index * 2 * Math.PI) / data.traits.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Draw node circle
            const color = this.getCategoryColor(trait.category);
            this.doc.setFillColor(...color);
            this.doc.circle(x, y, 3, 'F');
            
            // Draw trait abbreviation
            this.doc.setFontSize(6);
            this.doc.setTextColor(255, 255, 255);
            const abbrev = trait.name.substring(0, 3).toUpperCase();
            this.doc.text(abbrev, x, y + 1, { align: 'center' });
        });
        
        // Legend
        this.currentY += 90;
        this.generateNetworkLegend(data.traits);
    }
    
    generateTreatmentPriorityMatrix(traits) {
        const matrixSize = Math.min(5, traits.length);
        const cellSize = 15;
        const startX = this.margin;
        const startY = this.currentY;
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Treatment Priority Matrix', startX, startY - 5);
        
        // Draw matrix grid
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.2);
        
        for (let i = 0; i <= matrixSize; i++) {
            // Vertical lines
            this.doc.line(
                startX + (i * cellSize),
                startY,
                startX + (i * cellSize),
                startY + (matrixSize * cellSize)
            );
            // Horizontal lines
            this.doc.line(
                startX,
                startY + (i * cellSize),
                startX + (matrixSize * cellSize),
                startY + (i * cellSize)
            );
        }
        
        // Fill cells based on severity and evidence
        traits.slice(0, matrixSize).forEach((trait, index) => {
            const x = startX + (index * cellSize) + 1;
            const y = startY + (index * cellSize) + 1;
            const size = cellSize - 2;
            
            // Color based on severity
            let color;
            if (trait.severity >= 80) {
                color = this.colors.accent;
            } else if (trait.severity >= 65) {
                color = this.colors.warning;
            } else {
                color = this.colors.success;
            }
            
            this.doc.setFillColor(...color);
            this.doc.rect(x, y, size, size, 'F');
            
            // Priority number
            this.doc.setFontSize(8);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text((index + 1).toString(), x + size / 2, y + size / 2 + 2, { align: 'center' });
        });
        
        // Axis labels
        this.doc.setFontSize(8);
        this.doc.setTextColor(0, 0, 0);
        
        // X-axis (Clinical Severity)
        this.doc.text('Clinical Severity →', startX + (matrixSize * cellSize) / 2, startY + (matrixSize * cellSize) + 10, { align: 'center' });
        
        // Y-axis (Treatment Priority)
        this.doc.text('Treatment Priority', startX - 25, startY + (matrixSize * cellSize) / 2, { align: 'center', angle: 90 });
        this.doc.text('↑', startX - 10, startY + (matrixSize * cellSize) / 2, { align: 'center' });
        
        this.currentY += (matrixSize * cellSize) + 25;
    }
    
    generateVisualSummary(data) {
        // Create a visual dashboard with key metrics
        const metrics = data.metrics || {};
        
        const boxWidth = (this.pageWidth - (3 * this.margin)) / 2;
        const boxHeight = 30;
        
        // Top row metrics
        const topMetrics = [
            { label: 'Total Traits', value: metrics.totalTraits || 0, color: this.colors.primary },
            { label: 'Avg Severity', value: `${metrics.avgSeverity || 0}%`, color: this.colors.accent }
        ];
        
        // Bottom row metrics
        const bottomMetrics = [
            { label: 'Connections', value: metrics.totalConnections || 0, color: this.colors.secondary },
            { label: 'Complexity', value: `${metrics.complexityScore || 0}/100`, color: this.colors.warning }
        ];
        
        // Draw metric boxes
        [topMetrics, bottomMetrics].forEach((metricRow, rowIndex) => {
            metricRow.forEach((metric, colIndex) => {
                const x = this.margin + (colIndex * (boxWidth + this.margin));
                const y = this.currentY + (rowIndex * (boxHeight + 10));
                
                // Draw box
                this.doc.setFillColor(...metric.color);
                this.doc.roundedRect(x, y, boxWidth, boxHeight, 5, 5, 'F');
                
                // Add text
                this.doc.setFontSize(12);
                this.doc.setTextColor(255, 255, 255);
                this.doc.text(metric.value.toString(), x + boxWidth / 2, y + boxHeight / 2 - 3, { align: 'center' });
                
                this.doc.setFontSize(8);
                this.doc.text(metric.label, x + boxWidth / 2, y + boxHeight / 2 + 8, { align: 'center' });
            });
        });
        
        this.currentY += (2 * boxHeight) + 20;
    }
    
    // ============================================================================
    // PATIENT-FOCUSED METHODS
    // ============================================================================
    
    generatePatientCoverPage(data) {
        const lang = this.config.language;
        
        // Simple, patient-friendly cover
        this.doc.setFontSize(24);
        this.doc.setTextColor(...this.colors.primary);
        
        if (lang === 'es') {
            this.doc.text('SU INFORME DE SALUD', this.pageWidth / 2, 80, { align: 'center' });
            this.doc.setFontSize(16);
            this.doc.setTextColor(...this.colors.secondary);
            this.doc.text('Resumen de su evaluación clínica', this.pageWidth / 2, 100, { align: 'center' });
        } else {
            this.doc.text('YOUR HEALTH REPORT', this.pageWidth / 2, 80, { align: 'center' });
            this.doc.setFontSize(16);
            this.doc.setTextColor(...this.colors.secondary);
            this.doc.text('Summary of your clinical assessment', this.pageWidth / 2, 100, { align: 'center' });
        }
        
        // Date
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.gray);
        const now = new Date();
        const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        this.doc.text(dateStr, this.pageWidth / 2, 120, { align: 'center' });
        
        // Patient name if available
        if (this.config.patientInfo?.name) {
            this.doc.setFontSize(14);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(this.config.patientInfo.name, this.pageWidth / 2, 140, { align: 'center' });
        }
        
        // Simple graphic
        this.doc.setFillColor(...this.colors.success);
        this.doc.circle(this.pageWidth / 2, 180, 20, 'F');
        this.doc.setFontSize(24);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text('✓', this.pageWidth / 2, 185, { align: 'center' });
        
        // Confidentiality notice in simple terms
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.gray);
        if (lang === 'es') {
            this.doc.text('Para su información personal - Comparta con su equipo médico', this.pageWidth / 2, 250, { align: 'center' });
        } else {
            this.doc.text('For your personal information - Share with your medical team', this.pageWidth / 2, 250, { align: 'center' });
        }
    }
    
    generatePatientSummary(data) {
        const lang = this.config.language;
        const t = this.text[lang];
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(18);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(lang === 'es' ? 'Resumen de su Salud' : 'Your Health Summary', this.margin, this.currentY);
        
        this.currentY += 20;
        
        // Simple explanation
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        
        const explanation = lang === 'es' 
            ? 'Este resumen muestra los aspectos clave de su salud identificados durante la evaluación. Cada área representa un factor importante para su bienestar.'
            : 'This summary shows key aspects of your health identified during the assessment. Each area represents an important factor for your well-being.';
        
        const explanationLines = this.doc.splitTextToSize(explanation, this.pageWidth - (2 * this.margin));
        this.doc.text(explanationLines, this.margin, this.currentY);
        
        this.currentY += (explanationLines.length * 5) + 15;
        
        // Health areas (simplified from traits)
        if (data.traits && data.traits.length > 0) {
            const topTraits = [...data.traits]
                .sort((a, b) => b.severity - a.severity)
                .slice(0, 5);
            
            topTraits.forEach((trait, index) => {
                if (this.currentY > 250) {
                    this.doc.addPage();
                    this.currentY = 30;
                }
                
                // Health area box
                this.doc.setFillColor(...this.getSeverityColor(trait.severity));
                this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (2 * this.margin), 20, 5, 5, 'F');
                
                // Trait name
                this.doc.setFontSize(10);
                this.doc.setTextColor(255, 255, 255);
                this.doc.text(trait.name, this.margin + 10, this.currentY + 8);
                
                // Simple description
                this.doc.setFontSize(8);
                const desc = lang === 'es' 
                    ? `Importancia: ${this.getSeverityLabel(trait.severity, lang)}`
                    : `Importance: ${this.getSeverityLabel(trait.severity, lang)}`;
                this.doc.text(desc, this.margin + 10, this.currentY + 15);
                
                this.currentY += 25;
            });
        }
        
        // Key message
        this.currentY += 10;
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.primary);
        
        const message = lang === 'es'
            ? 'Recuerde: Este es un resumen. Consulte con su médico para obtener recomendaciones personalizadas.'
            : 'Remember: This is a summary. Consult with your doctor for personalized recommendations.';
        
        this.doc.text(message, this.margin, this.currentY);
    }
    
    generatePatientTreatmentPlan(data) {
        const lang = this.config.language;
        
        this.currentY = 30;
        
        // Title
        this.doc.setFontSize(18);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(lang === 'es' ? 'Su Plan de Acción' : 'Your Action Plan', this.margin, this.currentY);
        
        this.currentY += 20;
        
        // Simple action steps
        const actions = lang === 'es' ? [
            '1. Revise este informe con su médico',
            '2. Siga las recomendaciones de tratamiento',
            '3. Programe sus próximas citas',
            '4. Mantenga un registro de sus síntomas',
            '5. No dude en hacer preguntas a su equipo médico'
        ] : [
            '1. Review this report with your doctor',
            '2. Follow the treatment recommendations',
            '3. Schedule your next appointments',
            '4. Keep a record of your symptoms',
            '5. Don\'t hesitate to ask questions to your medical team'
        ];
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        
        actions.forEach((action, index) => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.currentY = 30;
            }
            
            // Action icon
            this.doc.setFillColor(...this.colors.secondary);
            this.doc.circle(this.margin + 5, this.currentY + 3, 3, 'F');
            
            // Action text
            this.doc.text(action, this.margin + 15, this.currentY + 5);
            
            this.currentY += 15;
        });
        
        // Emergency information
        this.currentY += 10;
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.accent);
        
        const emergency = lang === 'es'
            ? 'En caso de emergencia: Llame al 911 o acuda al servicio de urgencias más cercano.'
            : 'In case of emergency: Call 911 or go to the nearest emergency room.';
        
        this.doc.text(emergency, this.margin, this.currentY);
        
        // Contact information
        if (this.config.clinicianInfo) {
            this.currentY += 10;
            this.doc.setFontSize(9);
            this.doc.setTextColor(...this.colors.gray);
            
            const contact = lang === 'es'
                ? `Su médico: ${this.config.clinicianInfo.name || 'No especificado'}`
                : `Your doctor: ${this.config.clinicianInfo.name || 'Not specified'}`;
            
            this.doc.text(contact, this.margin, this.currentY);
        }
    }
    
    // ============================================================================
    // REFERRAL LETTER METHODS
    // ============================================================================
    
    generateLetterhead() {
        // Institution header
        this.doc.setFontSize(16);
        this.doc.setTextColor(...this.colors.primary);
        
        if (this.config.institutionInfo?.name) {
            this.doc.text(this.config.institutionInfo.name, this.pageWidth / 2, 30, { align: 'center' });
        } else {
            this.doc.text('Clinical Practice', this.pageWidth / 2, 30, { align: 'center' });
        }
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.secondary);
        
        if (this.config.institutionInfo?.department) {
            this.doc.text(this.config.institutionInfo.department, this.pageWidth / 2, 38, { align: 'center' });
        }
        
        // Divider line
        this.doc.setDrawColor(...this.colors.primary);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, 45, this.pageWidth - this.margin, 45);
        
        this.currentY = 60;
    }
    
    generateReferralContent(data) {
        const lang = this.config.language;
        
        // Date and recipient
        const now = new Date();
        const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(dateStr, this.pageWidth - this.margin, this.currentY, { align: 'right' });
        
        this.currentY += 20;
        
        // Salutation
        const salutation = lang === 'es' 
            ? 'Estimado colega:'
            : 'Dear Colleague:';
        
        this.doc.text(salutation, this.margin, this.currentY);
        this.currentY += 15;
        
        // Patient information
        if (this.config.patientInfo) {
            const patient = this.config.patientInfo;
            const patientInfo = lang === 'es'
                ? `Le remito a ${patient.name || 'el paciente'}, ${patient.age || ''} años, ${patient.gender || ''}, MRN: ${patient.mrn || 'N/A'}.`
                : `I am referring ${patient.name || 'the patient'}, ${patient.age || ''} years old, ${patient.gender || ''}, MRN: ${patient.mrn || 'N/A'}.`;
            
            const patientLines = this.doc.splitTextToSize(patientInfo, this.pageWidth - (2 * this.margin));
            this.doc.text(patientLines, this.margin, this.currentY);
            this.currentY += (patientLines.length * 5) + 10;
        }
        
        // Clinical summary
        const summary = this.getReferralSummary(data, lang);
        const summaryLines = this.doc.splitTextToSize(summary, this.pageWidth - (2 * this.margin));
        this.doc.text(summaryLines, this.margin, this.currentY);
        this.currentY += (summaryLines.length * 5) + 10;
        
        // Reason for referral
        const reason = lang === 'es'
            ? 'Solicito su valoración experta para el manejo integral de este caso complejo.'
            : 'I request your expert assessment for the comprehensive management of this complex case.';
        
        this.doc.text(reason, this.margin, this.currentY);
        this.currentY += 15;
        
        // Specific questions/requests
        if (data.traits && data.traits.length > 0) {
            const topTraits = [...data.traits]
                .sort((a, b) => b.severity - a.severity)
                .slice(0, 3);
            
            const questionsTitle = lang === 'es'
                ? 'Áreas específicas que requieren atención:'
                : 'Specific areas requiring attention:';
            
            this.doc.setFontStyle('bold');
            this.doc.text(questionsTitle, this.margin, this.currentY);
            this.currentY += 10;
            this.doc.setFontStyle('normal');
            
            topTraits.forEach(trait => {
                const question = `• ${trait.name} (${trait.severity}% severity)`;
                this.doc.text(question, this.margin + 10, this.currentY);
                this.currentY += 7;
            });
            
            this.currentY += 5;
        }
        
        // Available documents
        const documents = lang === 'es'
            ? 'Adjunto encontrará el informe clínico completo. Los estudios previos están disponibles en nuestro sistema.'
            : 'I have attached the complete clinical report. Previous studies are available in our system.';
        
        this.doc.text(documents, this.margin, this.currentY);
        this.currentY += 15;
    }
    
    generateSignatureBlock() {
        const lang = this.config.language;
        
        // Closing
        const closing = lang === 'es'
            ? 'Quedo a su disposición para cualquier consulta adicional.'
            : 'I remain available for any additional questions.';
        
        this.doc.text(closing, this.margin, this.currentY);
        this.currentY += 20;
        
        // Signature area
        this.doc.setDrawColor(150, 150, 150);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY);
        
        this.currentY += 10;
        
        // Clinician information
        if (this.config.clinicianInfo) {
            const clinician = this.config.clinicianInfo;
            this.doc.text(clinician.name || '', this.margin, this.currentY);
            this.currentY += 5;
            
            if (clinician.title) {
                this.doc.setFontSize(10);
                this.doc.setTextColor(...this.colors.gray);
                this.doc.text(clinician.title, this.margin, this.currentY);
                this.currentY += 5;
            }
            
            if (clinician.contact) {
                this.doc.text(clinician.contact, this.margin, this.currentY);
            }
        }
        
        // Contact information
        if (this.config.institutionInfo?.contact) {
            this.currentY += 10;
            this.doc.setFontSize(9);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text(this.config.institutionInfo.contact, this.margin, this.currentY);
        }
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    setDocumentProperties() {
        const now = new Date();
        const title = `Clinical Report - ${now.toISOString().split('T')[0]}`;
        
        this.doc.setProperties({
            title: title,
            subject: 'Clinical Assessment Report',
            author: 'TraitMap Pro Clinical Intelligence Platform',
            keywords: 'clinical, assessment, report, healthcare',
            creator: 'TraitMap Pro v3.0'
        });
        
        // Set default font
        this.doc.setFont('helvetica');
    }
    
    drawSectionBox(title, height, yOffset = 0) {
        const x = this.margin;
        const y = this.currentY + yOffset;
        const width = this.pageWidth - (2 * this.margin);
        
        // Box background
        this.doc.setFillColor(240, 245, 250);
        this.doc.roundedRect(x, y, width, height, 5, 5, 'F');
        
        // Box border
        this.doc.setDrawColor(...this.colors.secondary);
        this.doc.setLineWidth(0.5);
        this.doc.roundedRect(x, y, width, height, 5, 5);
        
        // Title
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(title, x + 10, y + 8);
        
        // Update currentY
        this.currentY = y + height + 10;
    }
    
    getExecutiveSummaryText(data, lang) {
        const metrics = data.metrics || {};
        const analytics = data.analytics || {};
        
        if (lang === 'es') {
            return `Esta evaluación clínica identifica ${metrics.totalTraits || 0} rasgos clínicos significativos en ${Object.keys(metrics.categoryDistribution || {}).length || 0} dominios. La gravedad clínica promedio es del ${metrics.avgSeverity || 0}%, indicando una complejidad ${this.getSeverityLevel(metrics.avgSeverity, lang)}. Se detectaron ${analytics.patterns?.length || 0} patrones clínicos y ${analytics.predictions?.length || 0} predicciones de riesgo. El puntaje de complejidad es ${metrics.complexityScore || 0}/100, requiriendo un enfoque de manejo ${this.getManagementLevel(metrics.complexityScore, lang)}.`;
        } else {
            return `This clinical assessment identifies ${metrics.totalTraits || 0} significant clinical traits across ${Object.keys(metrics.categoryDistribution || {}).length || 0} domains. The average clinical severity is ${metrics.avgSeverity || 0}%, indicating ${this.getSeverityLevel(metrics.avgSeverity, lang)} complexity. ${analytics.patterns?.length || 0} clinical patterns were detected and ${analytics.predictions?.length || 0} risk predictions generated. The complexity score is ${metrics.complexityScore || 0}/100, requiring ${this.getManagementLevel(metrics.complexityScore, lang)} management approach.`;
        }
    }
    
    getKeyInsights(data) {
        const metrics = data.metrics || {};
        const insights = [];
        
        if (metrics.criticalTraits > 0) {
            insights.push(`• ${metrics.criticalTraits} critical traits requiring immediate intervention`);
        }
        
        if (metrics.highSeverity > 0) {
            insights.push(`• ${metrics.highSeverity} high-severity traits needing prioritized management`);
        }
        
        if (metrics.totalConnections > 5) {
            insights.push('• Multiple clinical relationships suggest systemic involvement');
        }
        
        if (metrics.complexityScore >= 70) {
            insights.push('• High complexity score indicates need for multidisciplinary approach');
        }
        
        if (data.analytics?.patterns?.length > 0) {
            insights.push(`• ${data.analytics.patterns.length} clinical patterns detected`);
        }
        
        return insights;
    }
    
    getSeverityColor(severity) {
        if (severity >= 90) return this.colors.accent;
        if (severity >= 80) return this.colors.warning;
        if (severity >= 65) return [242, 204, 143]; // Yellow
        return this.colors.success;
    }
    
    getSeverityLabel(severity, lang = 'en') {
        if (severity >= 90) return lang === 'es' ? 'CRÍTICO' : 'CRITICAL';
        if (severity >= 80) return lang === 'es' ? 'ALTO' : 'HIGH';
        if (severity >= 65) return lang === 'es' ? 'MODERADO' : 'MODERATE';
        return lang === 'es' ? 'BAJO' : 'LOW';
    }
    
    getSeverityLevel(severity, lang = 'en') {
        if (severity >= 80) return lang === 'es' ? 'alta' : 'high';
        if (severity >= 65) return lang === 'es' ? 'moderada' : 'moderate';
        return lang === 'es' ? 'baja' : 'low';
    }
    
    getManagementLevel(complexityScore, lang = 'en') {
        if (complexityScore >= 80) return lang === 'es' ? 'complejo y multidisciplinario' : 'complex multidisciplinary';
        if (complexityScore >= 60) return lang === 'es' ? 'integrado y priorizado' : 'integrated prioritized';
        return lang === 'es' ? 'estandarizado' : 'standardized';
    }
    
    calculateNetworkDensity(metrics) {
        const n = metrics.totalTraits || 0;
        const possibleConnections = n * (n - 1) / 2;
        const actualConnections = metrics.totalConnections || 0;
        
        if (possibleConnections === 0) return 0;
        return ((actualConnections / possibleConnections) * 100).toFixed(1);
    }
    
    getCategoryColor(category) {
        const colorMap = {
            'pulmonary': this.colors.primary,
            'inflammatory': this.colors.accent,
            'physiological': this.colors.success,
            'clinical': [196, 144, 106], // Brown
            'comorbid': [227, 154, 156], // Pink
            'behavioral': [74, 124, 140], // Dark teal
            'pharmacological': this.colors.success,
            'surgical': [123, 107, 169], // Purple
            'user-defined': [138, 75, 175] // Purple
        };
        
        return colorMap[category] || this.colors.gray;
    }
    
    groupBiomarkers(biomarkers) {
        const groups = {
            'Inflammatory': ['CRP', 'ESR', 'IL-6', 'TNF-α', 'Fibrinogen', 'Procalcitonin'],
            'Pulmonary': ['FEV1', 'FVC', 'FEV1/FVC', 'PEF', 'DLCO', 'SpO2', 'PaO2', 'PaCO2'],
            'Hematology': ['Blood eosinophils', 'IgE', 'Leukocytes', 'Hemoglobin', 'Platelets'],
            'Metabolic': ['Glucose', 'HbA1c', 'Cholesterol', 'Triglycerides'],
            'Renal': ['Creatinine', 'BUN', 'eGFR'],
            'Hepatic': ['ALT', 'AST', 'Bilirubin', 'Albumin']
        };
        
        const result = {};
        
        biomarkers.forEach(biomarker => {
            let foundGroup = 'Other';
            
            for (const [group, groupMarkers] of Object.entries(groups)) {
                if (groupMarkers.includes(biomarker)) {
                    foundGroup = group;
                    break;
                }
            }
            
            if (!result[foundGroup]) {
                result[foundGroup] = [];
            }
            
            if (!result[foundGroup].includes(biomarker)) {
                result[foundGroup].push(biomarker);
            }
        });
        
        return result;
    }
    
    getRelevantGuidelines(traits) {
        // This would integrate with the database guidelines
        // For now, return sample guidelines based on trait categories
        const guidelines = [];
        const categories = new Set(traits.map(t => t.category));
        
        if (categories.has('pulmonary')) {
            guidelines.push({
                name: 'GOLD 2024 Guidelines',
                description: 'Global Initiative for Chronic Obstructive Lung Disease',
                recommendations: [
                    'Use post-bronchodilator spirometry for diagnosis',
                    'Assess symptom burden and exacerbation risk',
                    'Consider blood eosinophil count for ICS therapy'
                ]
            });
        }
        
        if (categories.has('inflammatory')) {
            guidelines.push({
                name: 'ERS/ATS 2022 Inflammatory Diseases',
                description: 'Management of inflammatory airway diseases',
                recommendations: [
                    'Monitor inflammatory biomarkers regularly',
                    'Consider targeted biologic therapy for severe cases',
                    'Assess treatment response at 3-6 months'
                ]
            });
        }
        
        if (traits.some(t => t.severity >= 80)) {
            guidelines.push({
                name: 'High-Risk Patient Management',
                description: 'Guidelines for managing patients with high clinical risk',
                recommendations: [
                    'Increase monitoring frequency',
                    'Consider multidisciplinary assessment',
                    'Develop comprehensive care plan'
                ]
            });
        }
        
        return guidelines;
    }
    
    getImmediateActions(level, lang) {
        const actions = {
            standard: lang === 'es' ? [
                'Iniciar terapia de primera línea',
                'Educación básica del paciente',
                'Cita de seguimiento en 4 semanas'
            ] : [
                'Initiate first-line therapy',
                'Basic patient education',
                'Follow-up appointment in 4 weeks'
            ],
            moderate: lang === 'es' ? [
                'Optimizar terapia actual',
                'Evaluación de biomarcadores inicial',
                'Cita de seguimiento en 2 semanas',
                'Plan de acción para exacerbaciones'
            ] : [
                'Optimize current therapy',
                'Initial biomarker assessment',
                'Follow-up appointment in 2 weeks',
                'Exacerbation action plan'
            ],
            complex: lang === 'es' ? [
                'Revisión multidisciplinaria urgente',
                'Manejo agresivo de síntomas',
                'Monitoreo diario de síntomas',
                'Coordinación de cuidados'
            ] : [
                'Urgent multidisciplinary review',
                'Aggressive symptom management',
                'Daily symptom monitoring',
                'Care coordination'
            ]
        };
        
        return actions[level] || actions.standard;
    }
    
    getShortTermActions(level, lang) {
        const actions = {
            standard: lang === 'es' ? [
                'Evaluar respuesta al tratamiento',
                'Ajustar dosis según necesidad',
                'Continuar educación del paciente'
            ] : [
                'Assess treatment response',
                'Adjust doses as needed',
                'Continue patient education'
            ],
            moderate: lang === 'es' ? [
                'Evaluación de biomarcadores de seguimiento',
                'Ajustar terapia según respuesta',
                'Incluir intervenciones no farmacológicas',
                'Coordinar con otros especialistas'
            ] : [
                'Follow-up biomarker assessment',
                'Adjust therapy based on response',
                'Include non-pharmacological interventions',
                'Coordinate with other specialists'
            ],
            complex: lang === 'es' ? [
                'Revisión multidisciplinaria semanal',
                'Optimización agresiva de terapia',
                'Manejo de comorbilidades',
                'Soporte psicosocial'
            ] : [
                'Weekly multidisciplinary review',
                'Aggressive therapy optimization',
                'Comorbidity management',
                'Psychosocial support'
            ]
        };
        
        return actions[level] || actions.standard;
    }
    
    getLongTermActions(level, lang) {
        const actions = {
            standard: lang === 'es' ? [
                'Monitoreo regular cada 6 meses',
                'Prevención y vacunación',
                'Mantenimiento de terapia'
            ] : [
                'Regular monitoring every 6 months',
                'Prevention and vaccination',
                'Therapy maintenance'
            ],
            moderate: lang === 'es' ? [
                'Monitoreo cada 3 meses',
                'Rehabilitación pulmonar',
                'Manejo integral de salud',
                'Seguimiento especializado'
            ] : [
                'Monitoring every 3 months',
                'Pulmonary rehabilitation',
                'Comprehensive health management',
                'Specialist follow-up'
            ],
            complex: lang === 'es' ? [
                'Monitoreo mensual',
                'Manejo en centro especializado',
                'Plan de cuidados avanzados',
                'Soporte continuo multidisciplinario'
            ] : [
                'Monthly monitoring',
                'Specialized center management',
                'Advanced care planning',
                'Continued multidisciplinary support'
            ]
        };
        
        return actions[level] || actions.standard;
    }
    
    getReferralSummary(data, lang) {
        const metrics = data.metrics || {};
        
        if (lang === 'es') {
            return `El paciente presenta un perfil clínico complejo con ${metrics.totalTraits || 0} rasgos significativos y una gravedad promedio del ${metrics.avgSeverity || 0}%. Se han identificado ${metrics.totalConnections || 0} interrelaciones clínicas, sugiriendo un patrón sistémico. El puntaje de complejidad es ${metrics.complexityScore || 0}/100, indicando la necesidad de un enfoque especializado.`;
        } else {
            return `The patient presents with a complex clinical profile featuring ${metrics.totalTraits || 0} significant traits and an average severity of ${metrics.avgSeverity || 0}%. ${metrics.totalConnections || 0} clinical interrelationships have been identified, suggesting a systemic pattern. The complexity score is ${metrics.complexityScore || 0}/100, indicating the need for specialized approach.`;
        }
    }
    
    getFileName() {
        const date = this.getFormattedDate();
        const type = this.config.language === 'es' ? 'Informe' : 'Report';
        const patient = this.config.patientInfo?.name 
            ? `_${this.config.patientInfo.name.replace(/\s+/g, '_')}` 
            : '';
        
        return `Clinical_${type}${patient}_${date}.pdf`;
    }
    
    getFormattedDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    addTableOfContents() {
        // This would add an interactive table of contents
        // For now, we'll add a simple contents page
        this.doc.insertPage(1);
        
        this.currentY = 50;
        this.doc.setFontSize(20);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('TABLE OF CONTENTS', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 30;
        
        const contents = [
            '1. Cover Page',
            '2. Executive Summary',
            '3. Clinical Traits Details',
            '4. Network Analysis',
            '5. Treatment Pathways',
            '6. Management Plan',
            '7. Biomarker Profile',
            '8. Clinical Guidelines'
        ];
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        
        contents.forEach((item, index) => {
            this.doc.text(item, this.margin, this.currentY);
            
            // Dotted line to page number
            const pageNum = (index + 2).toString(); // +2 because cover is page 1, contents is page 2
            this.doc.setLineWidth(0.1);
            this.doc.setDrawColor(200, 200, 200);
            const lineY = this.currentY + 2;
            this.doc.line(this.margin + 100, lineY, this.pageWidth - this.margin - 20, lineY);
            
            // Page number
            this.doc.text(pageNum, this.pageWidth - this.margin - 10, this.currentY, { align: 'right' });
            
            this.currentY += 15;
        });
    }
    
    addPageNumbers() {
        const pageCount = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            
            // Footer line
            this.doc.setDrawColor(200, 200, 200);
            this.doc.setLineWidth(0.2);
            this.doc.line(this.margin, 285, this.pageWidth - this.margin, 285);
            
            // Page number
            this.doc.setFontSize(9);
            this.doc.setTextColor(...this.colors.gray);
            const t = this.text[this.config.language];
            this.doc.text(`${t.page} ${i} ${t.of} ${pageCount}`, this.pageWidth / 2, 290, { align: 'center' });
            
            // Report footer
            this.doc.text('TraitMap Pro Clinical Intelligence Platform v3.0', this.margin, 290);
            this.doc.text(this.getFormattedDate(), this.pageWidth - this.margin, 290, { align: 'right' });
        }
    }
    
    addDecorativeElements() {
        // Add subtle decorative elements to the cover page
        this.doc.setLineWidth(0.2);
        this.doc.setDrawColor(...this.colors.secondary);
        
        // Top corners
        this.doc.line(this.margin, 40, this.margin + 20, 40);
        this.doc.line(this.margin, 40, this.margin, 60);
        
        this.doc.line(this.pageWidth - this.margin, 40, this.pageWidth - this.margin - 20, 40);
        this.doc.line(this.pageWidth - this.margin, 40, this.pageWidth - this.margin, 60);
        
        // Bottom corners
        this.doc.line(this.margin, 260, this.margin + 20, 260);
        this.doc.line(this.margin, 260, this.margin, 240);
        
        this.doc.line(this.pageWidth - this.margin, 260, this.pageWidth - this.margin - 20, 260);
        this.doc.line(this.pageWidth - this.margin, 260, this.pageWidth - this.margin, 240);
    }
    
    // ============================================================================
    // ADDITIONAL REPORT SECTIONS (Simplified for brevity)
    // ============================================================================
    
    generateCompactMetrics(data) {
        const metrics = data.metrics || {};
        
        // Small metric boxes
        const boxSize = 20;
        const spacing = 10;
        const startX = this.margin;
        
        const compactMetrics = [
            { label: 'Traits', value: metrics.totalTraits || 0, color: this.colors.primary },
            { label: 'Severity', value: `${metrics.avgSeverity || 0}%`, color: this.colors.accent },
            { label: 'Connections', value: metrics.totalConnections || 0, color: this.colors.secondary },
            { label: 'Complexity', value: `${metrics.complexityScore || 0}/100`, color: this.colors.warning }
        ];
        
        compactMetrics.forEach((metric, index) => {
            const x = startX + (index * (boxSize + spacing));
            const y = this.currentY;
            
            this.doc.setFillColor(...metric.color);
            this.doc.roundedRect(x, y, boxSize, boxSize, 3, 3, 'F');
            
            this.doc.setFontSize(8);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(metric.value.toString(), x + boxSize / 2, y + boxSize / 2 - 2, { align: 'center' });
            
            this.doc.text(metric.label, x + boxSize / 2, y + boxSize / 2 + 5, { align: 'center' });
        });
        
        this.currentY += boxSize + 15;
    }
    
    generateKeyRecommendations(data) {
        const recommendations = this.getKeyInsights(data);
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('KEY RECOMMENDATIONS', this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        recommendations.forEach((rec, index) => {
            if (this.currentY > 250) return; // Don't overflow on one-page report
            
            this.doc.text(rec, this.margin, this.currentY);
            this.currentY += 7;
        });
    }
    
    generatePatternSummary(patterns) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Detected Clinical Patterns', this.margin, this.currentY);
        
        this.currentY += 10;
        
        patterns.slice(0, 3).forEach((pattern, index) => {
            if (this.currentY > 250) return;
            
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            const confidence = Math.round(pattern.confidence * 100);
            this.doc.text(`${index + 1}. ${pattern.name} (${confidence}% confidence)`, this.margin, this.currentY);
            this.currentY += 5;
            
            const descLines = this.doc.splitTextToSize(pattern.description, this.pageWidth - (2 * this.margin));
            this.doc.text(descLines, this.margin + 10, this.currentY);
            this.currentY += (descLines.length * 5) + 5;
        });
    }
    
    generateRiskPredictions(predictions) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Risk Predictions', this.margin, this.currentY);
        
        this.currentY += 10;
        
        predictions.forEach((prediction, index) => {
            if (this.currentY > 250) return;
            
            const confidence = Math.round(prediction.confidence * 100);
            const riskLevel = prediction.value >= 50 ? 'High' : prediction.value >= 30 ? 'Moderate' : 'Low';
            const color = prediction.value >= 50 ? this.colors.accent : prediction.value >= 30 ? this.colors.warning : this.colors.success;
            
            // Risk indicator
            this.doc.setFillColor(...color);
            this.doc.circle(this.margin + 5, this.currentY + 3, 3, 'F');
            
            // Prediction text
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(`${prediction.description} (${riskLevel} risk, ${confidence}% confidence)`, this.margin + 15, this.currentY + 5);
            
            this.currentY += 10;
        });
    }
    
    generateTopTraitsDetails(traits) {
        const topTraits = traits.slice(0, 3);
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Top Clinical Traits Details', this.margin, this.currentY);
        
        this.currentY += 10;
        
        topTraits.forEach((trait, index) => {
            this.doc.setFontSize(11);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(`${index + 1}. ${trait.name}`, this.margin, this.currentY);
            
            this.currentY += 7;
            
            this.doc.setFontSize(9);
            this.doc.setTextColor(...this.colors.gray);
            
            const details = [
                `${this.text[this.config.language].category}: ${trait.category}`,
                `${this.text[this.config.language].severity}: ${trait.severity}%`,
                `${this.text[this.config.language].evidence}: ${trait.evidence?.level || 'C'}`
            ];
            
            details.forEach(detail => {
                this.doc.text(detail, this.margin + 10, this.currentY);
                this.currentY += 5;
            });
            
            this.currentY += 5;
        });
    }
    
    generatePatternDetails(patterns) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Clinical Pattern Analysis', this.margin, this.currentY);
        
        this.currentY += 10;
        
        patterns.forEach((pattern, index) => {
            if (this.currentY > 250) {
                this.doc.addPage();
                this.currentY = 30;
            }
            
            this.doc.setFontSize(11);
            this.doc.setTextColor(...this.colors.primary);
            this.doc.text(`${index + 1}. ${pattern.name}`, this.margin, this.currentY);
            
            this.currentY += 7;
            
            this.doc.setFontSize(9);
            this.doc.setTextColor(0, 0, 0);
            
            const confidence = Math.round(pattern.confidence * 100);
            this.doc.text(`Confidence: ${confidence}%`, this.margin + 10, this.currentY);
            this.currentY += 5;
            
            const descLines = this.doc.splitTextToSize(pattern.description, this.pageWidth - (2 * this.margin));
            this.doc.text(descLines, this.margin + 10, this.currentY);
            this.currentY += (descLines.length * 5) + 5;
            
            if (pattern.implications) {
                this.doc.setFontStyle('bold');
                this.doc.text('Clinical Implications:', this.margin + 10, this.currentY);
                this.currentY += 5;
                this.doc.setFontStyle('normal');
                
                const impLines = this.doc.splitTextToSize(pattern.implications, this.pageWidth - (2 * this.margin) - 10);
                this.doc.text(impLines, this.margin + 15, this.currentY);
                this.currentY += (impLines.length * 5) + 5;
            }
            
            this.currentY += 5;
        });
    }
    
    generateConnectionAnalysis(connections) {
        // Calculate connection strength distribution
        const strengthGroups = {
            strong: connections.filter(c => c.strength >= 80).length,
            moderate: connections.filter(c => c.strength >= 50 && c.strength < 80).length,
            weak: connections.filter(c => c.strength < 50).length
        };
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Connection Strength Analysis', this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        Object.entries(strengthGroups).forEach(([strength, count], index) => {
            const percentage = ((count / connections.length) * 100).toFixed(1);
            const label = strength.charAt(0).toUpperCase() + strength.slice(1);
            this.doc.text(`${label} (${percentage}%): ${count} connections`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
    }
    
    generateTraitTreatmentPathway(trait, priority) {
        const treatment = typeof trait.treatment === 'object' ? trait.treatment : { firstLine: trait.treatment };
        
        // Priority badge
        this.doc.setFillColor(...this.getSeverityColor(trait.severity));
        this.doc.circle(this.margin + 5, this.currentY + 5, 8, 'F');
        this.doc.setFontSize(8);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(priority.toString(), this.margin + 5, this.currentY + 7, { align: 'center' });
        
        // Trait name
        this.doc.setFontSize(11);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(trait.name, this.margin + 20, this.currentY + 5);
        
        // Severity indicator
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.getSeverityColor(trait.severity));
        this.doc.text(`${trait.severity}% severity`, this.pageWidth - this.margin - 30, this.currentY + 5);
        
        this.currentY += 10;
        
        // Treatment details
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);
        
        if (treatment.firstLine) {
            this.doc.text(`${this.text[this.config.language].firstLine}: ${treatment.firstLine}`, this.margin + 20, this.currentY);
            this.currentY += 5;
        }
        
        if (treatment.secondLine) {
            this.doc.text(`${this.text[this.config.language].secondLine}: ${treatment.secondLine}`, this.margin + 20, this.currentY);
            this.currentY += 5;
        }
        
        if (treatment.nonPharmacological) {
            this.doc.text(`${this.text[this.config.language].nonPharmacological}: ${treatment.nonPharmacological}`, this.margin + 20, this.currentY);
            this.currentY += 5;
        }
    }
    
    generateTreatmentConflicts(conflicts) {
        if (!conflicts || conflicts.length === 0) return;
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.accent);
        this.doc.text('Treatment Conflict Alerts', this.margin, this.currentY);
        
        this.currentY += 10;
        
        conflicts.slice(0, 3).forEach((conflict, index) => {
            this.doc.setFontSize(9);
            this.doc.setTextColor(0, 0, 0);
            
            this.doc.text(`⚠️ ${conflict.description}`, this.margin + 5, this.currentY);
            this.currentY += 5;
            
            if (conflict.recommendation) {
                this.doc.text(`Recommendation: ${conflict.recommendation}`, this.margin + 15, this.currentY);
                this.currentY += 5;
            }
            
            this.currentY += 3;
        });
    }
    
    generateMonitoringPlan(data, managementLevel) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Monitoring Plan', this.margin, this.currentY);
        
        this.currentY += 10;
        
        const monitoringItems = {
            standard: [
                'Monthly symptom assessment',
                'Quarterly clinical evaluation',
                'Annual comprehensive review'
            ],
            moderate: [
                'Bi-weekly symptom monitoring',
                'Monthly clinical assessment',
                'Quarterly biomarker testing',
                'Bi-annual comprehensive review'
            ],
            complex: [
                'Weekly symptom monitoring',
                'Bi-weekly clinical assessment',
                'Monthly biomarker testing',
                'Quarterly multidisciplinary review',
                'Bi-annual comprehensive reassessment'
            ]
        };
        
        const items = monitoringItems[managementLevel] || monitoringItems.standard;
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        items.forEach(item => {
            this.doc.text(`• ${item}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
    }
    
    generateReferralRecommendations(data) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Referral Recommendations', this.margin, this.currentY);
        
        this.currentY += 10;
        
        const referrals = [
            'Multidisciplinary clinic for complex cases',
            'Specialist consultation for specific comorbidities',
            'Pulmonary rehabilitation program',
            'Nutritional counseling',
            'Psychological support services'
        ];
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        referrals.forEach(referral => {
            this.doc.text(`• ${referral}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
    }
    
    generateBiomarkerMonitoring(biomarkers, totalTraits) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Recommended Monitoring Frequency', this.margin, this.currentY);
        
        this.currentY += 10;
        
        // Categorize monitoring frequency based on biomarker importance
        const monitoringSchedule = {
            'High Priority (Monitor monthly)': biomarkers.filter(b => 
                ['CRP', 'Blood eosinophils', 'FEV1', 'SpO2'].includes(b)
            ),
            'Medium Priority (Monitor quarterly)': biomarkers.filter(b => 
                ['ESR', 'IgE', 'FVC', 'DLCO'].includes(b)
            ),
            'Low Priority (Monitor annually)': biomarkers.filter(b => 
                !['CRP', 'Blood eosinophils', 'FEV1', 'SpO2', 'ESR', 'IgE', 'FVC', 'DLCO'].includes(b)
            )
        };
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        Object.entries(monitoringSchedule).forEach(([priority, markers]) => {
            if (markers.length > 0) {
                this.doc.text(priority + ':', this.margin + 5, this.currentY);
                this.currentY += 5;
                
                markers.forEach(marker => {
                    this.doc.text(`  - ${marker}`, this.margin + 10, this.currentY);
                    this.currentY += 5;
                });
                
                this.currentY += 3;
            }
        });
    }
    
    generateBiomarkerInterpretation(biomarkers) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Guía de Interpretación de Biomarcadores', this.margin, this.currentY);
        
        this.currentY += 10;
        
        const interpretations = {
            'CRP': 'Proteína C-reactiva: >10 mg/L indica inflamación activa',
            'FEV1': 'Volumen espiratorio forzado en 1 segundo: <80% predicho indica obstrucción',
            'Blood eosinophils': 'Eosinófilos en sangre: ≥300 células/μL sugiere inflamación eosinofílica',
            'SpO2': 'Saturación de oxígeno: <94% en reposo indica hipoxemia'
        };
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);
        
        biomarkers.forEach(biomarker => {
            if (interpretations[biomarker]) {
                this.doc.text(`• ${biomarker}: ${interpretations[biomarker]}`, this.margin + 5, this.currentY);
                this.currentY += 6;
            }
        });
    }
    
    generateNetworkLegend(traits) {
        const categories = [...new Set(traits.map(t => t.category))];
        const legendX = this.margin;
        const legendY = this.currentY;
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Legend:', legendX, legendY);
        
        categories.forEach((category, index) => {
            const y = legendY + 10 + (index * 7);
            const color = this.getCategoryColor(category);
            
            // Color swatch
            this.doc.setFillColor(...color);
            this.doc.rect(legendX + 5, y - 3, 6, 6, 'F');
            
            // Category label
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(category, legendX + 15, y);
        });
        
        this.currentY += (categories.length * 7) + 15;
    }
    
    generateReferences(guidelines) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('References', this.margin, this.currentY);
        
        this.currentY += 10;
        
        const references = [
            'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management, and Prevention of Chronic Obstructive Pulmonary Disease (2024 Report).',
            'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention (2024 Update).',
            'American Thoracic Society/European Respiratory Society (ATS/ERS) Task Force. Standards for the Diagnosis and Management of Patients with COPD (2022 Update).'
        ];
        
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);
        
        references.forEach((ref, index) => {
            const refLines = this.doc.splitTextToSize(`${index + 1}. ${ref}`, this.pageWidth - (2 * this.margin));
            this.doc.text(refLines, this.margin, this.currentY);
            this.currentY += (refLines.length * 5) + 3;
        });
    }
}

// ============================================================================
// EXPORT FOR USE
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClinicalPDFGenerator;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
    window.ClinicalPDFGenerator = ClinicalPDFGenerator;
}
