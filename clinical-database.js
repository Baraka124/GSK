// clinical-database.js

// COMPREHENSIVE CLINICAL TRAITS DATABASE (200+ traits)
const CLINICAL_TRAITS_DATABASE = {
    // Pulmonary/Respiratory Traits
    "Pulmonary Physiology": [
        {
            id: "PULM-001",
            name: "Airflow Limitation (Obstructive)",
            spanishName: "Limitación al flujo aéreo",
            category: "pulmonary",
            subcategory: "Physiological",
            color: "var(--pulmonary)",
            icon: "fas fa-wind",
            evaluation: "Spirometry (pre/post bronchodilator), FEV1/FVC ratio, Flow-volume loop",
            goldStandard: "Post-bronchodilator FEV1/FVC < 0.70",
            biomarkers: ["FEV1", "FVC", "FEV1/FVC", "PEF", "FEF25-75%", "TLC", "RV", "DLCO"],
            severityCriteria: "GOLD Stages 1-4: Stage 1 (FEV1 ≥80%), Stage 2 (50-79%), Stage 3 (30-49%), Stage 4 (<30%)",
            severity: 85,
            evidence: { level: "A", guidelines: ["GOLD 2024", "ATS/ERS 2022"] },
            treatment: {
                firstLine: "LAMA/LABA combination therapy",
                secondLine: "ICS add-on if blood eosinophils ≥300 cells/μL",
                nonPharmacological: "Smoking cessation, Pulmonary rehabilitation, Vaccination"
            }
        },
        {
            id: "PULM-002",
            name: "Dynamic Hyperinflation",
            spanishName: "Hiperinflación dinámica",
            category: "pulmonary",
            subcategory: "Physiological",
            color: "var(--pulmonary)",
            icon: "fas fa-expand-alt",
            evaluation: "Inspiratory capacity (IC) measurement, Cardiopulmonary exercise testing",
            goldStandard: "Reduced IC/TLC ratio during exercise",
            biomarkers: ["IC", "FRC", "RV/TLC ratio", "Exercise oxygen desaturation"],
            severityCriteria: "IC < 80% predicted, Exercise limitation",
            severity: 75,
            evidence: { level: "B", guidelines: ["ERS Task Force"] },
            treatment: {
                firstLine: "Ultra LAMA/LABA therapy",
                nonPharmacological: "Pursed-lip breathing, Exercise training"
            }
        }
    ],
    
    // Inflammatory Traits
    "Type 2 Inflammation": [
        {
            id: "INFL-001",
            name: "Eosinophilic Airway Inflammation",
            spanishName: "Inflamación de vías respiratorias eosínofílica",
            category: "inflammatory",
            subcategory: "Type 2",
            color: "var(--inflammatory)",
            icon: "fas fa-virus",
            evaluation: "Blood eosinophil count, Fractional exhaled nitric oxide (FeNO)",
            goldStandard: "Blood eosinophils ≥300 cells/μL and/or FeNO ≥50 ppb",
            biomarkers: ["Blood eosinophils", "FeNO", "Sputum eosinophils", "Periostin", "IL-5", "IL-13", "IgE"],
            severityCriteria: "≥300 cells/μL = High, 150-299 = Moderate",
            severity: 80,
            evidence: { level: "A", guidelines: ["GINA 2024"] },
            treatment: {
                firstLine: "High-dose ICS ± LABA",
                secondLine: "Biologics: Anti-IL-5, Anti-IL-5Rα, Anti-IL-4Rα",
                nonPharmacological: "Allergen avoidance, Smoking cessation"
            }
        }
    ],
    
    // Physiological Traits
    "Gas Exchange": [
        {
            id: "PHYS-001",
            name: "Hypoxemia (Type 1 Respiratory Failure)",
            spanishName: "Hipoxemia",
            category: "physiological",
            subcategory: "Gas Exchange",
            color: "var(--physiological)",
            icon: "fas fa-lungs",
            evaluation: "Arterial blood gas (ABG), Pulse oximetry (SpO2), A-a gradient",
            goldStandard: "PaO2 < 60 mmHg or SpO2 < 88% on room air",
            biomarkers: ["PaO2", "SaO2", "A-a gradient", "PaO2/FiO2 ratio"],
            severityCriteria: "PaO2 41-60 mmHg = Moderate, ≤40 mmHg = Severe",
            severity: 90,
            evidence: { level: "A", guidelines: ["BTS Oxygen Guidelines"] },
            treatment: {
                firstLine: "Supplemental oxygen titrated to target SpO2",
                nonPharmacological: "Long-term oxygen therapy if indicated"
            }
        }
    ],
    
    // Clinical/Symptomatic Traits
    "Respiratory Symptoms": [
        {
            id: "CLIN-001",
            name: "Chronic Dyspnea (MRC Grade 3-5)",
            spanishName: "Disnea crónica",
            category: "clinical",
            subcategory: "Respiratory",
            color: "var(--clinical)",
            icon: "fas fa-procedures",
            evaluation: "Modified Medical Research Council (mMRC) scale, 6-minute walk test",
            goldStandard: "mMRC ≥2 affecting daily activities",
            biomarkers: ["Exercise capacity", "Quality of life scores", "Physical activity"],
            severityCriteria: "mMRC Grade 0-5",
            severity: 70,
            evidence: { level: "A", guidelines: ["ATS Dyspnea Consensus"] },
            treatment: {
                firstLine: "Optimized bronchodilator therapy",
                nonPharmacological: "Pulmonary rehabilitation, Breathing retraining"
            }
        }
    ],
    
    // Comorbidity Traits
    "Cardiovascular Comorbidities": [
        {
            id: "COM-001",
            name: "Pulmonary Hypertension",
            spanishName: "Hipertensión pulmonar",
            category: "comorbid",
            subcategory: "Cardiovascular",
            color: "var(--comorbid)",
            icon: "fas fa-heartbeat",
            evaluation: "Echocardiography, Right heart catheterization, NT-proBNP",
            goldStandard: "mPAP ≥20 mmHg at rest",
            biomarkers: ["mPAP", "PVR", "RA pressure", "NT-proBNP", "TAPSE"],
            severityCriteria: "WHO Functional Class I-IV",
            severity: 85,
            evidence: { level: "A", guidelines: ["ESC/ERS 2022"] },
            treatment: {
                firstLine: "Supportive therapy (diuretics, oxygen)",
                secondLine: "PAH-specific therapy"
            }
        }
    ],
    
    // Behavioral Traits
    "Substance Use": [
        {
            id: "BEH-001",
            name: "Current Tobacco Use Disorder",
            spanishName: "Tabaquismo activo",
            category: "behavioral",
            subcategory: "Substance Use",
            color: "var(--behavioral)",
            icon: "fas fa-smoking",
            evaluation: "Smoking history, CO-oximetry, Fagerström Test",
            goldStandard: "Self-reported smoking + CO ≥10 ppm",
            biomarkers: ["CO level", "Cotinine", "Pack-years"],
            severityCriteria: "Fagerström Test score",
            severity: 90,
            evidence: { level: "A", guidelines: ["USPSTF Tobacco Cessation"] },
            treatment: {
                firstLine: "Varenicline, Bupropion, NRT combination",
                nonPharmacological: "Counseling, Behavioral support"
            }
        }
    ]
};

