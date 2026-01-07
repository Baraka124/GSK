// pdf-generator.js - IMPROVED VERSION

class ClinicalPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
    }
    
    generateReport(data) {
        try {
            const { jsPDF } = window.jspdf;
            this.doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Add logo/watermark
            this.addWatermark();
            
            // Generate report sections
            this.generateCoverPage(data);
            
            if (data.traits && data.traits.length > 0) {
                this.doc.addPage();
                this.generateExecutiveSummary(data);
                
                this.doc.addPage();
                this.generateClinicalTraits(data);
                
                if (data.connections && data.connections.length > 0) {
                    this.doc.addPage();
                    this.generateClinicalNetwork(data);
                }
                
                this.doc.addPage();
                this.generateTreatmentPathways(data);
            } else {
                this.doc.addPage();
                this.generateEmptyReport();
            }
            
            // Add page numbers
            this.addPageNumbers();
            
            // Save the PDF
            const fileName = `Clinical_Report_${this.getFormattedDate()}.pdf`;
            this.doc.save(fileName);
            
            return true;
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF report');
        }
    }
    
    getFormattedDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }
    
    addWatermark() {
        // Add a subtle watermark
        this.doc.setFontSize(60);
        this.doc.setTextColor(240, 240, 240);
        this.doc.text('CLINICAL', 105, 150, { align: 'center', angle: 45 });
        this.doc.setFontSize(40);
        this.doc.text('TRAITMAP', 105, 180, { align: 'center', angle: 45 });
        this.doc.setTextColor(0, 0, 0); // Reset color
    }
    
    generateCoverPage(data) {
        // Title
        this.doc.setFontSize(28);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('COMPREHENSIVE CLINICAL ASSESSMENT', this.pageWidth / 2, 40, { align: 'center' });
        
        // Subtitle
        this.doc.setFontSize(16);
        this.doc.setTextColor(74, 139, 201);
        this.doc.text('TraitMap Pro Clinical Intelligence Platform', this.pageWidth / 2, 55, { align: 'center' });
        
        // Date and time
        this.doc.setFontSize(12);
        this.doc.setTextColor(100, 100, 100);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.doc.text(`Generated: ${dateStr} at ${timeStr}`, this.pageWidth / 2, 70, { align: 'center' });
        
        // Report ID
        const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
        this.doc.text(`Report ID: ${reportId}`, this.pageWidth / 2, 80, { align: 'center' });
        
        // Patient information box
        this.doc.setFillColor(240, 245, 250);
        this.doc.roundedRect(this.margin, 100, this.pageWidth - (2 * this.margin), 50, 5, 5, 'F');
        
        this.doc.setFontSize(16);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL ASSESSMENT SUMMARY', this.pageWidth / 2, 115, { align: 'center' });
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        
        const metrics = data.metrics || { totalTraits: 0, totalConnections: 0, avgSeverity: 0, complexityScore: 0 };
        
        const summaryItems = [
            `Total Clinical Traits: ${metrics.totalTraits}`,
            `Clinical Relationships: ${metrics.totalConnections}`,
            `Average Severity: ${metrics.avgSeverity}%`,
            `Complexity Score: ${metrics.complexityScore}/100`
        ];
        
        summaryItems.forEach((item, index) => {
            this.doc.text(item, this.pageWidth / 2, 130 + (index * 8), { align: 'center' });
        });
        
        // Risk level indicator
        if (metrics.avgSeverity >= 80) {
            this.doc.setFillColor(214, 69, 80);
            this.doc.setTextColor(255, 255, 255);
            this.doc.roundedRect(this.margin, 170, this.pageWidth - (2 * this.margin), 15, 3, 3, 'F');
            this.doc.text('⚠️  HIGH CLINICAL RISK - URGENT ATTENTION REQUIRED', this.pageWidth / 2, 180, { align: 'center' });
        } else if (metrics.avgSeverity >= 65) {
            this.doc.setFillColor(242, 204, 143);
            this.doc.setTextColor(0, 0, 0);
            this.doc.roundedRect(this.margin, 170, this.pageWidth - (2 * this.margin), 15, 3, 3, 'F');
            this.doc.text('⚠️  MODERATE CLINICAL RISK - PRIORITY ATTENTION', this.pageWidth / 2, 180, { align: 'center' });
        }
        
        // Confidentiality notice
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('CONFIDENTIAL MEDICAL DOCUMENT - FOR CLINICAL USE ONLY', this.pageWidth / 2, 280, { align: 'center' });
        this.doc.text('This report contains sensitive patient health information. Handle with care.', this.pageWidth / 2, 285, { align: 'center' });
    }
    
    generateExecutiveSummary(data) {
        this.doc.setFontSize(20);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('EXECUTIVE SUMMARY', this.margin, 30);
        
        this.doc.setDrawColor(74, 139, 201);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, 35, this.pageWidth - this.margin, 35);
        
        const metrics = data.metrics || {};
        
        const summaryText = `
This clinical assessment report provides a comprehensive analysis of the patient's health profile. The assessment identified ${metrics.totalTraits || 0} clinically significant traits across multiple domains.

The patient presents with an average clinical severity of ${metrics.avgSeverity || 0}%, indicating ${this.getSeverityLevel(metrics.avgSeverity)} clinical complexity. ${metrics.totalConnections || 0} clinical relationships were identified, revealing interconnected patterns in the patient's condition.

${this.generateKeyRecommendations(metrics)}
        `.trim();
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(60, 60, 60);
        const splitText = this.doc.splitTextToSize(summaryText, this.pageWidth - (2 * this.margin));
        this.doc.text(splitText, this.margin, 45);
        
        // Key insights box
        const insightsY = 45 + (splitText.length * 5) + 15;
        this.doc.setFillColor(250, 250, 255);
        this.doc.roundedRect(this.margin, insightsY, this.pageWidth - (2 * this.margin), 40, 3, 3, 'F');
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('KEY INSIGHTS', this.margin + 5, insightsY + 10);
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        const insights = [
            `• ${metrics.highSeverity || 0} high-severity clinical traits identified`,
            `• ${metrics.criticalTraits || 0} critical traits requiring immediate attention`,
            `• ${Object.keys(metrics.categoryDistribution || {}).length || 0} clinical domains affected`,
            `• Network density: ${this.calculateNetworkDensity(metrics)}%`
        ];
        
        insights.forEach((insight, index) => {
            this.doc.text(insight, this.margin + 10, insightsY + 20 + (index * 6));
        });
    }
    
    generateClinicalTraits(data) {
        this.doc.setFontSize(20);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL TRAITS DETAILS', this.margin, 30);
        
        if (!data.traits || data.traits.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('No clinical traits available for analysis.', this.margin, 50);
            return;
        }
        
        // Create enhanced table data
        const tableData = data.traits.map((trait, index) => [
            (index + 1).toString(),
            trait.name.substring(0, 25),
            trait.category,
            `${trait.severity}%`,
            trait.connections ? trait.connections.length.toString() : '0'
        ]);
        
        // Generate table with custom styling
        this.doc.autoTable({
            startY: 40,
            head: [['#', 'Clinical Trait', 'Category', 'Severity', 'Connections']],
            body: tableData,
            headStyles: { 
                fillColor: [28, 78, 128],
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
                2: { cellWidth: 35 },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 25, halign: 'center' }
            },
            styles: {
                overflow: 'linebreak',
                lineWidth: 0.1,
                lineColor: [200, 200, 200]
            },
            didDrawPage: (tableData) => {
                // Add severity color coding
                const pageCount = this.doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    this.doc.setPage(i);
                    this.addSeverityColorCoding(tableData);
                }
            }
        });
        
        // Add severity distribution chart
        const finalY = this.doc.lastAutoTable.finalY + 15;
        if (finalY < 250) {
            this.generateSeverityDistribution(data.traits, finalY);
        }
    }
    
    generateSeverityDistribution(traits, startY) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Severity Distribution', this.margin, startY);
        
        // Calculate distribution
        const distribution = {
            critical: traits.filter(t => t.severity >= 80).length,
            high: traits.filter(t => t.severity >= 65 && t.severity < 80).length,
            moderate: traits.filter(t => t.severity >= 50 && t.severity < 65).length,
            low: traits.filter(t => t.severity < 50).length
        };
        
        // Draw simple bar chart
        const chartStartY = startY + 10;
        const barWidth = 15;
        const maxCount = Math.max(...Object.values(distribution));
        
        Object.entries(distribution).forEach(([level, count], index) => {
            const x = this.margin + (index * 35);
            const barHeight = (count / maxCount) * 40;
            const y = chartStartY + 30 - barHeight;
            
            // Set color based on severity level
            const colors = {
                critical: [214, 69, 80],
                high: [224, 122, 95],
                moderate: [242, 204, 143],
                low: [129, 178, 154]
            };
            
            this.doc.setFillColor(...colors[level]);
            this.doc.rect(x, y, barWidth, barHeight, 'F');
            
            // Label
            this.doc.setFontSize(9);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(level.charAt(0).toUpperCase() + level.slice(1), x, chartStartY + 35);
            this.doc.text(count.toString(), x + 3, chartStartY + 40);
        });
    }
    
    addSeverityColorCoding(tableData) {
        // This would add color coding to severity cells in the table
        // Implementation depends on autoTable version
    }
    
    generateClinicalNetwork(data) {
        this.doc.setFontSize(20);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL NETWORK ANALYSIS', this.margin, 30);
        
        const metrics = data.metrics || {};
        
        // Network statistics
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        
        const statsY = 45;
        const stats = [
            `Total Network Nodes: ${metrics.totalTraits || 0}`,
            `Total Connections: ${metrics.totalConnections || 0}`,
            `Network Density: ${this.calculateNetworkDensity(metrics)}%`,
            `Average Degree: ${this.calculateAverageDegree(metrics)}`
        ];
        
        stats.forEach((stat, index) => {
            this.doc.text(stat, this.margin, statsY + (index * 8));
        });
        
        // Most connected traits
        if (data.traits && data.traits.length > 0) {
            const connectedTraits = [...data.traits]
                .sort((a, b) => (b.connections?.length || 0) - (a.connections?.length || 0))
                .slice(0, 5);
            
            const traitsY = statsY + (stats.length * 8) + 15;
            this.doc.setFontSize(14);
            this.doc.setTextColor(28, 78, 128);
            this.doc.text('Most Connected Clinical Traits', this.margin, traitsY);
            
            this.doc.setFontSize(10);
            connectedTraits.forEach((trait, index) => {
                const y = traitsY + 10 + (index * 8);
                this.doc.text(`${index + 1}. ${trait.name.substring(0, 35)}`, this.margin + 5, y);
                this.doc.text(`Connections: ${trait.connections?.length || 0}`, this.pageWidth - this.margin - 40, y);
            });
        }
        
        // Connection strength analysis
        if (data.connections && data.connections.length > 0) {
            const strengthY = this.doc.internal.pageSize.height - 60;
            this.generateConnectionStrengthAnalysis(data.connections, strengthY);
        }
    }
    
    generateConnectionStrengthAnalysis(connections, startY) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Connection Strength Analysis', this.margin, startY);
        
        // Calculate strength distribution
        const strengthGroups = {
            strong: connections.filter(c => c.strength >= 80).length,
            moderate: connections.filter(c => c.strength >= 50 && c.strength < 80).length,
            weak: connections.filter(c => c.strength < 50).length
        };
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        Object.entries(strengthGroups).forEach(([strength, count], index) => {
            const y = startY + 10 + (index * 6);
            const percentage = ((count / connections.length) * 100).toFixed(1);
            this.doc.text(`${strength.charAt(0).toUpperCase() + strength.slice(1)} (${percentage}%): ${count} connections`, this.margin + 5, y);
        });
    }
    
    generateTreatmentPathways(data) {
        this.doc.setFontSize(20);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('TREATMENT PATHWAYS & RECOMMENDATIONS', this.margin, 30);
        
        if (!data.traits || data.traits.length === 0) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text('No treatment recommendations available.', this.margin, 50);
            return;
        }
        
        // Sort by severity and get top traits
        const sortedTraits = [...data.traits].sort((a, b) => b.severity - a.severity);
        const topTraits = sortedTraits.slice(0, 5);
        
        let currentY = 45;
        
        topTraits.forEach((trait, index) => {
            // Check if we need a new page
            if (currentY > 250) {
                this.doc.addPage();
                currentY = 30;
            }
            
            // Trait header with colored severity indicator
            this.doc.setFillColor(this.getSeverityColor(trait.severity));
            this.doc.rect(this.margin, currentY - 2, 5, 10, 'F');
            
            this.doc.setFontSize(12);
            this.doc.setTextColor(28, 78, 128);
            this.doc.text(`${index + 1}. ${trait.name}`, this.margin + 10, currentY + 5);
            
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Severity: ${trait.severity}% | Category: ${trait.category}`, this.pageWidth - this.margin - 50, currentY + 5, { align: 'right' });
            
            currentY += 10;
            
            // Treatment recommendations
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            const treatment = typeof trait.treatment === 'object' ? trait.treatment : { firstLine: trait.treatment };
            
            this.doc.text('First-line Treatment:', this.margin + 15, currentY);
            this.doc.text(treatment.firstLine.substring(0, 80) + (treatment.firstLine.length > 80 ? '...' : ''), this.margin + 15, currentY + 5);
            currentY += 15;
            
            if (treatment.secondLine) {
                this.doc.text('Second-line/Add-on:', this.margin + 15, currentY);
                this.doc.text(treatment.secondLine.substring(0, 70) + (treatment.secondLine.length > 70 ? '...' : ''), this.margin + 15, currentY + 5);
                currentY += 12;
            }
            
            if (treatment.nonPharmacological) {
                this.doc.text('Non-Pharmacological:', this.margin + 15, currentY);
                this.doc.text(treatment.nonPharmacological.substring(0, 70) + (treatment.nonPharmacological.length > 70 ? '...' : ''), this.margin + 15, currentY + 5);
                currentY += 12;
            }
            
            currentY += 10;
            
            // Separator line
            if (index < topTraits.length - 1) {
                this.doc.setDrawColor(220, 220, 220);
                this.doc.setLineWidth(0.2);
                this.doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
                currentY += 5;
            }
        });
        
        // Clinical management plan
        if (currentY < 200) {
            this.generateManagementPlan(currentY + 20);
        } else {
            this.doc.addPage();
            this.generateManagementPlan(30);
        }
    }
    
    generateManagementPlan(startY) {
        this.doc.setFontSize(16);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL MANAGEMENT PLAN', this.margin, startY);
        
        const phases = [
            {
                title: 'IMMEDIATE ACTIONS (0-2 weeks)',
                items: [
                    'Initiate first-line therapy for highest severity traits',
                    'Baseline biomarker assessment and monitoring',
                    'Patient education on treatment expectations and goals',
                    'Schedule follow-up appointment within 2 weeks',
                    'Address any urgent safety concerns'
                ]
            },
            {
                title: 'SHORT-TERM MANAGEMENT (2-8 weeks)',
                items: [
                    'Monitor treatment response and adjust as needed',
                    'Address medication side effects and adherence',
                    'Implement non-pharmacological interventions',
                    'Coordinate with multidisciplinary team members',
                    'Assess and manage comorbid conditions'
                ]
            },
            {
                title: 'LONG-TERM FOLLOW-UP (8+ weeks)',
                items: [
                    'Regular monitoring of clinical parameters',
                    'Assess treatment adherence and identify barriers',
                    'Update management plan based on treatment response',
                    'Provide ongoing patient education and support',
                    'Plan for maintenance therapy and prevention'
                ]
            }
        ];
        
        let currentY = startY + 15;
        
        phases.forEach((phase, phaseIndex) => {
            // Phase title
            this.doc.setFontSize(12);
            this.doc.setTextColor(74, 139, 201);
            this.doc.text(phase.title, this.margin, currentY);
            currentY += 8;
            
            // Phase items
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            phase.items.forEach((item, itemIndex) => {
                if (currentY > 280) {
                    this.doc.addPage();
                    currentY = 30;
                }
                
                this.doc.text(`• ${item}`, this.margin + 5, currentY);
                currentY += 6;
            });
            
            currentY += 5;
        });
    }
    
    generateEmptyReport() {
        this.doc.setFontSize(20);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('NO CLINICAL DATA AVAILABLE', this.pageWidth / 2, 150, { align: 'center' });
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Add clinical traits to generate a comprehensive report.', this.pageWidth / 2, 165, { align: 'center' });
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
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth / 2, 290, { align: 'center' });
            
            // Report footer
            this.doc.text('TraitMap Pro Clinical Intelligence Platform', this.margin, 290);
            this.doc.text('Confidential Medical Document', this.pageWidth - this.margin, 290, { align: 'right' });
        }
    }
    
    // Helper methods
    getSeverityLevel(severity) {
        if (severity >= 80) return 'CRITICAL';
        if (severity >= 65) return 'HIGH';
        if (severity >= 50) return 'MODERATE';
        return 'LOW';
    }
    
    getSeverityColor(severity) {
        if (severity >= 80) return [214, 69, 80];    // red
        if (severity >= 65) return [224, 122, 95];   // orange
        if (severity >= 50) return [242, 204, 143];  // yellow
        return [129, 178, 154];                      // green
    }
    
    calculateNetworkDensity(metrics) {
        const n = metrics.totalTraits || 0;
        const possibleConnections = n * (n - 1) / 2;
        const actualConnections = metrics.totalConnections || 0;
        
        if (possibleConnections === 0) return 0;
        return ((actualConnections / possibleConnections) * 100).toFixed(1);
    }
    
    calculateAverageDegree(metrics) {
        const n = metrics.totalTraits || 1;
        const connections = metrics.totalConnections || 0;
        return (connections / n).toFixed(1);
    }
    
    generateKeyRecommendations(metrics) {
        let recommendations = '';
        
        if (metrics.criticalTraits > 0) {
            recommendations += `${metrics.criticalTraits} critical trait(s) identified requiring immediate intervention. `;
        }
        
        if (metrics.highSeverity > 0) {
            recommendations += `${metrics.highSeverity} high-severity trait(s) need prioritized management. `;
        }
        
        if (metrics.totalConnections > 5) {
            recommendations += 'Multiple clinical relationships suggest systemic involvement requiring comprehensive management.';
        }
        
        return recommendations || 'No specific recommendations generated.';
    }
    
    // Export specific sections
    exportSection(data, section) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();
        
        switch(section) {
            case 'traits':
                this.generateClinicalTraits(data);
                break;
            case 'network':
                this.generateClinicalNetwork(data);
                break;
            case 'treatment':
                this.generateTreatmentPathways(data);
                break;
            case 'summary':
                this.generateExecutiveSummary(data);
                break;
            default:
                return this.generateReport(data);
        }
        
        const fileName = `Clinical_${section}_${this.getFormattedDate()}.pdf`;
        this.doc.save(fileName);
        
        return true;
    }
}
