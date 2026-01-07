// pdf-generator.js

class ClinicalPDFGenerator {
    constructor() {
        this.doc = null;
    }
    
    generateReport(data) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();
        
        // Generate report sections
        this.generateCoverPage(data);
        this.doc.addPage();
        this.generateExecutiveSummary(data);
        this.doc.addPage();
        this.generateClinicalTraits(data);
        this.doc.addPage();
        this.generateClinicalNetwork(data);
        this.doc.addPage();
        this.generateTreatmentPathways(data);
        
        // Save the PDF
        const fileName = `Clinical_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        this.doc.save(fileName);
    }
    
    generateCoverPage(data) {
        this.doc.setFontSize(28);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('COMPREHENSIVE CLINICAL ASSESSMENT', 105, 40, { align: 'center' });
        
        this.doc.setFontSize(16);
        this.doc.setTextColor(74, 139, 201);
        this.doc.text('TraitMap Pro Clinical Intelligence Platform', 105, 60, { align: 'center' });
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`Generated: ${data.date} at ${data.time}`, 105, 75, { align: 'center' });
        
        // Patient information
        this.doc.setFontSize(14);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Patient Clinical Profile', 20, 100);
        
        this.doc.setFontSize(11);
        this.doc.text(`Assessment Type: ${data.patientInfo}`, 20, 115);
        this.doc.text(`Total Clinical Traits: ${data.metrics.totalTraits}`, 20, 125);
        this.doc.text(`Clinical Relationships: ${data.metrics.totalConnections}`, 20, 135);
        this.doc.text(`Average Severity: ${data.metrics.avgSeverity}%`, 20, 145);
        this.doc.text(`Complexity Score: ${data.metrics.complexityScore}/100`, 20, 155);
        
        // Confidentiality notice
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('CONFIDENTIAL MEDICAL DOCUMENT - FOR CLINICAL USE ONLY', 105, 280, { align: 'center' });
    }
    
    generateExecutiveSummary(data) {
        this.doc.setFontSize(18);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('EXECUTIVE SUMMARY', 20, 30);
        
        const summary = `
This comprehensive clinical assessment identifies ${data.metrics.totalTraits} clinically significant traits with ${data.metrics.totalConnections} established clinical relationships. 

The patient presents with an average clinical severity of ${data.metrics.avgSeverity}%, indicating ${data.metrics.avgSeverity >= 80 ? 'critical' : data.metrics.avgSeverity >= 65 ? 'high' : 'moderate'} clinical complexity.

Key clinical domains identified include: ${Object.keys(data.metrics.categoryDistribution).map(cat => cat).join(', ')}.

${data.metrics.criticalTraits > 0 ? `${data.metrics.criticalTraits} critical traits require immediate clinical intervention.` : ''}

This report provides evidence-based treatment recommendations and clinical management pathways.
        `.trim();
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(80, 80, 80);
        this.doc.text(this.doc.splitTextToSize(summary, 170), 20, 45);
        
        // Key findings box
        this.doc.setFillColor(240, 245, 250);
        this.doc.roundedRect(20, 120, 170, 60, 3, 3, 'F');
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('KEY FINDINGS', 25, 135);
        
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        
        const findings = [
            `• ${data.metrics.highSeverity} high-severity clinical traits`,
            `• ${data.metrics.totalConnections} identified clinical relationships`,
            `• ${Object.keys(data.metrics.categoryDistribution).length} clinical domains affected`,
            `• Complexity score: ${data.metrics.complexityScore}/100`
        ];
        
        findings.forEach((finding, index) => {
            this.doc.text(finding, 30, 145 + (index * 8));
        });
    }
    
    generateClinicalTraits(data) {
        this.doc.setFontSize(18);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL TRAITS DETAILS', 20, 30);
        
        // Create table data
        const tableData = data.traits.map(trait => [
            trait.name.substring(0, 30),
            trait.category,
            `${trait.severity}%`,
            trait.connections ? trait.connections.length : 0
        ]);
        
        // Generate table
        this.doc.autoTable({
            startY: 40,
            head: [['Trait', 'Category', 'Severity', 'Connections']],
            body: tableData,
            headStyles: { 
                fillColor: [28, 78, 128], 
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { left: 20, right: 20 },
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 40 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 }
            }
        });
        
        // Add severity distribution
        const yPos = this.doc.lastAutoTable.finalY + 15;
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Severity Distribution', 20, yPos);
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        const severityGroups = {
            'Critical (80-100%)': data.traits.filter(t => t.severity >= 80).length,
            'High (65-79%)': data.traits.filter(t => t.severity >= 65 && t.severity < 80).length,
            'Moderate (50-64%)': data.traits.filter(t => t.severity >= 50 && t.severity < 65).length,
            'Low (0-49%)': data.traits.filter(t => t.severity < 50).length
        };
        
        let currentY = yPos + 10;
        Object.entries(severityGroups).forEach(([group, count], index) => {
            this.doc.text(`${group}: ${count} traits`, 25, currentY + (index * 8));
        });
    }
    
    generateClinicalNetwork(data) {
        this.doc.setFontSize(18);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('CLINICAL NETWORK ANALYSIS', 20, 30);
        
        // Network statistics
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        
        const stats = [
            `Total Clinical Traits: ${data.metrics.totalTraits}`,
            `Total Relationships: ${data.metrics.totalConnections}`,
            `Network Density: ${((data.metrics.totalConnections / Math.max(1, (data.metrics.totalTraits * (data.metrics.totalTraits - 1)) / 2)) * 100).toFixed(1)}%`,
            `Average Connections per Trait: ${(data.metrics.totalConnections / Math.max(1, data.metrics.totalTraits)).toFixed(1)}`
        ];
        
        stats.forEach((stat, index) => {
            this.doc.text(stat, 20, 45 + (index * 8));
        });
        
        // Connection strength analysis
        const yPos = 85;
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Connection Strength Analysis', 20, yPos);
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        const strengthGroups = {
            'Strong (80-100%)': data.connections.filter(c => c.strength >= 80).length,
            'Moderate (50-79%)': data.connections.filter(c => c.strength >= 50 && c.strength < 80).length,
            'Weak (0-49%)': data.connections.filter(c => c.strength < 50).length
        };
        
        Object.entries(strengthGroups).forEach(([group, count], index) => {
            this.doc.text(`${group}: ${count} connections`, 25, yPos + 10 + (index * 8));
        });
        
        // Most connected traits
        const connectedTraits = data.traits
            .map(trait => ({
                name: trait.name,
                connections: trait.connections ? trait.connections.length : 0,
                severity: trait.severity
            }))
            .sort((a, b) => b.connections - a.connections)
            .slice(0, 5);
        
        const traitsY = yPos + 40;
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Most Connected Clinical Traits', 20, traitsY);
        
        this.doc.setFontSize(10);
        connectedTraits.forEach((trait, index) => {
            const y = traitsY + 10 + (index * 8);
            this.doc.text(`${index + 1}. ${trait.name}`, 25, y);
            this.doc.text(`Connections: ${trait.connections} | Severity: ${trait.severity}%`, 120, y);
        });
        
        // Add network image if available
        if (data.networkImage && data.traits.length > 0) {
            const imageY = this.doc.internal.pageSize.height - 100;
            try {
                this.doc.addImage(data.networkImage, 'PNG', 20, imageY, 170, 80);
                this.doc.text('Clinical Network Visualization', 20, imageY - 5);
            } catch (error) {
                console.log('Could not add network image to PDF');
            }
        }
    }
    
    generateTreatmentPathways(data) {
        this.doc.setFontSize(18);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('TREATMENT PATHWAYS & RECOMMENDATIONS', 20, 30);
        
        // Sort traits by severity
        const sortedTraits = [...data.traits].sort((a, b) => b.severity - a.severity);
        const topTraits = sortedTraits.slice(0, 5);
        
        let currentY = 45;
        
        topTraits.forEach((trait, index) => {
            // Trait header
            this.doc.setFontSize(12);
            this.doc.setTextColor(28, 78, 128);
            this.doc.text(`${index + 1}. ${trait.name} (Severity: ${trait.severity}%)`, 20, currentY);
            
            // Treatment details
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 0, 0);
            
            const treatment = typeof trait.treatment === 'object' ? 
                trait.treatment : { firstLine: trait.treatment };
            
            currentY += 8;
            this.doc.text(`First-line Treatment: ${treatment.firstLine}`, 25, currentY);
            
            if (treatment.secondLine) {
                currentY += 6;
                this.doc.text(`Second-line: ${treatment.secondLine}`, 25, currentY);
            }
            
            if (treatment.nonPharmacological) {
                currentY += 6;
                this.doc.text(`Non-pharmacological: ${treatment.nonPharmacological}`, 25, currentY);
            }
            
            currentY += 12;
            
            // Add page if needed
            if (currentY > 250) {
                this.doc.addPage();
                currentY = 30;
            }
        });
        
        // Clinical Management Plan
        const planY = currentY + 10;
        this.doc.setFontSize(14);
        this.doc.setTextColor(28, 78, 128);
        this.doc.text('Clinical Management Plan', 20, planY);
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        
        const managementSteps = [
            '1. IMMEDIATE ACTIONS (0-2 weeks):',
            '   • Initiate first-line therapy for highest severity traits',
            '   • Baseline biomarker assessment',
            '   • Patient education on treatment expectations',
            '   • Schedule follow-up appointment within 2 weeks',
            '',
            '2. SHORT-TERM MANAGEMENT (2-8 weeks):',
            '   • Monitor treatment response and adjust as needed',
            '   • Address medication side effects',
            '   • Implement non-pharmacological interventions',
            '   • Coordinate with multidisciplinary team',
            '',
            '3. LONG-TERM FOLLOW-UP (8+ weeks):',
            '   • Regular monitoring of clinical parameters',
            '   • Assess treatment adherence and barriers',
            '   • Update management plan based on response',
            '   • Provide ongoing patient education and support'
        ];
        
        managementSteps.forEach((step, index) => {
            const y = planY + 10 + (index * 6);
            if (y > 280) {
                this.doc.addPage();
                currentY = 30;
                return;
            }
            this.doc.text(step, 20, y);
        });
        
        // Footer with recommendations
        const footerY = this.doc.internal.pageSize.height - 30;
        this.doc.setFontSize(9);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('This report is generated by TraitMap Pro Clinical Intelligence Platform', 105, footerY, { align: 'center' });
        this.doc.text('For clinical use only - Consult with healthcare professionals for treatment decisions', 105, footerY + 5, { align: 'center' });
    }
    
    // Export specific data to PDF
    exportData(data, format = 'full') {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();
        
        switch(format) {
            case 'traits':
                this.generateClinicalTraits(data);
                break;
            case 'network':
                this.generateClinicalNetwork(data);
                break;
            case 'treatment':
                this.generateTreatmentPathways(data);
                break;
            default:
                this.generateReport(data);
        }
        
        const fileName = `Clinical_${format}_${new Date().toISOString().split('T')[0]}.pdf`;
        this.doc.save(fileName);
    }
}
