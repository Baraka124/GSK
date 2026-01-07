// clinical-database.js - IMPROVED VERSION

class ClinicalDatabase {
    constructor() {
        this.systemTraits = this.loadSystemTraits();
        this.userTraits = this.loadUserTraits();
        this.connections = this.loadConnections();
        this.categories = this.extractCategories();
        this.evidenceLevels = ['A', 'B', 'C', 'D'];
        this.init();
    }
    
    init() {
        // Initialize with default data if empty
        if (this.systemTraits.length === 0) {
            this.systemTraits = this.getDefaultTraits();
        }
        
        // Merge all traits
        this.allTraits = [...this.systemTraits, ...this.userTraits];
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'clinical_user_traits') {
                this.userTraits = this.loadUserTraits();
                this.allTraits = [...this.systemTraits, ...this.userTraits];
                this.emitUpdateEvent();
            }
        });
    }
    
    getDefaultTraits() {
        // Return a comprehensive set of default traits
        return [
            // Pulmonary
            {
                id: "PULM-001",
                name: "Airflow Limitation (Obstructive)",
                spanishName: "Limitación al flujo aéreo",
                category: "pulmonary",
                subcategory: "Physiological",
                color: "#2d6ca2",
                icon: "fas fa-wind",
                evaluation: "Spirometry (pre/post bronchodilator), FEV1/FVC ratio, Flow-volume loop",
                goldStandard: "Post-bronchodilator FEV1/FVC < 0.70",
                biomarkers: ["FEV1", "FVC", "FEV1/FVC", "PEF", "FEF25-75%"],
                severityCriteria: "GOLD Stages 1-4",
                severity: 85,
                evidence: { 
                    level: "A", 
                    guidelines: ["GOLD 2024", "ATS/ERS 2022"],
                    references: ["Lancet. 2018;391(10131):1706-1717"]
                },
                treatment: {
                    firstLine: "LAMA/LABA combination therapy",
                    secondLine: "ICS add-on if blood eosinophils ≥300 cells/μL",
                    thirdLine: "Roflumilast for frequent exacerbators",
                    nonPharmacological: "Smoking cessation, Pulmonary rehabilitation, Vaccination",
                    monitoring: "Regular spirometry, Exacerbation frequency"
                },
                tags: ["COPD", "Asthma", "Obstruction"],
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            },
            // Add more default traits here...
        ];
    }
    
    loadSystemTraits() {
        try {
            // In a real app, this might load from a JSON file or API
            const stored = localStorage.getItem('clinical_system_traits');
            if (stored) {
                return JSON.parse(stored);
            }
            
            // Return default traits
            return this.getDefaultTraits();
            
        } catch (error) {
            console.error('Error loading system traits:', error);
            return this.getDefaultTraits();
        }
    }
    
    loadUserTraits() {
        try {
            const saved = localStorage.getItem('clinical_user_traits');
            if (!saved) return [];
            
            const traits = JSON.parse(saved);
            
            // Validate and clean user traits
            return traits.map(trait => ({
                ...trait,
                id: trait.id || `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                isUserDefined: true,
                created: trait.created || new Date().toISOString(),
                updated: trait.updated || new Date().toISOString(),
                color: trait.color || this.getCategoryColor(trait.category),
                icon: trait.icon || 'fas fa-user-md'
            }));
            
        } catch (error) {
            console.error('Error loading user traits:', error);
            return [];
        }
    }
    
    loadConnections() {
        try {
            const saved = localStorage.getItem('clinical_connections');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading connections:', error);
            return [];
        }
    }
    
    saveUserTraits() {
        try {
            // Clean up user traits before saving
            const cleanTraits = this.userTraits.map(trait => ({
                id: trait.id,
                name: trait.name,
                spanishName: trait.spanishName || '',
                category: trait.category,
                evaluation: trait.evaluation,
                severity: trait.severity,
                treatment: trait.treatment,
                biomarkers: trait.biomarkers || [],
                color: trait.color,
                icon: trait.icon,
                isUserDefined: true,
                created: trait.created,
                updated: new Date().toISOString()
            }));
            
            localStorage.setItem('clinical_user_traits', JSON.stringify(cleanTraits));
            this.emitUpdateEvent();
            return true;
            
        } catch (error) {
            console.error('Error saving user traits:', error);
            return false;
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
    
    // CRUD Operations
    createUserTrait(traitData) {
        const newTrait = {
            ...traitData,
            id: `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isUserDefined: true,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        this.userTraits.push(newTrait);
        this.allTraits.push(newTrait);
        
        if (this.saveUserTraits()) {
            this.emitTraitAddedEvent(newTrait);
            return newTrait;
        }
        
        return null;
    }
    
    updateUserTrait(traitId, updates) {
        const index = this.userTraits.findIndex(t => t.id === traitId);
        if (index === -1) return false;
        
        this.userTraits[index] = {
            ...this.userTraits[index],
            ...updates,
            updated: new Date().toISOString()
        };
        
        // Update in allTraits
        const allIndex = this.allTraits.findIndex(t => t.id === traitId);
        if (allIndex !== -1) {
            this.allTraits[allIndex] = this.userTraits[index];
        }
        
        return this.saveUserTraits();
    }
    
    deleteUserTrait(traitId) {
        this.userTraits = this.userTraits.filter(t => t.id !== traitId);
        this.allTraits = this.allTraits.filter(t => t.id !== traitId);
        
        if (this.saveUserTraits()) {
            this.emitTraitDeletedEvent(traitId);
            return true;
        }
        
        return false;
    }
    
    // Connection management
    createConnection(sourceId, targetId, data = {}) {
        const connection = {
            id: `${sourceId}-${targetId}-${Date.now()}`,
            source: sourceId,
            target: targetId,
            type: data.type || 'association',
            strength: data.strength || 50,
            description: data.description || '',
            evidence: data.evidence || { level: 'C' },
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        this.connections.push(connection);
        this.saveConnections();
        this.emitConnectionAddedEvent(connection);
        
        return connection;
    }
    
    deleteConnection(connectionId) {
        this.connections = this.connections.filter(c => c.id !== connectionId);
        return this.saveConnections();
    }
    
    // Search and Filter
    searchTraits(query, filters = {}) {
        const searchTerm = query.toLowerCase().trim();
        
        let results = this.allTraits;
        
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            results = results.filter(trait => 
                trait.category === filters.category || 
                (filters.category === 'user-defined' && trait.isUserDefined)
            );
        }
        
        // Apply severity filter
        if (filters.severity) {
            switch(filters.severity) {
                case 'critical':
                    results = results.filter(t => t.severity >= 80);
                    break;
                case 'high':
                    results = results.filter(t => t.severity >= 65);
                    break;
                case 'moderate':
                    results = results.filter(t => t.severity >= 50);
                    break;
                case 'low':
                    results = results.filter(t => t.severity < 50);
                    break;
            }
        }
        
        // Apply search term
        if (searchTerm) {
            results = results.filter(trait => 
                trait.name.toLowerCase().includes(searchTerm) ||
                (trait.spanishName && trait.spanishName.toLowerCase().includes(searchTerm)) ||
                trait.category.toLowerCase().includes(searchTerm) ||
                trait.evaluation.toLowerCase().includes(searchTerm) ||
                (trait.treatment && typeof trait.treatment === 'object' && 
                 trait.treatment.firstLine.toLowerCase().includes(searchTerm)) ||
                (trait.biomarkers && trait.biomarkers.some(b => b.toLowerCase().includes(searchTerm))) ||
                (trait.tags && trait.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Apply sorting
        if (filters.sortBy) {
            results.sort((a, b) => {
                switch(filters.sortBy) {
                    case 'severity':
                        return filters.sortOrder === 'asc' ? 
                            a.severity - b.severity : b.severity - a.severity;
                    case 'name':
                        return filters.sortOrder === 'asc' ?
                            a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                    case 'category':
                        return filters.sortOrder === 'asc' ?
                            a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
                    default:
                        return 0;
                }
            });
        }
        
        return results;
    }
    
    // Data Analysis
    getStatistics() {
        const totalTraits = this.allTraits.length;
        const systemTraits = this.systemTraits.length;
        const userTraits = this.userTraits.length;
        
        const severityDistribution = {
            critical: this.allTraits.filter(t => t.severity >= 80).length,
            high: this.allTraits.filter(t => t.severity >= 65 && t.severity < 80).length,
            moderate: this.allTraits.filter(t => t.severity >= 50 && t.severity < 65).length,
            low: this.allTraits.filter(t => t.severity < 50).length
        };
        
        const categoryDistribution = {};
        this.allTraits.forEach(trait => {
            categoryDistribution[trait.category] = (categoryDistribution[trait.category] || 0) + 1;
        });
        
        const avgSeverity = totalTraits > 0 ? 
            Math.round(this.allTraits.reduce((sum, trait) => sum + trait.severity, 0) / totalTraits) : 0;
        
        return {
            totalTraits,
            systemTraits,
            userTraits,
            categories: Object.keys(categoryDistribution).length,
            avgSeverity,
            severityDistribution,
            categoryDistribution,
            totalConnections: this.connections.length
        };
    }
    
    getCategoryStatistics(category) {
        const traits = this.allTraits.filter(t => t.category === category);
        const total = traits.length;
        
        if (total === 0) return null;
        
        const avgSeverity = Math.round(traits.reduce((sum, t) => sum + t.severity, 0) / total);
        const evidenceLevels = {};
        
        traits.forEach(trait => {
            if (trait.evidence && trait.evidence.level) {
                evidenceLevels[trait.evidence.level] = (evidenceLevels[trait.evidence.level] || 0) + 1;
            }
        });
        
        return {
            total,
            avgSeverity,
            evidenceLevels,
            severityRange: {
                min: Math.min(...traits.map(t => t.severity)),
                max: Math.max(...traits.map(t => t.severity))
            }
        };
    }
    
    // Export Functions
    exportDatabase(format = 'json', options = {}) {
        const data = {
            metadata: {
                exported: new Date().toISOString(),
                version: '1.0',
                source: 'TraitMap Pro Clinical Database'
            },
            statistics: this.getStatistics(),
            traits: options.includeTraits ? this.allTraits : [],
            connections: options.includeConnections ? this.connections : [],
            categories: options.includeCategories ? this.categories : []
        };
        
        switch(format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return this.exportToCSV(data.traits);
                
            case 'excel':
                // This would require additional libraries
                return this.exportToExcel(data);
                
            default:
                return data;
        }
    }
    
    exportToCSV(traits) {
        if (!traits || traits.length === 0) return '';
        
        const headers = [
            'Name', 'Spanish Name', 'Category', 'Subcategory', 
            'Severity', 'Evaluation', 'Biomarkers', 
            'First Line Treatment', 'Non-Pharmacological',
            'Evidence Level', 'Tags', 'Created', 'Updated'
        ];
        
        const rows = traits.map(trait => {
            const biomarkers = trait.biomarkers ? trait.biomarkers.join('; ') : '';
            const tags = trait.tags ? trait.tags.join('; ') : '';
            const treatment = typeof trait.treatment === 'object' ? trait.treatment : { firstLine: trait.treatment };
            
            return [
                `"${trait.name.replace(/"/g, '""')}"`,
                `"${(trait.spanishName || '').replace(/"/g, '""')}"`,
                `"${trait.category.replace(/"/g, '""')}"`,
                `"${(trait.subcategory || '').replace(/"/g, '""')}"`,
                trait.severity,
                `"${trait.evaluation.replace(/"/g, '""')}"`,
                `"${biomarkers.replace(/"/g, '""')}"`,
                `"${(treatment.firstLine || '').replace(/"/g, '""')}"`,
                `"${(treatment.nonPharmacological || '').replace(/"/g, '""')}"`,
                trait.evidence?.level || '',
                `"${tags.replace(/"/g, '""')}"`,
                trait.created || '',
                trait.updated || ''
            ].join(',');
        });
        
        return [headers.join(','), ...rows].join('\n');
    }
    
    // Import Functions
    importFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (data.traits && Array.isArray(data.traits)) {
                // Validate and add traits
                data.traits.forEach(trait => {
                    if (!trait.id || trait.isUserDefined) {
                        this.createUserTrait(trait);
                    }
                });
                
                this.emitImportCompleteEvent(data.traits.length);
                return { success: true, count: data.traits.length };
            }
            
            return { success: false, error: 'Invalid data format' };
            
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Event System
    emitTraitAddedEvent(trait) {
        const event = new CustomEvent('clinical:trait-added', { 
            detail: { trait, timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(event);
    }
    
    emitTraitDeletedEvent(traitId) {
        const event = new CustomEvent('clinical:trait-deleted', { 
            detail: { traitId, timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(event);
    }
    
    emitConnectionAddedEvent(connection) {
        const event = new CustomEvent('clinical:connection-added', { 
            detail: { connection, timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(event);
    }
    
    emitUpdateEvent() {
        const event = new CustomEvent('clinical:database-updated', { 
            detail: { statistics: this.getStatistics() } 
        });
        window.dispatchEvent(event);
    }
    
    emitImportCompleteEvent(count) {
        const event = new CustomEvent('clinical:import-complete', { 
            detail: { count, timestamp: new Date().toISOString() } 
        });
        window.dispatchEvent(event);
    }
    
    // Helper Methods
    extractCategories() {
        const categories = new Set();
        this.allTraits.forEach(trait => categories.add(trait.category));
        return Array.from(categories);
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
    
    getTraitById(id) {
        return this.allTraits.find(trait => trait.id === id);
    }
    
    getTraitsByIds(ids) {
        return this.allTraits.filter(trait => ids.includes(trait.id));
    }
    
    getRelatedTraits(traitId, depth = 1) {
        const connections = this.connections.filter(conn => 
            conn.source === traitId || conn.target === traitId
        );
        
        const relatedIds = new Set();
        connections.forEach(conn => {
            if (conn.source === traitId) relatedIds.add(conn.target);
            if (conn.target === traitId) relatedIds.add(conn.source);
        });
        
        return this.getTraitsByIds(Array.from(relatedIds));
    }
    
    // Validation
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
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Backup and Restore
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            userTraits: this.userTraits,
            connections: this.connections
        };
        
        return JSON.stringify(backup, null, 2);
    }
    
    restoreFromBackup(backupData) {
        try {
            const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            
            if (backup.userTraits && Array.isArray(backup.userTraits)) {
                this.userTraits = backup.userTraits;
                this.allTraits = [...this.systemTraits, ...this.userTraits];
                this.saveUserTraits();
            }
            
            if (backup.connections && Array.isArray(backup.connections)) {
                this.connections = backup.connections;
                this.saveConnections();
            }
            
            return { success: true, message: 'Backup restored successfully' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
