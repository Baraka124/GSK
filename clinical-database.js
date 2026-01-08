// ============================================================================
// CLINICAL DATABASE v3.0 - COMPLETE REWRITE
// ============================================================================
// Advanced Clinical Intelligence Platform with Pattern Detection, Predictive
// Analytics, Guidelines Integration, and Conflict Detection
// ============================================================================

class ClinicalDatabase {
    constructor() {
        console.log('Initializing Clinical Database v3.0...');
        
        // Core Data Stores
        this.systemTraits = this.loadSystemTraits();
        this.userTraits = this.loadUserTraits();
        this.connections = this.loadConnections();
        this.clinicalCases = this.loadClinicalCases();
        this.favoriteTraits = this.loadFavorites();
        this.searchHistory = this.loadSearchHistory();
        this.guidelines = this.loadClinicalGuidelines();
        this.treatmentConflicts = this.loadTreatmentConflicts();
        
        // Analytics Cache
        this.analyticsCache = {
            patterns: null,
            clusters: null,
            predictions: null,
            lastUpdated: null
        };
        
        // Derived Data
        this.allTraits = [...this.systemTraits, ...this.userTraits];
        this.categories = this.extractCategories();
        this.evidenceLevels = ['A', 'B', 'C', 'D', 'E'];
        
        // Configuration
        this.config = {
            maxSearchHistory: 50,
            maxFavorites: 100,
            analyticsRefreshInterval: 300000, // 5 minutes
            conflictCheckThreshold: 70,
            patternDetectionThreshold: 60
        };
        
        // Initialize
        this.initializeDatabase();
        this.setupEventListeners();
        this.precomputeAnalytics();
        
        console.log(`Clinical Database initialized with ${this.allTraits.length} traits, ${this.connections.length} connections`);
    }
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    initializeDatabase() {
        // Ensure default traits exist
        if (this.systemTraits.length === 0) {
            console.warn('No system traits found, loading defaults...');
            this.systemTraits = this.getDefaultTraits();
            this.saveSystemTraits();
        }
        
        // Ensure user traits array exists
        if (!Array.isArray(this.userTraits)) {
            this.userTraits = [];
        }
        
        // Update all traits
        this.allTraits = [...this.systemTraits, ...this.userTraits];
        
        // Extract categories
        this.categories = this.extractCategories();
        
        // Generate unique IDs for any traits without them
        this.allTraits.forEach((trait, index) => {
            if (!trait.id) {
                trait.id = `TRAIT-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            }
        });
    }
    
    setupEventListeners() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            this.handleStorageEvent(e);
        });
        
        // Listen for custom events
        window.addEventListener('clinical:data-changed', () => {
            this.precomputeAnalytics();
        });
    }
    
    handleStorageEvent(e) {
        switch(e.key) {
            case 'clinical_user_traits':
                this.userTraits = this.loadUserTraits();
                this.allTraits = [...this.systemTraits, ...this.userTraits];
                this.emitUpdateEvent();
                break;
                
            case 'clinical_connections':
                this.connections = this.loadConnections();
                this.emitUpdateEvent();
                break;
                
            case 'clinical_favorites':
                this.favoriteTraits = this.loadFavorites();
                break;
        }
    }
    
    // ============================================================================
    // CORE DATA MANAGEMENT
    // ============================================================================
    
    loadSystemTraits() {
        try {
            const stored = localStorage.getItem('clinical_system_traits');
            if (stored) {
                const traits = JSON.parse(stored);
                return this.validateAndCleanTraits(traits, false);
            }
            return this.getDefaultTraits();
        } catch (error) {
            console.error('Error loading system traits:', error);
            return this.getDefaultTraits();
        }
    }
    
    saveSystemTraits() {
        try {
            localStorage.setItem('clinical_system_traits', JSON.stringify(this.systemTraits));
            return true;
        } catch (error) {
            console.error('Error saving system traits:', error);
            return false;
        }
    }
    
    loadUserTraits() {
        try {
            const saved = localStorage.getItem('clinical_user_traits');
            if (!saved) return [];
            
            const traits = JSON.parse(saved);
            return this.validateAndCleanTraits(traits, true);
        } catch (error) {
            console.error('Error loading user traits:', error);
            return [];
        }
    }
    
    saveUserTraits() {
        try {
            const cleanTraits = this.userTraits.map(trait => ({
                id: trait.id,
                name: trait.name,
                spanishName: trait.spanishName || '',
                category: trait.category,
                subcategory: trait.subcategory || '',
                evaluation: trait.evaluation,
                severity: trait.severity,
                treatment: trait.treatment,
                biomarkers: trait.biomarkers || [],
                evidence: trait.evidence || { level: 'C' },
                tags: trait.tags || [],
                color: trait.color,
                icon: trait.icon,
                isUserDefined: true,
                created: trait.created || new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: trait.frequency || 0,
                confidence: trait.confidence || 0.5
            }));
            
            localStorage.setItem('clinical_user_traits', JSON.stringify(cleanTraits));
            this.emitUpdateEvent();
            return true;
        } catch (error) {
            console.error('Error saving user traits:', error);
            return false;
        }
    }
    
    loadConnections() {
        try {
            const saved = localStorage.getItem('clinical_connections');
            if (!saved) return [];
            
            const connections = JSON.parse(saved);
            return connections.map(conn => ({
                ...conn,
                created: conn.created || new Date().toISOString(),
                updated: conn.updated || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error loading connections:', error);
            return [];
        }
    }
    
    saveConnections() {
        try {
            localStorage.setItem('clinical_connections', JSON.stringify(this.connections));
            return true;
        } catch (error) {
            console.error('Error saving connections:', error);
            return false;
        }
    }
    
    loadClinicalCases() {
        try {
            const saved = localStorage.getItem('clinical_cases');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading clinical cases:', error);
            return [];
        }
    }
    
    saveClinicalCases() {
        try {
            localStorage.setItem('clinical_cases', JSON.stringify(this.clinicalCases));
            return true;
        } catch (error) {
            console.error('Error saving clinical cases:', error);
            return false;
        }
    }
    
    loadFavorites() {
        try {
            const saved = localStorage.getItem('clinical_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }
    
    saveFavorites() {
        try {
            localStorage.setItem('clinical_favorites', JSON.stringify(this.favoriteTraits));
            return true;
        } catch (error) {
            console.error('Error saving favorites:', error);
            return false;
        }
    }
    
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('clinical_search_history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }
    
    saveSearchHistory() {
        try {
            // Keep only recent searches
            if (this.searchHistory.length > this.config.maxSearchHistory) {
                this.searchHistory = this.searchHistory.slice(-this.config.maxSearchHistory);
            }
            localStorage.setItem('clinical_search_history', JSON.stringify(this.searchHistory));
            return true;
        } catch (error) {
            console.error('Error saving search history:', error);
            return false;
        }
    }
    
    loadClinicalGuidelines() {
        // Built-in clinical guidelines database
        return [
            {
                id: 'GOLD-2024',
                name: 'GOLD 2024 Guidelines',
                category: 'pulmonary',
                type: 'diagnostic',
                description: 'Global Initiative for Chronic Obstructive Lung Disease',
                recommendations: [
                    'Post-bronchodilator FEV1/FVC < 0.70 confirms COPD',
                    'Assess symptom burden and exacerbation risk',
                    'Consider blood eosinophil count for ICS therapy',
                    'Vaccination (influenza, pneumococcal) recommended'
                ],
                references: ['Lancet. 2018;391(10131):1706-1717'],
                evidenceLevel: 'A'
            },
            {
                id: 'GINA-2024',
                name: 'GINA 2024 Guidelines',
                category: 'pulmonary',
                type: 'treatment',
                description: 'Global Initiative for Asthma',
                recommendations: [
                    'Stepwise approach to asthma management',
                    'Prefer ICS-containing controller therapy',
                    'Assess inhaler technique regularly',
                    'Consider FeNO for treatment adjustment'
                ],
                references: ['Eur Respir J. 2021;57(6):2003149'],
                evidenceLevel: 'A'
            },
            {
                id: 'ATS-ERS-2022',
                name: 'ATS/ERS 2022 Statement',
                category: 'pulmonary',
                type: 'diagnostic',
                description: 'American Thoracic Society/European Respiratory Society',
                recommendations: [
                    'Use post-bronchodilator spirometry for diagnosis',
                    'Consider lung volume measurements in complex cases',
                    'DLCO for emphysema assessment',
                    '6-minute walk test for functional assessment'
                ],
                references: ['Am J Respir Crit Care Med. 2022;205(7):819-837'],
                evidenceLevel: 'A'
            }
        ];
    }
    
    loadTreatmentConflicts() {
        // Built-in treatment conflict database
        return [
            {
                trait1: 'Airflow Limitation (Obstructive)',
                trait2: 'Beta-Blocker Therapy',
                severity: 'high',
                description: 'Non-cardioselective beta-blockers can worsen airflow obstruction',
                recommendation: 'Use cardioselective beta-blockers if needed',
                evidenceLevel: 'B'
            },
            {
                trait1: 'Eosinophilic Airway Inflammation',
                trait2: 'Oral Corticosteroids (Long-term)',
                severity: 'moderate',
                description: 'Long-term oral corticosteroids increase risk of adverse effects',
                recommendation: 'Consider biologics or targeted therapies first',
                evidenceLevel: 'B'
            },
            {
                trait1: 'Systemic Inflammation',
                trait2: 'NSAID Therapy',
                severity: 'low',
                description: 'NSAIDs may increase cardiovascular risk in systemic inflammation',
                recommendation: 'Monitor cardiovascular risk factors',
                evidenceLevel: 'C'
            }
        ];
    }
    
    // ============================================================================
    // DEFAULT DATA
    // ============================================================================
    
    getDefaultTraits() {
        return [
            // Pulmonary Traits
            {
                id: "PULM-001",
                name: "Airflow Limitation (Obstructive)",
                spanishName: "Limitación al flujo aéreo (Obstructiva)",
                category: "pulmonary",
                subcategory: "Physiological",
                color: "#2d6ca2",
                icon: "fas fa-wind",
                evaluation: "Spirometry (pre/post bronchodilator), FEV1/FVC ratio, Flow-volume loop, Bronchodilator responsiveness testing",
                goldStandard: "Post-bronchodilator FEV1/FVC < 0.70",
                biomarkers: ["FEV1", "FVC", "FEV1/FVC", "PEF", "FEF25-75%", "RV/TLC"],
                severityCriteria: "GOLD Stages 1-4: 1(Mild): FEV1 ≥80%, 2(Moderate): 50-79%, 3(Severe): 30-49%, 4(Very Severe): <30%",
                severity: 85,
                evidence: { 
                    level: "A", 
                    guidelines: ["GOLD 2024", "ATS/ERS 2022"],
                    references: ["Lancet. 2018;391(10131):1706-1717", "Am J Respir Crit Care Med. 2022;205(7):819-837"],
                    confidence: 0.95
                },
                treatment: {
                    firstLine: "LAMA/LABA combination therapy (tiotropium/olodaterol, umeclidinium/vilanterol)",
                    secondLine: "ICS add-on if blood eosinophils ≥300 cells/μL or frequent exacerbations",
                    thirdLine: "Roflumilast for frequent exacerbators with chronic bronchitis",
                    rescue: "SABA as needed for symptom relief",
                    nonPharmacological: "Smoking cessation counseling, Pulmonary rehabilitation program, Annual vaccination (influenza, pneumococcal), Oxygen therapy if SpO2 ≤88%",
                    monitoring: "Regular spirometry every 6-12 months, Exacerbation frequency tracking, CAT/CCQ symptom scores, Oxygen saturation monitoring"
                },
                tags: ["COPD", "Asthma", "Obstruction", "Bronchitis", "Emphysema"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.85,
                confidence: 0.92,
                isSystem: true
            },
            {
                id: "PULM-002",
                name: "Eosinophilic Airway Inflammation",
                spanishName: "Inflamación eosinofílica de vías aéreas",
                category: "inflammatory",
                subcategory: "Cellular",
                color: "#d64550",
                icon: "fas fa-virus",
                evaluation: "Blood eosinophil count, Fractional exhaled nitric oxide (FeNO), Sputum eosinophils, Serum IgE, Periostin",
                goldStandard: "Blood eosinophils ≥300 cells/μL or FeNO ≥50 ppb",
                biomarkers: ["Blood eosinophils", "FeNO", "IgE", "ECP", "Periostin"],
                severityCriteria: "Mild: 150-299 cells/μL, Moderate: 300-499 cells/μL, Severe: ≥500 cells/μL",
                severity: 80,
                evidence: { 
                    level: "A", 
                    guidelines: ["GINA 2024", "ERS/ATS 2019"],
                    references: ["Eur Respir J. 2021;57(6):2003149", "Lancet Respir Med. 2019;7(9):745-756"],
                    confidence: 0.90
                },
                treatment: {
                    firstLine: "High-dose ICS ± LABA (fluticasone/salmeterol, budesonide/formoterol)",
                    secondLine: "Biologics targeting IL-5/IL-5R (mepolizumab, benralizumab) or IL-4/IL-13 (dupilumab)",
                    thirdLine: "Oral corticosteroids for acute exacerbations",
                    nonPharmacological: "Allergen avoidance, Environmental control, Asthma education program",
                    monitoring: "Regular eosinophil count (every 3-6 months), FeNO monitoring, Asthma control test"
                },
                tags: ["Asthma", "Eosinophilia", "Inflammation", "Allergy"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.70,
                confidence: 0.88,
                isSystem: true
            },
            {
                id: "PULM-003",
                name: "Gas Exchange Impairment",
                spanishName: "Alteración del intercambio gaseoso",
                category: "pulmonary",
                subcategory: "Physiological",
                color: "#4a8bc9",
                icon: "fas fa-lungs",
                evaluation: "Arterial blood gases, Pulse oximetry, DLCO measurement, A-a gradient, Shunt calculation",
                goldStandard: "PaO2 < 80 mmHg or SpO2 < 94% on room air",
                biomarkers: ["PaO2", "PaCO2", "SpO2", "DLCO", "A-a gradient"],
                severityCriteria: "Mild: PaO2 60-79 mmHg, Moderate: 45-59 mmHg, Severe: <45 mmHg",
                severity: 75,
                evidence: { 
                    level: "A", 
                    guidelines: ["ATS/ERS 2017"],
                    references: ["Am J Respir Crit Care Med. 2017;195(5):e3-e19"],
                    confidence: 0.85
                },
                treatment: {
                    firstLine: "Oxygen therapy to maintain SpO2 ≥90-92%",
                    secondLine: "Non-invasive ventilation for hypercapnic respiratory failure",
                    thirdLine: "Consider lung transplant evaluation",
                    nonPharmacological: "Pulmonary rehabilitation, Energy conservation techniques, Breathing exercises",
                    monitoring: "Continuous oximetry, ABG every 3-6 months, 6-minute walk test"
                },
                tags: ["Hypoxemia", "Respiratory Failure", "DLCO", "Oxygen"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.60,
                confidence: 0.87,
                isSystem: true
            },
            {
                id: "PULM-004",
                name: "Chronic Mucus Hypersecretion",
                spanishName: "Hipersecreción crónica de moco",
                category: "pulmonary",
                subcategory: "Clinical",
                color: "#7b6ba9",
                icon: "fas fa-wind",
                evaluation: "Sputum production assessment, Cough frequency, Sputum culture, Chest imaging",
                goldStandard: "Cough and sputum production for ≥3 months in 2 consecutive years",
                biomarkers: ["Sputum volume", "Sputum purulence", "Inflammatory markers"],
                severityCriteria: "Based on sputum volume and impact on quality of life",
                severity: 65,
                evidence: { 
                    level: "B", 
                    guidelines: ["GOLD 2024"],
                    references: ["Thorax. 2019;74(Suppl 2):ii1-ii90"],
                    confidence: 0.80
                },
                treatment: {
                    firstLine: "Mucolytics (carbocisteine, erdosteine)",
                    secondLine: "Macrolide antibiotics for anti-inflammatory effect",
                    thirdLine: "Chest physiotherapy techniques",
                    nonPharmacological: "Hydration, Airway clearance techniques, Steam inhalation",
                    monitoring: "Sputum characteristics, Exacerbation frequency, Quality of life measures"
                },
                tags: ["Bronchitis", "Mucus", "Cough", "Sputum"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.75,
                confidence: 0.82,
                isSystem: true
            },
            
            // Inflammatory Traits
            {
                id: "INFL-001",
                name: "Systemic Inflammation",
                spanishName: "Inflamación sistémica",
                category: "inflammatory",
                subcategory: "Systemic",
                color: "#e07a5f",
                icon: "fas fa-fire",
                evaluation: "CRP, ESR, Fibrinogen, IL-6, TNF-α, Complete blood count",
                goldStandard: "CRP > 10 mg/L or ESR > 30 mm/hr",
                biomarkers: ["CRP", "ESR", "IL-6", "TNF-α", "Fibrinogen", "Leukocytes"],
                severityCriteria: "Mild: CRP 3-10 mg/L, Moderate: 10-100 mg/L, Severe: >100 mg/L",
                severity: 70,
                evidence: { 
                    level: "A", 
                    guidelines: ["ACR 2022", "EULAR 2021"],
                    references: ["Ann Rheum Dis. 2021;80(10):1300-1310", "Arthritis Rheumatol. 2022;74(4):591-601"],
                    confidence: 0.89
                },
                treatment: {
                    firstLine: "Targeted anti-inflammatory therapy based on underlying cause",
                    secondLine: "Immunomodulators, Corticosteroids for acute control",
                    thirdLine: "Biologic therapies for refractory cases",
                    nonPharmacological: "Weight management, Mediterranean diet, Stress reduction, Regular exercise",
                    monitoring: "Inflammatory markers every 3 months, Disease activity scores"
                },
                tags: ["CRP", "Inflammation", "Systemic", "Autoimmune"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.65,
                confidence: 0.86,
                isSystem: true
            },
            
            // Physiological Traits
            {
                id: "PHYS-001",
                name: "Exercise Intolerance",
                spanishName: "Intolerancia al ejercicio",
                category: "physiological",
                subcategory: "Functional",
                color: "#81b29a",
                icon: "fas fa-running",
                evaluation: "6-minute walk test, Cardiopulmonary exercise testing, Borg dyspnea scale, VO2 max",
                goldStandard: "6MWD < 350 meters or VO2 max < 65% predicted",
                biomarkers: ["6MWD", "VO2 max", "VE/VCO2 slope", "Oxygen pulse"],
                severityCriteria: "Based on 6MWD: Mild 350-450m, Moderate 250-349m, Severe <250m",
                severity: 70,
                evidence: { 
                    level: "A", 
                    guidelines: ["ATS 2019", "ERS 2020"],
                    references: ["Eur Respir J. 2020;56(1):1901781", "Am J Respir Crit Care Med. 2019;200(3):e70-e88"],
                    confidence: 0.91
                },
                treatment: {
                    firstLine: "Pulmonary rehabilitation program (minimum 8 weeks)",
                    secondLine: "Supplemental oxygen during exercise if desaturation occurs",
                    thirdLine: "Nutritional optimization and strength training",
                    nonPharmacological: "Gradual exercise program, Interval training, Breathing techniques",
                    monitoring: "6MWD every 3-6 months, Exercise tolerance diaries"
                },
                tags: ["Exercise", "Rehabilitation", "Function", "Capacity"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.80,
                confidence: 0.88,
                isSystem: true
            },
            
            // Comorbid Traits
            {
                id: "COM-001",
                name: "Anxiety/Depression",
                spanishName: "Ansiedad/Depresión",
                category: "comorbid",
                subcategory: "Psychological",
                color: "#e39a9c",
                icon: "fas fa-brain",
                evaluation: "PHQ-9, GAD-7, HADS, Clinical interview, Quality of life assessment",
                goldStandard: "PHQ-9 ≥10 or GAD-7 ≥10",
                biomarkers: ["Cortisol", "BDNF", "Inflammatory markers"],
                severityCriteria: "PHQ-9: Mild 5-9, Moderate 10-14, Severe 15-27",
                severity: 60,
                evidence: { 
                    level: "A", 
                    guidelines: ["APA 2022", "NICE 2023"],
                    references: ["JAMA. 2022;327(16):1580-1591", "Lancet Psychiatry. 2023;10(2):126-135"],
                    confidence: 0.93
                },
                treatment: {
                    firstLine: "SSRI/SNRI antidepressants (sertraline, escitalopram)",
                    secondLine: "Cognitive behavioral therapy (CBT)",
                    thirdLine: "Combination therapy for treatment-resistant cases",
                    nonPharmacological: "Regular exercise, Mindfulness meditation, Social support, Sleep hygiene",
                    monitoring: "Monthly symptom scores, Side effect monitoring, Function assessment"
                },
                tags: ["Mental Health", "Psychology", "Mood", "CBT"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.55,
                confidence: 0.90,
                isSystem: true
            },
            
            // Pharmacological Traits
            {
                id: "PHARM-001",
                name: "Corticosteroid Dependency",
                spanishName: "Dependencia de corticosteroides",
                category: "pharmacological",
                subcategory: "Treatment",
                color: "#6a8d73",
                icon: "fas fa-prescription-bottle",
                evaluation: "Cumulative steroid dose, Side effect assessment, Adrenal function tests",
                goldStandard: "Requirement of ≥10mg prednisone daily for >3 months",
                biomarkers: ["Morning cortisol", "ACTH", "HPA axis function"],
                severityCriteria: "Based on dose and duration: Low <10mg, Moderate 10-20mg, High >20mg",
                severity: 75,
                evidence: { 
                    level: "A", 
                    guidelines: ["ERS/ATS 2020"],
                    references: ["Eur Respir J. 2020;55(1):1901147"],
                    confidence: 0.87
                },
                treatment: {
                    firstLine: "Gradual taper with steroid-sparing agents",
                    secondLine: "Biologic therapies to reduce steroid requirement",
                    thirdLine: "Adrenal support during stress or procedures",
                    nonPharmacological: "Bone density monitoring, Eye examinations, Diabetes screening",
                    monitoring: "Adrenal function, Bone density every 2 years, Ophthalmology exams"
                },
                tags: ["Steroids", "Treatment", "Side Effects", "Dependency"],
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                frequency: 0.40,
                confidence: 0.85,
                isSystem: true
            }
        ];
    }
    
    validateAndCleanTraits(traits, isUserDefined = false) {
        if (!Array.isArray(traits)) return [];
        
        return traits.map(trait => {
            const cleaned = {
                id: trait.id || `${isUserDefined ? 'USER' : 'SYS'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: trait.name || 'Unnamed Trait',
                spanishName: trait.spanishName || '',
                category: trait.category || 'clinical',
                subcategory: trait.subcategory || '',
                evaluation: trait.evaluation || 'Not specified',
                severity: typeof trait.severity === 'number' ? Math.min(100, Math.max(0, trait.severity)) : 50,
                treatment: trait.treatment || { firstLine: 'Not specified' },
                biomarkers: Array.isArray(trait.biomarkers) ? trait.biomarkers : [],
                evidence: trait.evidence || { level: 'C' },
                tags: Array.isArray(trait.tags) ? trait.tags : [],
                color: trait.color || this.getCategoryColor(trait.category || 'clinical'),
                icon: trait.icon || 'fas fa-user-md',
                created: trait.created || new Date().toISOString(),
                updated: trait.updated || new Date().toISOString(),
                frequency: typeof trait.frequency === 'number' ? trait.frequency : 0.5,
                confidence: typeof trait.confidence === 'number' ? trait.confidence : 0.5
            };
            
            if (isUserDefined) {
                cleaned.isUserDefined = true;
            } else {
                cleaned.isSystem = true;
            }
            
            return cleaned;
        });
    }
    
    // ============================================================================
    // CRUD OPERATIONS
    // ============================================================================
    
    createUserTrait(traitData) {
        const validation = this.validateTrait(traitData);
        if (!validation.isValid) {
            throw new Error(`Invalid trait data: ${validation.errors.join(', ')}`);
        }
        
        const newTrait = {
            ...this.validateAndCleanTraits([traitData], true)[0],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        this.userTraits.push(newTrait);
        this.allTraits.push(newTrait);
        
        if (this.saveUserTraits()) {
            this.emitTraitAddedEvent(newTrait);
            this.precomputeAnalytics();
            return newTrait;
        }
        
        throw new Error('Failed to save trait');
    }
    
    updateUserTrait(traitId, updates) {
        const index = this.userTraits.findIndex(t => t.id === traitId);
        if (index === -1) {
            throw new Error(`Trait not found: ${traitId}`);
        }
        
        const updatedTrait = {
            ...this.userTraits[index],
            ...updates,
            updated: new Date().toISOString()
        };
        
        // Validate the updated trait
        const validation = this.validateTrait(updatedTrait);
        if (!validation.isValid) {
            throw new Error(`Invalid trait data: ${validation.errors.join(', ')}`);
        }
        
        this.userTraits[index] = updatedTrait;
        
        // Update in allTraits
        const allIndex = this.allTraits.findIndex(t => t.id === traitId);
        if (allIndex !== -1) {
            this.allTraits[allIndex] = updatedTrait;
        }
        
        if (this.saveUserTraits()) {
            this.emitTraitUpdatedEvent(updatedTrait);
            this.precomputeAnalytics();
            return updatedTrait;
        }
        
        throw new Error('Failed to save updated trait');
    }
    
    deleteUserTrait(traitId) {
        const trait = this.userTraits.find(t => t.id === traitId);
        if (!trait) {
            throw new Error(`Trait not found: ${traitId}`);
        }
        
        this.userTraits = this.userTraits.filter(t => t.id !== traitId);
        this.allTraits = this.allTraits.filter(t => t.id !== traitId);
        
        // Remove from favorites
        this.favoriteTraits = this.favoriteTraits.filter(id => id !== traitId);
        this.saveFavorites();
        
        // Remove connections involving this trait
        this.connections = this.connections.filter(c => 
            c.source !== traitId && c.target !== traitId
        );
        this.saveConnections();
        
        if (this.saveUserTraits()) {
            this.emitTraitDeletedEvent(traitId);
            this.precomputeAnalytics();
            return true;
        }
        
        throw new Error('Failed to delete trait');
    }
    
    // Batch operations
    batchCreateTraits(traitsData) {
        const results = {
            created: [],
            failed: [],
            total: traitsData.length
        };
        
        traitsData.forEach(traitData => {
            try {
                const trait = this.createUserTrait(traitData);
                results.created.push(trait);
            } catch (error) {
                results.failed.push({
                    data: traitData,
                    error: error.message
                });
            }
        });
        
        return results;
    }
    
    batchDeleteTraits(traitIds) {
        const results = {
            deleted: [],
            failed: [],
            total: traitIds.length
        };
        
        traitIds.forEach(traitId => {
            try {
                if (this.deleteUserTrait(traitId)) {
                    results.deleted.push(traitId);
                }
            } catch (error) {
                results.failed.push({
                    id: traitId,
                    error: error.message
                });
            }
        });
        
        return results;
    }
    
    // ============================================================================
    // CONNECTION MANAGEMENT
    // ============================================================================
    
    createConnection(sourceId, targetId, data = {}) {
        // Validate traits exist
        const sourceTrait = this.getTraitById(sourceId);
        const targetTrait = this.getTraitById(targetId);
        
        if (!sourceTrait || !targetTrait) {
            throw new Error('One or both traits not found');
        }
        
        if (sourceId === targetId) {
            throw new Error('Cannot connect a trait to itself');
        }
        
        // Check if connection already exists
        const existing = this.connections.find(conn => 
            (conn.source === sourceId && conn.target === targetId) ||
            (conn.source === targetId && conn.target === sourceId)
        );
        
        if (existing) {
            throw new Error('Connection already exists');
        }
        
        // Check for treatment conflicts
        const conflicts = this.checkTreatmentConflicts(sourceTrait, targetTrait);
        
        const connection = {
            id: `${sourceId}-${targetId}-${Date.now()}`,
            source: sourceId,
            target: targetId,
            type: data.type || 'association',
            strength: data.strength || this.calculateConnectionStrength(sourceTrait, targetTrait),
            description: data.description || '',
            evidence: data.evidence || { level: 'C' },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            conflicts: conflicts.length > 0 ? conflicts : undefined
        };
        
        this.connections.push(connection);
        
        if (this.saveConnections()) {
            this.emitConnectionAddedEvent(connection);
            
            // Warn about conflicts
            if (conflicts.length > 0) {
                this.emitConflictWarningEvent({
                    connection,
                    conflicts,
                    source: sourceTrait.name,
                    target: targetTrait.name
                });
            }
            
            this.precomputeAnalytics();
            return connection;
        }
        
        throw new Error('Failed to save connection');
    }
    
    deleteConnection(connectionId) {
        const index = this.connections.findIndex(c => c.id === connectionId);
        if (index === -1) {
            throw new Error(`Connection not found: ${connectionId}`);
        }
        
        const connection = this.connections[index];
        this.connections.splice(index, 1);
        
        if (this.saveConnections()) {
            this.emitConnectionDeletedEvent(connectionId);
            this.precomputeAnalytics();
            return true;
        }
        
        throw new Error('Failed to delete connection');
    }
    
    updateConnection(connectionId, updates) {
        const index = this.connections.findIndex(c => c.id === connectionId);
        if (index === -1) {
            throw new Error(`Connection not found: ${connectionId}`);
        }
        
        const updatedConnection = {
            ...this.connections[index],
            ...updates,
            updated: new Date().toISOString()
        };
        
        this.connections[index] = updatedConnection;
        
        if (this.saveConnections()) {
            this.emitConnectionUpdatedEvent(updatedConnection);
            return updatedConnection;
        }
        
        throw new Error('Failed to update connection');
    }
    
    calculateConnectionStrength(sourceTrait, targetTrait) {
        let strength = 50; // Base strength
        
        // Category similarity (30 points)
        if (sourceTrait.category === targetTrait.category) {
            strength += 20;
        } else if (this.areCategoriesRelated(sourceTrait.category, targetTrait.category)) {
            strength += 10;
        }
        
        // Severity correlation (20 points)
        const severityDiff = Math.abs(sourceTrait.severity - targetTrait.severity);
        if (severityDiff < 10) {
            strength += 15;
        } else if (severityDiff < 25) {
            strength += 8;
        }
        
        // Biomarker overlap (20 points)
        const commonBiomarkers = this.getCommonBiomarkers(sourceTrait, targetTrait);
        strength += Math.min(20, commonBiomarkers.length * 5);
        
        // Tag overlap (10 points)
        const commonTags = this.getCommonTags(sourceTrait, targetTrait);
        strength += Math.min(10, commonTags.length * 2);
        
        // Evidence level (10 points)
        if (sourceTrait.evidence?.level === 'A' && targetTrait.evidence?.level === 'A') {
            strength += 10;
        }
        
        // Treatment similarity (10 points)
        if (this.areTreatmentsSimilar(sourceTrait.treatment, targetTrait.treatment)) {
            strength += 10;
        }
        
        return Math.min(100, Math.max(10, strength));
    }
    
    areCategoriesRelated(cat1, cat2) {
        const relatedCategories = {
            'pulmonary': ['inflammatory', 'physiological'],
            'inflammatory': ['pulmonary', 'clinical', 'comorbid'],
            'physiological': ['pulmonary', 'clinical'],
            'clinical': ['inflammatory', 'physiological', 'comorbid'],
            'comorbid': ['inflammatory', 'clinical', 'behavioral']
        };
        
        return relatedCategories[cat1]?.includes(cat2) || false;
    }
    
    getCommonBiomarkers(trait1, trait2) {
        const biomarkers1 = trait1.biomarkers || [];
        const biomarkers2 = trait2.biomarkers || [];
        
        return biomarkers1.filter(bio => biomarkers2.includes(bio));
    }
    
    getCommonTags(trait1, trait2) {
        const tags1 = trait1.tags || [];
        const tags2 = trait2.tags || [];
        
        return tags1.filter(tag => tags2.includes(tag));
    }
    
    areTreatmentsSimilar(treatment1, treatment2) {
        if (!treatment1 || !treatment2) return false;
        
        const t1 = typeof treatment1 === 'string' ? treatment1 : treatment1.firstLine;
        const t2 = typeof treatment2 === 'string' ? treatment2 : treatment2.firstLine;
        
        if (!t1 || !t2) return false;
        
        // Simple similarity check - could be enhanced
        const t1Lower = t1.toLowerCase();
        const t2Lower = t2.toLowerCase();
        
        // Check for common treatment keywords
        const commonTerms = ['ics', 'laba', 'lama', 'corticosteroid', 'bronchodilator', 'antibiotic', 'rehabilitation'];
        
        return commonTerms.some(term => 
            t1Lower.includes(term) && t2Lower.includes(term)
        );
    }
    
    // ============================================================================
    // ADVANCED ANALYTICS & PATTERN DETECTION
    // ============================================================================
    
    precomputeAnalytics() {
        console.log('Precomputing analytics...');
        
        const startTime = Date.now();
        
        // Clear cache and recompute
        this.analyticsCache = {
            patterns: this.detectClinicalPatterns(),
            clusters: this.clusterTraitsBySimilarity(),
            predictions: this.generatePredictions(),
            correlations: this.calculateCorrelations(),
            lastUpdated: new Date().toISOString()
        };
        
        const elapsed = Date.now() - startTime;
        console.log(`Analytics computed in ${elapsed}ms`);
        
        this.emitAnalyticsUpdatedEvent();
        
        return this.analyticsCache;
    }
    
    detectClinicalPatterns() {
        if (this.allTraits.length === 0) return [];
        
        const patterns = [];
        
        // Pattern 1: Inflammatory-Obstructive Syndrome
        const inflammatoryTraits = this.allTraits.filter(t => 
            t.category === 'inflammatory' && t.severity >= 70
        );
        const obstructiveTraits = this.allTraits.filter(t => 
            (t.tags?.includes('Obstruction') || t.name.includes('Obstructive')) && t.severity >= 70
        );
        
        if (inflammatoryTraits.length >= 2 && obstructiveTraits.length >= 1) {
            patterns.push({
                name: 'Inflammatory-Obstructive Syndrome',
                description: 'Combination of systemic inflammation with airflow obstruction',
                confidence: 0.85,
                traits: [...inflammatoryTraits, ...obstructiveTraits].map(t => t.id),
                implications: 'May require combined anti-inflammatory and bronchodilator therapy',
                guidelines: ['GOLD 2024', 'ERS/ATS 2020']
            });
        }
        
        // Pattern 2: Multidomain Comorbidity Cluster
        const categoriesPresent = new Set(this.allTraits.map(t => t.category));
        if (categoriesPresent.size >= 4) {
            const highSeverityTraits = this.allTraits.filter(t => t.severity >= 65);
            if (highSeverityTraits.length >= 3) {
                patterns.push({
                    name: 'Multidomain Comorbidity Cluster',
                    description: 'High-severity traits across multiple clinical domains',
                    confidence: 0.78,
                    traits: highSeverityTraits.map(t => t.id),
                    implications: 'Requires comprehensive, integrated management approach',
                    guidelines: ['Multimorbidity Guidelines 2023']
                });
            }
        }
        
        // Pattern 3: Treatment Complexity Pattern
        const steroidTraits = this.allTraits.filter(t => 
            t.treatment?.firstLine?.toLowerCase().includes('steroid') ||
            t.treatment?.firstLine?.toLowerCase().includes('corticosteroid')
        );
        
        if (steroidTraits.length >= 2) {
            patterns.push({
                name: 'Corticosteroid Complexity Pattern',
                description: 'Multiple traits requiring corticosteroid therapy',
                confidence: 0.82,
                traits: steroidTraits.map(t => t.id),
                implications: 'High risk of steroid side effects; consider steroid-sparing alternatives',
                guidelines: ['ERS/ATS 2020 Corticosteroid Guidelines']
            });
        }
        
        // Pattern 4: Exercise Limitation Cluster
        const exerciseTraits = this.allTraits.filter(t => 
            t.tags?.some(tag => ['Exercise', 'Rehabilitation', 'Function'].includes(tag)) ||
            t.name.includes('Exercise') ||
            t.name.includes('Intolerance')
        );
        
        if (exerciseTraits.length >= 2) {
            patterns.push({
                name: 'Exercise Limitation Cluster',
                description: 'Multiple factors contributing to exercise intolerance',
                confidence: 0.75,
                traits: exerciseTraits.map(t => t.id),
                implications: 'Prioritize pulmonary rehabilitation and functional assessment',
                guidelines: ['ATS Pulmonary Rehabilitation Guidelines 2019']
            });
        }
        
        // Pattern 5: Biomarker Correlation Pattern
        const traitsWithEosinophils = this.allTraits.filter(t => 
            t.biomarkers?.includes('Blood eosinophils') ||
            t.biomarkers?.includes('Eosinophils')
        );
        
        if (traitsWithEosinophils.length >= 2) {
            const eosinophilLevels = traitsWithEosinophils.map(t => 
                t.evaluation?.toLowerCase().includes('≥300') ? 'high' : 
                t.evaluation?.toLowerCase().includes('150') ? 'moderate' : 'low'
            );
            
            if (eosinophilLevels.some(level => level === 'high')) {
                patterns.push({
                    name: 'Eosinophilic Phenotype',
                    description: 'Multiple traits associated with eosinophilic inflammation',
                    confidence: 0.88,
                    traits: traitsWithEosinophils.map(t => t.id),
                    implications: 'Consider eosinophil-targeted therapies (anti-IL-5, anti-IL-5R)',
                    guidelines: ['GINA 2024 Eosinophilic Asthma Guidelines']
                });
            }
        }
        
        return patterns;
    }
    
    clusterTraitsBySimilarity() {
        if (this.allTraits.length === 0) return [];
        
        const clusters = [];
        const visited = new Set();
        
        // Create adjacency list from connections
        const adjacency = {};
        this.allTraits.forEach(trait => {
            adjacency[trait.id] = [];
        });
        
        this.connections.forEach(conn => {
            adjacency[conn.source].push(conn.target);
            adjacency[conn.target].push(conn.source);
        });
        
        // Find connected components
        for (const trait of this.allTraits) {
            if (!visited.has(trait.id)) {
                const cluster = this.bfsTraits(trait.id, adjacency, visited);
                
                if (cluster.length >= 2) {
                    // Calculate cluster properties
                    const clusterTraits = cluster.map(id => this.getTraitById(id));
                    const avgSeverity = clusterTraits.reduce((sum, t) => sum + t.severity, 0) / cluster.length;
                    const categories = [...new Set(clusterTraits.map(t => t.category))];
                    
                    clusters.push({
                        id: `CLUSTER-${clusters.length + 1}`,
                        traitIds: cluster,
                        size: cluster.length,
                        avgSeverity,
                        categories,
                        density: this.calculateClusterDensity(cluster, adjacency),
                        coherence: this.calculateClusterCoherence(clusterTraits)
                    });
                }
            }
        }
        
        // Sort clusters by size and coherence
        return clusters.sort((a, b) => {
            if (b.size !== a.size) return b.size - a.size;
            return b.coherence - a.coherence;
        });
    }
    
    bfsTraits(startId, adjacency, visited) {
        const queue = [startId];
        const component = [];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (!visited.has(current)) {
                visited.add(current);
                component.push(current);
                
                // Add neighbors to queue
                adjacency[current]?.forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                });
            }
        }
        