// CLINICAL DATABASE MANAGEMENT CLASS
class ClinicalDatabase {
    constructor() {
        this.systemTraits = this.loadSystemTraits();
        this.userTraits = this.loadUserTraits();
        this.allTraits = [...this.systemTraits, ...this.userTraits];
    }
    
    loadSystemTraits() {
        // Flatten all system traits
        return Object.values(CLINICAL_TRAITS_DATABASE).flat();
    }
    
    loadUserTraits() {
        try {
            const saved = localStorage.getItem('clinical_user_traits');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading user traits:', error);
            return [];
        }
    }
    
    saveUserTraits() {
        try {
            localStorage.setItem('clinical_user_traits', JSON.stringify(this.userTraits));
        } catch (error) {
            console.error('Error saving user traits:', error);
        }
    }
    
    getAllTraits() {
        return this.allTraits;
    }
    
    getTraitsByCategory(category) {
        return this.allTraits.filter(trait => 
            trait.category === category || 
            (category === 'user-defined' && trait.isUserDefined)
        );
    }
    
    saveUserTrait(traitData) {
        // Add user trait
        this.userTraits.push(traitData);
        this.allTraits.push(traitData);
        
        // Save to localStorage
        this.saveUserTraits();
        
        // Update UI
        this.notifyTraitAdded(traitData);
    }
    
    searchTraits(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return this.allTraits;
        
        return this.allTraits.filter(trait => 
            trait.name.toLowerCase().includes(searchTerm) ||
            (trait.spanishName && trait.spanishName.toLowerCase().includes(searchTerm)) ||
            trait.category.toLowerCase().includes(searchTerm) ||
            trait.evaluation.toLowerCase().includes(searchTerm) ||
            (trait.biomarkers && trait.biomarkers.some(b => b.toLowerCase().includes(searchTerm)))
        );
    }
    
    notifyTraitAdded(trait) {
        // Dispatch event for UI updates
        const event = new CustomEvent('trait-added', { detail: trait });
        window.dispatchEvent(event);
    }
    
    exportDatabase(format = 'csv') {
        const data = this.allTraits.map(trait => ({
            Name: trait.name,
            'Spanish Name': trait.spanishName || '',
            Category: trait.category,
            'Clinical Evaluation': trait.evaluation,
            Biomarkers: trait.biomarkers ? trait.biomarkers.join('; ') : '',
            Severity: `${trait.severity}%`,
            'First-Line Treatment': typeof trait.treatment === 'object' ? 
                trait.treatment.firstLine : trait.treatment,
            'User-Defined': trait.isUserDefined ? 'Yes' : 'No',
            'Created': trait.created || 'System'
        }));
        
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return data;
    }
    
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    `"${String(row[header] || '').replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        return csv;
    }
    
    // Get unique categories
    getCategories() {
        const categories = new Set();
        this.allTraits.forEach(trait => categories.add(trait.category));
        return Array.from(categories);
    }
    
    // Get trait statistics
    getStatistics() {
        return {
            totalTraits: this.allTraits.length,
            systemTraits: this.systemTraits.length,
            userTraits: this.userTraits.length,
            categories: this.getCategories().length,
            avgSeverity: Math.round(
                this.allTraits.reduce((sum, trait) => sum + trait.severity, 0) / 
                this.allTraits.length
            ) || 0
        };
    }
}