        return component;
    }
    
    calculateClusterDensity(cluster, adjacency) {
        let internalConnections = 0;
        let possibleConnections = cluster.length * (cluster.length - 1) / 2;
        
        if (possibleConnections === 0) return 0;
        
        for (let i = 0; i < cluster.length; i++) {
            for (let j = i + 1; j < cluster.length; j++) {
                if (adjacency[cluster[i]]?.includes(cluster[j])) {
                    internalConnections++;
                }
            }
        }
        
        return (internalConnections / possibleConnections) * 100;
    }
    
    calculateClusterCoherence(traits) {
        if (traits.length < 2) return 0;
        
        // Calculate category coherence
        const categoryCounts = {};
        traits.forEach(trait => {
            categoryCounts[trait.category] = (categoryCounts[trait.category] || 0) + 1;
        });
        
        const maxCategoryCount = Math.max(...Object.values(categoryCounts));
        const categoryCoherence = maxCategoryCount / traits.length;
        
        // Calculate severity coherence
        const severities = traits.map(t => t.severity);
        const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
        const severityVariance = severities.reduce((sum, s) => sum + Math.pow(s - avgSeverity, 2), 0) / severities.length;
        const severityCoherence = 1 - (severityVariance / 2500); // Normalize to 0-1
        
        // Calculate treatment coherence
        let treatmentCoherence = 0;
        for (let i = 0; i < traits.length; i++) {
            for (let j = i + 1; j < traits.length; j++) {
                if (this.areTreatmentsSimilar(traits[i].treatment, traits[j].treatment)) {
                    treatmentCoherence++;
                }
            }
        }
        
        const maxTreatmentPairs = traits.length * (traits.length - 1) / 2;
        treatmentCoherence = maxTreatmentPairs > 0 ? treatmentCoherence / maxTreatmentPairs : 0;
        
        // Weighted average
        return (categoryCoherence * 0.4) + (severityCoherence * 0.3) + (treatmentCoherence * 0.3);
    }
    
    generatePredictions() {
        if (this.allTraits.length === 0) return [];
        
        const predictions = [];
        
        // Prediction 1: Exacerbation Risk
        const exacerbationRisk = this.calculateExacerbationRisk();
        if (exacerbationRisk > 30) {
            predictions.push({
                type: 'exacerbation_risk',
                confidence: 0.76,
                value: exacerbationRisk,
                description: `High risk of acute exacerbation (${exacerbationRisk}% probability in next 6 months)`,
                recommendations: [
                    'Ensure rescue medication available',
                    'Develop exacerbation action plan',
                    'Consider preventive therapy',
                    'Monitor for early warning signs'
                ]
            });
        }
        
        // Prediction 2: Treatment Complexity
        const treatmentComplexity = this.calculateTreatmentComplexity();
        if (treatmentComplexity > 60) {
            predictions.push({
                type: 'treatment_complexity',
                confidence: 0.82,
                value: treatmentComplexity,
                description: `High treatment complexity score (${treatmentComplexity}/100)`,
                recommendations: [
                    'Simplify medication regimen if possible',
                    'Consider medication review by pharmacist',
                    'Use pill organizers or reminders',
                    'Monitor for medication interactions'
                ]
            });
        }
        
        // Prediction 3: Functional Decline Risk
        const functionalDeclineRisk = this.calculateFunctionalDeclineRisk();
        if (functionalDeclineRisk > 40) {
            predictions.push({
                type: 'functional_decline',
                confidence: 0.71,
                value: functionalDeclineRisk,
                description: `Moderate-high risk of functional decline (${functionalDeclineRisk}% probability)`,
                recommendations: [
                    'Refer to pulmonary rehabilitation',
                    'Assistive devices if needed',
                    'Home safety assessment',
                    'Regular functional assessments'
                ]
            });
        }
        
        // Prediction 4: Hospitalization Risk
        const hospitalizationRisk = this.calculateHospitalizationRisk();
        if (hospitalizationRisk > 25) {
            predictions.push({
                type: 'hospitalization_risk',
                confidence: 0.68,
                value: hospitalizationRisk,
                description: `Elevated hospitalization risk (${hospitalizationRisk}% probability in next year)`,
                recommendations: [
                    'Optimize outpatient management',
                    'Early intervention for exacerbations',
                    'Regular follow-up appointments',
                    'Patient education on warning signs'
                ]
            });
        }
        
        return predictions;
    }
    
    calculateExacerbationRisk() {
        const highRiskTraits = this.allTraits.filter(t => t.severity >= 80);
        const moderateRiskTraits = this.allTraits.filter(t => t.severity >= 65 && t.severity < 80);
        
        let risk = 0;
        
        // Base risk from high severity traits
        risk += highRiskTraits.length * 15;
        
        // Additional risk from moderate traits
        risk += moderateRiskTraits.length * 8;
        
        // Risk from inflammatory traits
        const inflammatoryTraits = this.allTraits.filter(t => t.category === 'inflammatory');
        risk += inflammatoryTraits.length * 10;
        
        // Risk from multiple comorbidities
        const categories = new Set(this.allTraits.map(t => t.category));
        if (categories.size >= 3) {
            risk += 15;
        }
        
        // Cap at 95%
        return Math.min(95, Math.max(5, risk));
    }
    
    calculateTreatmentComplexity() {
        if (this.allTraits.length === 0) return 0;
        
        let complexity = 0;
        
        // Base complexity from number of traits
        complexity += Math.min(30, this.allTraits.length * 5);
        
        // Complexity from different treatment categories
        const treatmentCategories = new Set();
        this.allTraits.forEach(trait => {
            const treatment = trait.treatment;
            if (typeof treatment === 'object') {
                if (treatment.firstLine) treatmentCategories.add('first_line');
                if (treatment.secondLine) treatmentCategories.add('second_line');
                if (treatment.nonPharmacological) treatmentCategories.add('non_pharm');
            }
        });
        
        complexity += treatmentCategories.size * 10;
        
        // Complexity from high severity
        const highSeverityCount = this.allTraits.filter(t => t.severity >= 80).length;
        complexity += highSeverityCount * 8;
        
        // Complexity from connections (network density)
        const maxConnections = this.allTraits.length * (this.allTraits.length - 1) / 2;
        const connectionDensity = maxConnections > 0 ? (this.connections.length / maxConnections) * 100 : 0;
        complexity += connectionDensity * 0.3;
        
        return Math.min(100, complexity);
    }
    
    calculateFunctionalDeclineRisk() {
        const functionalTraits = this.allTraits.filter(t => 
            t.tags?.some(tag => ['Exercise', 'Function', 'Capacity', 'Intolerance'].includes(tag)) ||
            t.category === 'physiological'
        );
        
        let risk = functionalTraits.length * 15;
        
        // Additional risk from high severity
        const highSeverityFunctional = functionalTraits.filter(t => t.severity >= 70);
        risk += highSeverityFunctional.length * 10;
        
        // Risk from age-related traits (simulated)
        const ageRelatedTraits = this.allTraits.filter(t => 
            t.tags?.some(tag => ['Age', 'Elderly', 'Geriatric'].includes(tag))
        );
        risk += ageRelatedTraits.length * 8;
        
        return Math.min(90, Math.max(10, risk));
    }
    
    calculateHospitalizationRisk() {
        let risk = 0;
        
        // Critical traits
        const criticalTraits = this.allTraits.filter(t => t.severity >= 90);
        risk += criticalTraits.length * 20;
        
        // High severity traits
        const highSeverityTraits = this.allTraits.filter(t => t.severity >= 80 && t.severity < 90);
        risk += highSeverityTraits.length * 12;
        
        // Recent exacerbation traits
        const exacerbationTraits = this.allTraits.filter(t => 
            t.tags?.some(tag => ['Exacerbation', 'Acute', 'Emergency'].includes(tag))
        );
        risk += exacerbationTraits.length * 15;
        
        // Multiple comorbidities
        const categories = new Set(this.allTraits.map(t => t.category));
        if (categories.size >= 4) {
            risk += 20;
        }
        
        // Complex treatment
        if (this.calculateTreatmentComplexity() > 70) {
            risk += 15;
        }
        
        return Math.min(85, Math.max(5, risk));
    }
    
    calculateCorrelations() {
        const correlations = [];
        
        if (this.allTraits.length < 2) return correlations;
        
        // Calculate pairwise correlations
        for (let i = 0; i < this.allTraits.length; i++) {
            for (let j = i + 1; j < this.allTraits.length; j++) {
                const trait1 = this.allTraits[i];
                const trait2 = this.allTraits[j];
                
                const correlation = this.calculateTraitCorrelation(trait1, trait2);
                
                if (Math.abs(correlation) > 0.3) { // Only report meaningful correlations
                    correlations.push({
                        trait1: trait1.id,
                        trait2: trait2.id,
                        correlation,
                        strength: Math.abs(correlation) * 100,
                        direction: correlation > 0 ? 'positive' : 'negative'
                    });
                }
            }
        }
        
        // Sort by absolute correlation strength
        return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    }
    
    calculateTraitCorrelation(trait1, trait2) {
        // This is a simplified correlation calculation
        // In a real system, this would use actual clinical data
        
        let correlation = 0;
        
        // Category similarity contributes to positive correlation
        if (trait1.category === trait2.category) {
            correlation += 0.4;
        }
        
        // Severity similarity contributes to positive correlation
        const severityDiff = Math.abs(trait1.severity - trait2.severity);
        correlation += (100 - severityDiff) / 250; // 0-0.4 range
        
        // Common biomarkers contribute to positive correlation
        const commonBiomarkers = this.getCommonBiomarkers(trait1, trait2);
        correlation += commonBiomarkers.length * 0.1;
        
        // Common tags contribute to positive correlation
        const commonTags = this.getCommonTags(trait1, trait2);
        correlation += commonTags.length * 0.05;
        
        // Check for connections between traits
        const areConnected = this.connections.some(conn => 
            (conn.source === trait1.id && conn.target === trait2.id) ||
            (conn.source === trait2.id && conn.target === trait1.id)
        );
        
        if (areConnected) {
            correlation += 0.2;
        }
        
        // Normalize to -1 to 1 range
        return Math.max(-1, Math.min(1, correlation));
    }
    
    // ============================================================================
    // CONFLICT DETECTION
    // ============================================================================
    
    checkTreatmentConflicts(trait1, trait2) {
        const conflicts = [];
        
        // Check built-in conflicts
        this.treatmentConflicts.forEach(conflict => {
            if ((conflict.trait1 === trait1.name && conflict.trait2 === trait2.name) ||
                (conflict.trait1 === trait2.name && conflict.trait2 === trait1.name)) {
                conflicts.push(conflict);
            }
        });
        
        // Check for medication class conflicts
        const treatment1 = this.extractMedicationClasses(trait1.treatment);
        const treatment2 = this.extractMedicationClasses(trait2.treatment);
        
        const conflictingClasses = this.getConflictingMedicationClasses(treatment1, treatment2);
        conflictingClasses.forEach(conflict => {
            conflicts.push({
                trait1: trait1.name,
                trait2: trait2.name,
                severity: 'moderate',
                description: `Potential interaction between ${conflict.class1} and ${conflict.class2}`,
                recommendation: 'Monitor for adverse effects or consider alternative therapy',
                evidenceLevel: 'C'
            });
        });
        
        return conflicts;
    }
    
    extractMedicationClasses(treatment) {
        if (!treatment) return [];
        
        const classes = [];
        const treatmentStr = typeof treatment === 'string' ? treatment : 
                            treatment.firstLine + ' ' + (treatment.secondLine || '');
        
        const classKeywords = {
            'beta_agonist': ['beta-agonist', 'laba', 'saba'],
            'anticholinergic': ['anticholinergic', 'lama', 'sama'],
            'corticosteroid': ['corticosteroid', 'ics', 'steroid'],
            'theophylline': ['theophylline'],
            'roflumilast': ['roflumilast'],
            'biologic': ['biologic', 'mepolizumab', 'omalizumab', 'benralizumab', 'dupilumab'],
            'antibiotic': ['antibiotic', 'macrolide', 'azithromycin'],
            'nsaid': ['nsaid', 'ibuprofen', 'naproxen'],
            'beta_blocker': ['beta-blocker', 'propranolol']
        };
        
        Object.entries(classKeywords).forEach(([className, keywords]) => {
            if (keywords.some(keyword => treatmentStr.toLowerCase().includes(keyword))) {
                classes.push(className);
            }
        });
        
        return classes;
    }
    
    getConflictingMedicationClasses(classes1, classes2) {
        const conflicts = [];
        
        const conflictPairs = [
            ['beta_agonist', 'beta_blocker'],
            ['theophylline', 'antibiotic'], // Some antibiotics affect theophylline metabolism
            ['nsaid', 'corticosteroid'] // Increased GI risk
        ];
        
        classes1.forEach(class1 => {
            classes2.forEach(class2 => {
                conflictPairs.forEach(pair => {
                    if ((pair[0] === class1 && pair[1] === class2) ||
                        (pair[0] === class2 && pair[1] === class1)) {
                        conflicts.push({
                            class1,
                            class2,
                            type: 'medication_interaction'
                        });
                    }
                });
            });
        });
        
        return conflicts;
    }
    
    // ============================================================================
    // SEARCH & FILTERING
    // ============================================================================
    
    searchTraits(query, filters = {}, options = {}) {
        const searchTerm = query?.toLowerCase().trim() || '';
        
        // Add to search history if not empty
        if (searchTerm && !options.skipHistory) {
            this.addSearchToHistory(searchTerm);
        }
        
        let results = this.allTraits;
        
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            if (filters.category === 'user-defined') {
                results = results.filter(trait => trait.isUserDefined);
            } else if (filters.category === 'system') {
                results = results.filter(trait => trait.isSystem);
            } else if (filters.category === 'favorites') {
                results = results.filter(trait => this.favoriteTraits.includes(trait.id));
            } else {
                results = results.filter(trait => trait.category === filters.category);
            }
        }
        
        // Apply severity filter
        if (filters.severity) {
            switch(filters.severity) {
                case 'critical':
                    results = results.filter(t => t.severity >= 90);
                    break;
                case 'high':
                    results = results.filter(t => t.severity >= 80);
                    break;
                case 'moderate':
                    results = results.filter(t => t.severity >= 65);
                    break;
                case 'low':
                    results = results.filter(t => t.severity < 65);
                    break;
            }
        }
        
        // Apply evidence level filter
        if (filters.evidence) {
            results = results.filter(t => 
                t.evidence?.level === filters.evidence
            );
        }
        
        // Apply tag filter
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(t => 
                t.tags?.some(tag => filters.tags.includes(tag))
            );
        }
        
        // Apply date filters
        if (filters.dateRange) {
            const now = new Date();
            const cutoff = new Date(now);
            
            switch(filters.dateRange) {
                case 'today':
                    cutoff.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoff.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoff.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    cutoff.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            results = results.filter(t => 
                new Date(t.created) >= cutoff ||
                new Date(t.updated) >= cutoff
            );
        }
        
        // Apply search term
        if (searchTerm) {
            results = results.filter(trait => {
                // Name matches
                if (trait.name.toLowerCase().includes(searchTerm)) return true;
                
                // Spanish name matches
                if (trait.spanishName?.toLowerCase().includes(searchTerm)) return true;
                
                // Category matches
                if (trait.category.toLowerCase().includes(searchTerm)) return true;
                
                // Evaluation matches
                if (trait.evaluation.toLowerCase().includes(searchTerm)) return true;
                
                // Treatment matches
                const treatmentStr = typeof trait.treatment === 'object' ? 
                    `${trait.treatment.firstLine} ${trait.treatment.secondLine || ''} ${trait.treatment.nonPharmacological || ''}` :
                    trait.treatment || '';
                
                if (treatmentStr.toLowerCase().includes(searchTerm)) return true;
                
                // Biomarker matches
                if (trait.biomarkers?.some(b => b.toLowerCase().includes(searchTerm))) return true;
                
                // Tag matches
                if (trait.tags?.some(t => t.toLowerCase().includes(searchTerm))) return true;
                
                // Guideline matches
                if (trait.evidence?.guidelines?.some(g => g.toLowerCase().includes(searchTerm))) return true;
                
                return false;
            });
        }
        
        // Apply sorting
        if (filters.sortBy) {
            results.sort((a, b) => {
                let aVal, bVal;
                
                switch(filters.sortBy) {
                    case 'severity':
                        aVal = a.severity;
                        bVal = b.severity;
                        break;
                    case 'name':
                        aVal = a.name.toLowerCase();
                        bVal = b.name.toLowerCase();
                        break;
                    case 'category':
                        aVal = a.category.toLowerCase();
                        bVal = b.category.toLowerCase();
                        break;
                    case 'created':
                        aVal = new Date(a.created);
                        bVal = new Date(b.created);
                        break;
                    case 'updated':
                        aVal = new Date(a.updated);
                        bVal = new Date(b.updated);
                        break;
                    case 'evidence':
                        aVal = this.evidenceLevels.indexOf(a.evidence?.level || 'E');
                        bVal = this.evidenceLevels.indexOf(b.evidence?.level || 'E');
                        break;
                    default:
                        return 0;
                }
                
                if (filters.sortOrder === 'asc') {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                }
            });
        }
        
        // Apply pagination if requested
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            return {
                results: results.slice(start, end),
                total: results.length,
                page: options.page,
                totalPages: Math.ceil(results.length / options.pageSize)
            };
        }
        
        return results;
    }
    
    advancedSearch(criteria) {
        // This supports complex multi-criteria searches
        let results = this.allTraits;
        
        if (criteria.name) {
            results = results.filter(t => 
                t.name.toLowerCase().includes(criteria.name.toLowerCase()) ||
                t.spanishName?.toLowerCase().includes(criteria.name.toLowerCase())
            );
        }
        
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(t => 
                criteria.categories.includes(t.category)
            );
        }
        
        if (criteria.severityRange) {
            results = results.filter(t => 
                t.severity >= criteria.severityRange.min &&
                t.severity <= criteria.severityRange.max
            );
        }
        
        if (criteria.biomarkers && criteria.biomarkers.length > 0) {
            results = results.filter(t => 
                criteria.biomarkers.some(bio => 
                    t.biomarkers?.includes(bio)
                )
            );
        }
        
        if (criteria.treatmentKeywords && criteria.treatmentKeywords.length > 0) {
            results = results.filter(t => {
                const treatmentStr = typeof t.treatment === 'object' ? 
                    `${t.treatment.firstLine} ${t.treatment.secondLine || ''}`.toLowerCase() :
                    (t.treatment || '').toLowerCase();
                
                return criteria.treatmentKeywords.some(keyword => 
                    treatmentStr.includes(keyword.toLowerCase())
                );
            });
        }
        
        if (criteria.dateFrom) {
            const dateFrom = new Date(criteria.dateFrom);
            results = results.filter(t => 
                new Date(t.created) >= dateFrom || 
                new Date(t.updated) >= dateFrom
            );
        }
        
        if (criteria.dateTo) {
            const dateTo = new Date(criteria.dateTo);
            results = results.filter(t => 
                new Date(t.created) <= dateTo || 
                new Date(t.updated) <= dateTo
            );
        }
        
        return results;
    }
    
    addSearchToHistory(term) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(s => s.term !== term);
        
        // Add to beginning
        this.searchHistory.unshift({
            term,
            timestamp: new Date().toISOString(),
            count: 1
        });
        
        // Limit history size
        if (this.searchHistory.length > this.config.maxSearchHistory) {
            this.searchHistory = this.searchHistory.slice(0, this.config.maxSearchHistory);
        }
        
        this.saveSearchHistory();
    }
    
    getSearchSuggestions(prefix) {
        if (!prefix || prefix.length < 2) return [];
        
        const suggestions = new Set();
        const prefixLower = prefix.toLowerCase();
        
        // Suggest from trait names
        this.allTraits.forEach(trait => {
            if (trait.name.toLowerCase().startsWith(prefixLower)) {
                suggestions.add(trait.name);
            }
            if (trait.spanishName?.toLowerCase().startsWith(prefixLower)) {
                suggestions.add(trait.spanishName);
            }
        });
        
        // Suggest from categories
        this.categories.forEach(category => {
            if (category.toLowerCase().startsWith(prefixLower)) {
                suggestions.add(category);
            }
        });
        
        // Suggest from recent searches
        this.searchHistory.forEach(entry => {
            if (entry.term.toLowerCase().startsWith(prefixLower)) {
                suggestions.add(entry.term);
            }
        });
        
        return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
    }
    
    // ============================================================================
    // FAVORITES MANAGEMENT
    // ============================================================================
    
    toggleFavorite(traitId) {
        const index = this.favoriteTraits.indexOf(traitId);
        
        if (index === -1) {
            // Add to favorites
            if (this.favoriteTraits.length >= this.config.maxFavorites) {
                throw new Error(`Maximum favorites limit reached (${this.config.maxFavorites})`);
            }
            
            this.favoriteTraits.push(traitId);
        } else {
            // Remove from favorites
            this.favoriteTraits.splice(index, 1);
        }
        
        this.saveFavorites();
        this.emitFavoritesUpdatedEvent();
        
        return index === -1; // Returns true if added, false if removed
    }
    
    isFavorite(traitId) {
        return this.favoriteTraits.includes(traitId);
    }
    
    getFavoriteTraits() {
        return this.allTraits.filter(trait => 
            this.favoriteTraits.includes(trait.id)
        );
    }
    
    // ============================================================================
    // CLINICAL GUIDELINES INTEGRATION
    // ============================================================================
    
    getGuidelinesForTraits(traitIds) {
        const traits = this.getTraitsByIds(traitIds);
        const relevantGuidelines = [];
        
        traits.forEach(trait => {
            // Check trait-specific guidelines
            if (trait.evidence?.guidelines) {
                trait.evidence.guidelines.forEach(guidelineName => {
                    const guideline = this.guidelines.find(g => g.name === guidelineName);
                    if (guideline && !relevantGuidelines.find(g => g.id === guideline.id)) {
                        relevantGuidelines.push(guideline);
                    }
                });
            }
            
            // Check category-specific guidelines
            const categoryGuidelines = this.guidelines.filter(g => g.category === trait.category);
            categoryGuidelines.forEach(guideline => {
                if (!relevantGuidelines.find(g => g.id === guideline.id)) {
                    relevantGuidelines.push(guideline);
                }
            });
        });
        
        return relevantGuidelines;
    }
    
    getTreatmentRecommendations(traitIds) {
        const traits = this.getTraitsByIds(traitIds);
        const recommendations = [];
        
        traits.forEach(trait => {
            if (trait.treatment) {
                const treatment = typeof trait.treatment === 'object' ? trait.treatment : {
                    firstLine: trait.treatment
                };
                
                recommendations.push({
                    traitId: trait.id,
                    traitName: trait.name,
                    recommendations: this.formatTreatmentRecommendations(treatment, trait.severity)
                });
            }
        });
        
        return recommendations;
    }
    
    formatTreatmentRecommendations(treatment, severity) {
        const formatted = [];
        
        if (treatment.firstLine) {
            formatted.push({
                level: 'First-line',
                recommendation: treatment.firstLine,
                priority: severity >= 80 ? 'high' : 'standard'
            });
        }
        
        if (treatment.secondLine) {
            formatted.push({
                level: 'Second-line',
                recommendation: treatment.secondLine,
                priority: 'standard'
            });
        }
        
        if (treatment.nonPharmacological) {
            formatted.push({
                level: 'Non-pharmacological',
                recommendation: treatment.nonPharmacological,
                priority: 'supplementary'
            });
        }
        
        return formatted;
    }
    
    // ============================================================================
    // DATA EXPORT & IMPORT
    // ============================================================================
    
    exportDatabase(format = 'json', options = {}) {
        const exportData = {
            metadata: {
                version: '3.0',
                exported: new Date().toISOString(),
                source: 'Clinical Database v3.0',
                traitsCount: this.allTraits.length,
                connectionsCount: this.connections.length
            },
            traits: options.includeTraits ? this.allTraits : [],
            connections: options.includeConnections ? this.connections : [],
            analytics: options.includeAnalytics ? this.analyticsCache : null,
            favorites: options.includeFavorites ? this.favoriteTraits : [],
            searchHistory: options.includeHistory ? this.searchHistory : []
        };
        
        switch(format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
                
            case 'csv':
                return this.exportToCSV(exportData.traits);
                
            case 'excel':
                // Note: Would require external library like SheetJS
                console.warn('Excel export requires additional libraries');
                return this.exportToCSV(exportData.traits);
                
            default:
                return exportData;
        }
    }
    
    exportToCSV(traits) {
        if (!traits || traits.length === 0) return '';
        
        const headers = [
            'ID', 'Name', 'Spanish Name', 'Category', 'Subcategory',
            'Severity', 'Evaluation', 'Biomarkers', 
            'First Line Treatment', 'Second Line Treatment', 'Non-Pharmacological',
            'Evidence Level', 'Tags', 'Created', 'Updated'
        ];
        
        const rows = traits.map(trait => {
            const biomarkers = trait.biomarkers ? trait.biomarkers.join('; ') : '';
            const tags = trait.tags ? trait.tags.join('; ') : '';
            const treatment = typeof trait.treatment === 'object' ? trait.treatment : { firstLine: trait.treatment };
            
            return [
                trait.id,
                `"${trait.name.replace(/"/g, '""')}"`,
                `"${(trait.spanishName || '').replace(/"/g, '""')}"`,
                `"${trait.category.replace(/"/g, '""')}"`,
                `"${(trait.subcategory || '').replace(/"/g, '""')}"`,
                trait.severity,
                `"${trait.evaluation.replace(/"/g, '""')}"`,
                `"${biomarkers.replace(/"/g, '""')}"`,
                `"${(treatment.firstLine || '').replace(/"/g, '""')}"`,
                `"${(treatment.secondLine || '').replace(/"/g, '""')}"`,
                `"${(treatment.nonPharmacological || '').replace(/"/g, '""')}"`,
                trait.evidence?.level || '',
                `"${tags.replace(/"/g, '""')}"`,
                trait.created || '',
                trait.updated || ''
            ].join(',');
        });
        
        return [headers.join(','), ...rows].join('\n');
    }
    
    importFromJSON(jsonData, options = {}) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            const results = {
                traits: { imported: 0, skipped: 0, errors: [] },
                connections: { imported: 0, skipped: 0, errors: [] }
            };
            
            // Import traits
            if (data.traits && Array.isArray(data.traits)) {
                data.traits.forEach(trait => {
                    try {
                        if (options.mergeDuplicates) {
                            // Check if trait already exists
                            const existing = this.allTraits.find(t => 
                                t.name === trait.name && t.category === trait.category
                            );
                            
                            if (existing) {
                                // Update existing trait
                                this.updateUserTrait(existing.id, trait);
                                results.traits.skipped++;
                            } else {
                                // Create new trait
                                this.createUserTrait(trait);
                                results.traits.imported++;
                            }
                        } else {
                            // Always create new traits
                            this.createUserTrait(trait);
                            results.traits.imported++;
                        }
                    } catch (error) {
                        results.traits.errors.push({
                            trait: trait.name,
                            error: error.message
                        });
                    }
                });
            }
            
            // Import connections
            if (data.connections && Array.isArray(data.connections)) {
                data.connections.forEach(conn => {
                    try {
                        // Verify traits exist
                        const sourceExists = this.allTraits.some(t => t.id === conn.source);
                        const targetExists = this.allTraits.some(t => t.id === conn.target);
                        
                        if (sourceExists && targetExists) {
                            this.createConnection(conn.source, conn.target, conn);
                            results.connections.imported++;
                        } else {
                            results.connections.skipped++;
                        }
                    } catch (error) {
                        results.connections.errors.push({
                            connection: `${conn.source}-${conn.target}`,
                            error: error.message
                        });
                    }
                });
            }
            
            this.emitImportCompleteEvent(results);
            return results;
            
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error(`Import failed: ${error.message}`);
        }
    }
    
    // ============================================================================
    // BACKUP & RESTORE
    // ============================================================================
    
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '3.0',
            userTraits: this.userTraits,
            connections: this.connections,
            clinicalCases: this.clinicalCases,
            favoriteTraits: this.favoriteTraits,
            searchHistory: this.searchHistory,
            metadata: {
                totalTraits: this.allTraits.length,
                totalConnections: this.connections.length
            }
        };
        
        return {
            data: JSON.stringify(backup, null, 2),
            timestamp: backup.timestamp,
            size: JSON.stringify(backup).length
        };
    }
    
    restoreFromBackup(backupData) {
        try {
            const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            
            // Validate backup structure
            if (!backup.userTraits || !Array.isArray(backup.userTraits)) {
                throw new Error('Invalid backup format: missing userTraits');
            }
            
            // Clear existing data
            this.userTraits = [];
            this.connections = backup.connections || [];
            this.clinicalCases = backup.clinicalCases || [];
            this.favoriteTraits = backup.favoriteTraits || [];
            this.searchHistory = backup.searchHistory || [];
            
            // Import traits from backup
            const importResults = this.importFromJSON({
                traits: backup.userTraits,
                connections: backup.connections
            }, { mergeDuplicates: false });
            
            // Save all data
            this.saveUserTraits();
            this.saveConnections();
            this.saveClinicalCases();
            this.saveFavorites();
            this.saveSearchHistory();
            
            // Update derived data
            this.allTraits = [...this.systemTraits, ...this.userTraits];
            this.categories = this.extractCategories();
            this.precomputeAnalytics();
            
            this.emitRestoreCompleteEvent({
                traitsRestored: importResults.traits.imported,
                connectionsRestored: importResults.connections.imported,
                timestamp: backup.timestamp
            });
            
            return {
                success: true,
                message: `Restored ${importResults.traits.imported} traits and ${importResults.connections.imported} connections`,
                details: importResults
            };
            
        } catch (error) {
            console.error('Error restoring backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ============================================================================
    // VALIDATION
    // ============================================================================
    
    validateTrait(trait) {
        const errors = [];
        
        if (!trait.name || trait.name.trim().length < 2) {
            errors.push('Trait name is required (minimum 2 characters)');
        }
        
        if (!trait.category) {
            errors.push('Category is required');
        }
        
        if (trait.severity === undefined || trait.severity < 0 || trait.severity > 100) {
            errors.push('Severity must be between 0 and 100');
        }
        
        if (!trait.evaluation || trait.evaluation.trim().length < 10) {
            errors.push('Clinical evaluation is required (minimum 10 characters)');
        }
        
        if (!trait.treatment || 
            (typeof trait.treatment === 'object' && !trait.treatment.firstLine) ||
            (typeof trait.treatment === 'string' && trait.treatment.trim().length === 0)) {
            errors.push('Treatment information is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    validateConnection(sourceId, targetId) {
        const errors = [];
        
        if (!sourceId || !targetId) {
            errors.push('Both source and target trait IDs are required');
        }
        
        if (sourceId === targetId) {
            errors.push('Cannot connect a trait to itself');
        }
        
        const sourceExists = this.allTraits.some(t => t.id === sourceId);
        const targetExists = this.allTraits.some(t => t.id === targetId);
        
        if (!sourceExists) errors.push('Source trait not found');
        if (!targetExists) errors.push('Target trait not found');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getTraitById(id) {
        return this.allTraits.find(trait => trait.id === id);
    }
    
    getTraitsByIds(ids) {
        return this.allTraits.filter(trait => ids.includes(trait.id));
    }
    
    getRelatedTraits(traitId, depth = 1) {
        if (depth < 1) return [];
        
        const directConnections = this.connections.filter(conn => 
            conn.source === traitId || conn.target === traitId
        );
        
        const relatedIds = new Set();
        directConnections.forEach(conn => {
            if (conn.source === traitId) relatedIds.add(conn.target);
            if (conn.target === traitId) relatedIds.add(conn.source);
        });
        
        if (depth > 1) {
            const indirectIds = new Set();
            relatedIds.forEach(id => {
                const indirect = this.getRelatedTraits(id, depth - 1);
                indirect.forEach(indirectId => {
                    if (indirectId !== traitId && !relatedIds.has(indirectId)) {
                        indirectIds.add(indirectId);
                    }
                });
            });
            
            indirectIds.forEach(id => relatedIds.add(id));
        }
        
        return this.getTraitsByIds(Array.from(relatedIds));
    }
    
    extractCategories() {
        const categories = new Set();
        this.allTraits.forEach(trait => categories.add(trait.category));
        return Array.from(categories).sort();
    }
    
    getCategoryColor(category) {
        const colorMap = {
            'pulmonary': '#2d6ca2',
            'inflammatory': '#d64550',
            'physiological': '#81b29a',
            'radiological': '#7b6ba9',
            'clinical': '#c4906a',
            'comorbid': '#e39a9c',
            'behavioral': '#4a7c8c',
            'pharmacological': '#6a8d73',
            'surgical': '#7b6ba9',
            'user-defined': '#8a4baf'
        };
        
        return colorMap[category] || '#9fa8c7';
    }
    
    getStatistics() {
        const totalTraits = this.allTraits.length;
        const systemTraits = this.systemTraits.length;
        const userTraits = this.userTraits.length;
        
        const severityDistribution = {
            critical: this.allTraits.filter(t => t.severity >= 90).length,
            high: this.allTraits.filter(t => t.severity >= 80 && t.severity < 90).length,
            moderate: this.allTraits.filter(t => t.severity >= 65 && t.severity < 80).length,
            low: this.allTraits.filter(t => t.severity < 65).length
        };
        
        const categoryDistribution = {};
        this.allTraits.forEach(trait => {
            categoryDistribution[trait.category] = (categoryDistribution[trait.category] || 0) + 1;
        });
        
        const evidenceDistribution = {};
        this.allTraits.forEach(trait => {
            const level = trait.evidence?.level || 'E';
            evidenceDistribution[level] = (evidenceDistribution[level] || 0) + 1;
        });
        
        const avgSeverity = totalTraits > 0 ? 
            Math.round(this.allTraits.reduce((sum, trait) => sum + trait.severity, 0) / totalTraits) : 0;
        
        // Calculate network metrics
        const maxConnections = totalTraits * (totalTraits - 1) / 2;
        const networkDensity = maxConnections > 0 ? 
            (this.connections.length / maxConnections) * 100 : 0;
        
        // Calculate average connection strength
        const avgConnectionStrength = this.connections.length > 0 ?
            Math.round(this.connections.reduce((sum, conn) => sum + conn.strength, 0) / this.connections.length) : 0;
        
        return {
            totalTraits,
            systemTraits,
            userTraits,
            categories: Object.keys(categoryDistribution).length,
            avgSeverity,
            severityDistribution,
            categoryDistribution,
            evidenceDistribution,
            connections: this.connections.length,
            networkDensity: Math.round(networkDensity * 10) / 10,
            avgConnectionStrength,
            favorites: this.favoriteTraits.length,
            searchHistory: this.searchHistory.length,
            lastUpdated: this.analyticsCache.lastUpdated || new Date().toISOString()
        };
    }
    
    getCategoryStatistics(category) {
        const traits = this.allTraits.filter(t => t.category === category);
        const total = traits.length;
        
        if (total === 0) return null;
        
        const avgSeverity = Math.round(traits.reduce((sum, t) => sum + t.severity, 0) / total);
        
        const severityRange = {
            min: Math.min(...traits.map(t => t.severity)),
            max: Math.max(...traits.map(t => t.severity))
        };
        
        const evidenceLevels = {};
        traits.forEach(trait => {
            const level = trait.evidence?.level || 'E';
            evidenceLevels[level] = (evidenceLevels[level] || 0) + 1;
        });
        
        // Get common biomarkers in this category
        const biomarkerFrequency = {};
        traits.forEach(trait => {
            trait.biomarkers?.forEach(bio => {
                biomarkerFrequency[bio] = (biomarkerFrequency[bio] || 0) + 1;
            });
        });
        
        const commonBiomarkers = Object.entries(biomarkerFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([bio, count]) => ({ bio, frequency: count / total }));
        
        return {
            total,
            avgSeverity,
            severityRange,
            evidenceLevels,
            commonBiomarkers,
            traits: traits.map(t => ({
                id: t.id,
                name: t.name,
                severity: t.severity
            }))
        };
    }
    
    // ============================================================================
    // EVENT SYSTEM
    // ============================================================================
    
    emitTraitAddedEvent(trait) {
        this.dispatchEvent('clinical:trait-added', { 
            trait,
            statistics: this.getStatistics(),
            timestamp: new Date().toISOString()
        });
    }
    
    emitTraitUpdatedEvent(trait) {
        this.dispatchEvent('clinical:trait-updated', {
            trait,
            timestamp: new Date().toISOString()
        });
    }
    
    emitTraitDeletedEvent(traitId) {
        this.dispatchEvent('clinical:trait-deleted', {
            traitId,
            statistics: this.getStatistics(),
            timestamp: new Date().toISOString()
        });
    }
    
    emitConnectionAddedEvent(connection) {
        this.dispatchEvent('clinical:connection-added', {
            connection,
            timestamp: new Date().toISOString()
        });
    }
    
    emitConnectionUpdatedEvent(connection) {
        this.dispatchEvent('clinical:connection-updated', {
            connection,
            timestamp: new Date().toISOString()
        });
    }
    
    emitConnectionDeletedEvent(connectionId) {
        this.dispatchEvent('clinical:connection-deleted', {
            connectionId,
            timestamp: new Date().toISOString()
        });
    }
    
    emitUpdateEvent() {
        this.dispatchEvent('clinical:database-updated', {
            statistics: this.getStatistics(),
            timestamp: new Date().toISOString()
        });
    }
    
    emitAnalyticsUpdatedEvent() {
        this.dispatchEvent('clinical:analytics-updated', {
            analytics: this.analyticsCache,
            timestamp: new Date().toISOString()
        });
    }
    
    emitConflictWarningEvent(data) {
        this.dispatchEvent('clinical:conflict-warning', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }
    
    emitImportCompleteEvent(results) {
        this.dispatchEvent('clinical:import-complete', {
            results,
            timestamp: new Date().toISOString()
        });
    }
    
    emitRestoreCompleteEvent(data) {
        this.dispatchEvent('clinical:restore-complete', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }
    
    emitFavoritesUpdatedEvent() {
        this.dispatchEvent('clinical:favorites-updated', {
            favorites: this.favoriteTraits,
            timestamp: new Date().toISOString()
        });
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    // ============================================================================
    // MAINTENANCE & CLEANUP
    // ============================================================================
    
    cleanupDatabase() {
        console.log('Starting database cleanup...');
        
        const report = {
            removedTraits: 0,
            removedConnections: 0,
            cleanedCases: 0
        };
        
        // Remove orphaned connections (where one trait doesn't exist)
        const initialConnectionCount = this.connections.length;
        this.connections = this.connections.filter(conn => {
            const sourceExists = this.allTraits.some(t => t.id === conn.source);
            const targetExists = this.allTraits.some(t => t.id === conn.target);
            
            if (!sourceExists || !targetExists) {
                report.removedConnections++;
                return false;
            }
            return true;
        });
        
        if (report.removedConnections > 0) {
            this.saveConnections();
        }
        
        // Clean up search history (remove duplicates and old entries)
        const uniqueSearches = new Map();
        this.searchHistory.forEach(entry => {
            if (!uniqueSearches.has(entry.term)) {
                uniqueSearches.set(entry.term, entry);
            }
        });
        
        this.searchHistory = Array.from(uniqueSearches.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, this.config.maxSearchHistory);
        
        this.saveSearchHistory();
        
        // Clean up favorites (remove references to non-existent traits)
        const initialFavoritesCount = this.favoriteTraits.length;
        this.favoriteTraits = this.favoriteTraits.filter(id => 
            this.allTraits.some(t => t.id === id)
        );
        
        if (this.favoriteTraits.length !== initialFavoritesCount) {
            this.saveFavorites();
        }
        
        // Update analytics cache
        this.precomputeAnalytics();
        
        console.log(`Cleanup completed: ${report.removedConnections} connections removed`);
        
        return report;
    }
    
    getDatabaseHealth() {
        const stats = this.getStatistics();
        const issues = [];
        
        // Check for orphaned connections
        const orphanedConnections = this.connections.filter(conn => {
            const sourceExists = this.allTraits.some(t => t.id === conn.source);
            const targetExists = this.allTraits.some(t => t.id === conn.target);
            return !sourceExists || !targetExists;
        });
        
        if (orphanedConnections.length > 0) {
            issues.push({
                type: 'orphaned_connections',
                count: orphanedConnections.length,
                severity: 'low',
                description: 'Connections referencing non-existent traits'
            });
        }
        
        // Check for invalid trait data
        const invalidTraits = this.allTraits.filter(t => {
            const validation = this.validateTrait(t);
            return !validation.isValid;
        });
        
        if (invalidTraits.length > 0) {
            issues.push({
                type: 'invalid_traits',
                count: invalidTraits.length,
                severity: 'medium',
                description: 'Traits with validation issues'
            });
        }
        
        // Check storage limits
        const totalSize = JSON.stringify({
            userTraits: this.userTraits,
            connections: this.connections,
            favorites: this.favoriteTraits,
            searchHistory: this.searchHistory
        }).length;
        
        const storageLimit = 5 * 1024 * 1024; // 5MB
        const storageUsage = (totalSize / storageLimit) * 100;
        
        if (storageUsage > 80) {
            issues.push({
                type: 'storage_limit',
                usage: Math.round(storageUsage),
                severity: 'high',
                description: 'Approaching localStorage limit'
            });
        }
        
        // Check analytics freshness
        if (this.analyticsCache.lastUpdated) {
            const lastUpdate = new Date(this.analyticsCache.lastUpdated);
            const now = new Date();
            const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
            
            if (hoursSinceUpdate > 24) {
                issues.push({
                    type: 'stale_analytics',
                    hours: Math.round(hoursSinceUpdate),
                    severity: 'low',
                    description: 'Analytics cache needs refresh'
                });
            }
        }
        
        return {
            status: issues.length === 0 ? 'healthy' : 'needs_attention',
            statistics: stats,
            issues,
            timestamp: new Date().toISOString()
        };
    }
}

// ============================================================================
// GLOBAL EXPORT
// ============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClinicalDatabase;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
    window.ClinicalDatabase = ClinicalDatabase;
}

// Auto-initialize if in browser context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Check if database already exists
        if (!window.clinicalDB) {
            window.clinicalDB = new ClinicalDatabase();
            console.log('Clinical Database auto-initialized');
        }
    });
}
