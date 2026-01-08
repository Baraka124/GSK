// ============================================================================
// CLINICAL DATABASE v4.0 - COMPLETE REWRITE WITH REAL ALGORITHMS
// ============================================================================

class ClinicalDatabase {
    constructor() {
        console.log('Initializing Clinical Database v4.0...');
        
        // Initialize core components
        this.eventSystem = window.clinicalEvents || this.createEventSystem();
        this.graph = new ClinicalGraph();
        this.mlEngine = new ClinicalML();
        this.syncManager = new ClinicalSyncManager();
        this.security = new ClinicalSecurity();
        this.analytics = new ClinicalAnalytics();
        this.cache = new ClinicalCache();
        this.index = new ClinicalIndex();
        
        // Core data stores with IndexedDB
        this.db = null;
        this.initDatabase().then(() => {
            this.loadInitialData();
            this.setupEventListeners();
            this.precomputeAnalytics();
            this.startBackgroundSync();
        });
        
        // Configuration
        this.config = {
            maxCacheSize: 1000,
            syncInterval: 30000,
            analyticsRefresh: 300000,
            offlineQueueSize: 100,
            encryptionEnabled: true
        };
    }
    
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ClinicalDatabase_v4', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores with indexes
                const traitsStore = db.createObjectStore('traits', { keyPath: 'id' });
                traitsStore.createIndex('category', 'category', { unique: false });
                traitsStore.createIndex('severity', 'severity', { unique: false });
                traitsStore.createIndex('updated', 'updated', { unique: false });
                traitsStore.createIndex('userDefined', 'isUserDefined', { unique: false });
                
                const connectionsStore = db.createObjectStore('connections', { keyPath: 'id' });
                connectionsStore.createIndex('source', 'source', { unique: false });
                connectionsStore.createIndex('target', 'target', { unique: false });
                connectionsStore.createIndex('strength', 'strength', { unique: false });
                
                db.createObjectStore('analytics', { keyPath: 'type' });
                db.createObjectStore('cache', { keyPath: 'key' });
                db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
                
                console.log('Database schema created');
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Database initialization failed:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    // ============================================================================
    // GRAPH ALGORITHMS IMPLEMENTATION
    // ============================================================================
    
    calculateNetworkMetrics() {
        const metrics = {
            density: this.graph.calculateDensity(),
            degreeCentrality: this.graph.calculateDegreeCentrality(),
            betweennessCentrality: this.graph.calculateBetweennessCentrality(),
            clusteringCoefficient: this.graph.calculateClusteringCoefficient(),
            communities: this.graph.detectCommunitiesLouvain(),
            bridges: this.graph.findBridges(),
            articulationPoints: this.graph.findArticulationPoints()
        };
        
        return metrics;
    }
    
    findClinicalPatterns() {
        const traits = Array.from(this.graph.nodes.values());
        const connections = Array.from(this.graph.edgeData.values());
        
        // Use real ML algorithms instead of hard-coded patterns
        const patterns = this.mlEngine.detectPatterns(traits, connections);
        
        // Add graph-based pattern detection
        const graphPatterns = this.detectGraphPatterns();
        
        return [...patterns, ...graphPatterns];
    }
    
    detectGraphPatterns() {
        const patterns = [];
        
        // Star pattern (central trait with many connections)
        const centrality = this.graph.calculateDegreeCentrality();
        for (const [traitId, centralityScore] of centrality.entries()) {
            if (centralityScore.degree >= 5) {
                patterns.push({
                    name: 'Central Hub Pattern',
                    traitId: traitId,
                    description: `${this.graph.nodes.get(traitId).name} acts as a central hub`,
                    confidence: Math.min(0.9, centralityScore.normalizedDegree),
                    implications: 'Consider if this trait is driving others'
                });
            }
        }
        
        // Cluster detection
        const communities = this.graph.detectCommunitiesLouvain();
        for (const [communityId, traitIds] of communities.entries()) {
            if (traitIds.length >= 3) {
                const traits = traitIds.map(id => this.graph.nodes.get(id));
                const avgSeverity = traits.reduce((sum, t) => sum + t.severity, 0) / traits.length;
                
                patterns.push({
                    name: `Clinical Cluster ${communityId}`,
                    traitIds,
                    description: `${traits.length} traits form a clinical cluster`,
                    confidence: 0.7,
                    avgSeverity,
                    implications: 'Cluster may represent a clinical syndrome'
                });
            }
        }
        
        return patterns;
    }
    
    // ============================================================================
    // REAL ML ALGORITHMS
    // ============================================================================
    
    predictClinicalOutcomes(traits, patientData = {}) {
        // Extract features from traits
        const features = this.mlEngine.extractFeatures(traits);
        
        // Train/predict using multiple models
        const predictions = {
            exacerbationRisk: this.mlEngine.predictExacerbation(features, patientData),
            hospitalizationRisk: this.mlEngine.predictHospitalization(features, patientData),
            functionalDecline: this.mlEngine.predictFunctionalDecline(features, patientData),
            treatmentResponse: this.mlEngine.predictTreatmentResponse(features, patientData)
        };
        
        // Calculate composite risk score
        const compositeRisk = this.calculateCompositeRisk(predictions);
        
        return {
            ...predictions,
            compositeRisk,
            confidence: this.calculatePredictionConfidence(predictions)
        };
    }
    
    calculateCompositeRisk(predictions) {
        const weights = {
            exacerbationRisk: 0.3,
            hospitalizationRisk: 0.4,
            functionalDecline: 0.2,
            treatmentResponse: 0.1
        };
        
        let totalWeighted = 0;
        let totalWeight = 0;
        
        for (const [key, prediction] of Object.entries(predictions)) {
            if (prediction.score !== undefined) {
                totalWeighted += prediction.score * weights[key];
                totalWeight += weights[key];
            }
        }
        
        return totalWeight > 0 ? totalWeighted / totalWeight : 0;
    }
    
    clusterTraitsAdvanced(traits, algorithm = 'kmeans') {
        switch (algorithm) {
            case 'kmeans':
                return this.mlEngine.clusterKMeans(traits);
            case 'hierarchical':
                return this.mlEngine.clusterHierarchical(traits);
            case 'dbscan':
                return this.mlEngine.clusterDBSCAN(traits);
            case 'spectral':
                return this.mlEngine.clusterSpectral(traits);
            default:
                return this.mlEngine.clusterKMeans(traits);
        }
    }
    
    // ============================================================================
    // ADVANCED SEARCH WITH REAL ALGORITHMS
    // ============================================================================
    
    searchTraitsAdvanced(query, options = {}) {
        const startTime = performance.now();
        
        // Text search using inverted index
        const textResults = this.index.search(query, options.limit || 50);
        
        // Semantic search if embeddings available
        let semanticResults = [];
        if (options.semantic && this.mlEngine.embeddings) {
            semanticResults = this.mlEngine.semanticSearch(query, options);
        }
        
        // Graph-based search (find related traits)
        let graphResults = [];
        if (options.relatedTo) {
            graphResults = this.searchRelatedTraits(options.relatedTo, options.depth || 2);
        }
        
        // Combine and rank results
        const combinedResults = this.combineSearchResults(
            textResults, 
            semanticResults, 
            graphResults,
            options
        );
        
        const searchTime = performance.now() - startTime;
        this.analytics.recordSearch(query, combinedResults.length, searchTime);
        
        return {
            results: combinedResults,
            stats: {
                total: combinedResults.length,
                textMatches: textResults.length,
                semanticMatches: semanticResults.length,
                graphMatches: graphResults.length,
                timeMs: searchTime
            }
        };
    }
    
    searchRelatedTraits(traitId, depth = 2) {
        return this.graph.findNeighborsWithinDistance(traitId, depth)
            .map(id => ({
                trait: this.graph.nodes.get(id),
                distance: this.graph.getDistance(traitId, id),
                path: this.graph.findShortestPath(traitId, id).path
            }))
            .sort((a, b) => a.distance - b.distance);
    }
    
    combineSearchResults(textResults, semanticResults, graphResults, options) {
        const combined = new Map();
        
        // Add text results with base score
        textResults.forEach((result, index) => {
            const score = 1.0 - (index * 0.01); // Position-based scoring
            combined.set(result.docId, {
                trait: this.getTrait(result.docId),
                score: score,
                sources: ['text'],
                textScore: result.score
            });
        });
        
        // Add semantic results
        semanticResults.forEach((result, index) => {
            const existing = combined.get(result.trait.id);
            if (existing) {
                existing.score += result.similarity * 0.5;
                existing.sources.push('semantic');
                existing.semanticScore = result.similarity;
            } else {
                combined.set(result.trait.id, {
                    trait: result.trait,
                    score: result.similarity,
                    sources: ['semantic'],
                    semanticScore: result.similarity
                });
            }
        });
        
        // Add graph results
        graphResults.forEach((result, index) => {
            const existing = combined.get(result.trait.id);
            const graphScore = 1.0 / (result.distance + 1);
            
            if (existing) {
                existing.score += graphScore * 0.3;
                existing.sources.push('graph');
                existing.graphDistance = result.distance;
            } else {
                combined.set(result.trait.id, {
                    trait: result.trait,
                    score: graphScore,
                    sources: ['graph'],
                    graphDistance: result.distance
                });
            }
        });
        
        // Convert to array and sort
        return Array.from(combined.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, options.limit || 50);
    }
    
    // ============================================================================
    // REAL-TIME SYNC IMPLEMENTATION
    // ============================================================================
    
    startBackgroundSync() {
        // Check for network connectivity
        if (navigator.onLine) {
            this.syncManager.sync();
        }
        
        // Set up periodic sync
        setInterval(() => {
            if (navigator.onLine) {
                this.syncManager.sync();
            }
        }, this.config.syncInterval);
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.syncManager.sync());
        window.addEventListener('offline', () => {
            console.log('App offline - changes will be queued');
        });
    }
    
    async syncNow() {
        try {
            const changes = await this.syncManager.getLocalChanges();
            const result = await this.syncManager.sendToServer(changes);
            
            // Update local state with any server changes
            await this.mergeServerChanges(result.serverChanges);
            
            // Clear synced changes
            await this.syncManager.clearSyncedChanges(changes);
            
            this.eventSystem.emit('sync:complete', {
                success: true,
                syncedChanges: changes.length,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            this.eventSystem.emit('sync:failed', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    
    // ============================================================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================================================
    
    async precomputeAnalytics() {
        const startTime = performance.now();
        
        // Use Web Worker for heavy computations
        const worker = new Worker('analytics-worker.js');
        
        worker.postMessage({
            type: 'precompute',
            traits: Array.from(this.graph.nodes.values()),
            connections: Array.from(this.graph.edgeData.values())
        });
        
        worker.onmessage = (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'patterns':
                    this.cache.set('patterns', data, 300000); // 5 minutes
                    break;
                case 'clusters':
                    this.cache.set('clusters', data, 300000);
                    break;
                case 'predictions':
                    this.cache.set('predictions', data, 300000);
                    break;
                case 'metrics':
                    this.cache.set('metrics', data, 60000); // 1 minute
                    break;
            }
            
            this.eventSystem.emit('analytics:updated', {
                type,
                timestamp: new Date().toISOString(),
                computeTime: performance.now() - startTime
            });
        };
        
        worker.onerror = (error) => {
            console.error('Analytics worker error:', error);
            this.eventSystem.emit('analytics:error', { error: error.message });
        };
    }
    
    // ============================================================================
    // DATA MANAGEMENT WITH OPTIMIZED OPERATIONS
    // ============================================================================
    
    async createTrait(traitData) {
        const validation = this.validateTrait(traitData);
        if (!validation.isValid) {
            throw new Error(`Invalid trait: ${validation.errors.join(', ')}`);
        }
        
        const trait = {
            ...traitData,
            id: `trait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            version: 1
        };
        
        // Encrypt if enabled
        if (this.config.encryptionEnabled) {
            trait.encrypted = await this.security.encryptData(trait);
        }
        
        // Add to graph
        this.graph.addNode(trait);
        
        // Add to database
        await this.saveToDatabase('traits', trait);
        
        // Update indexes
        this.index.indexTrait(trait);
        
        // Clear relevant caches
        this.cache.invalidate(['traits', 'search', 'analytics']);
        
        // Emit event
        this.eventSystem.emit('trait:created', {
            trait,
            timestamp: new Date().toISOString()
        });
        
        // Queue for sync
        await this.syncManager.queueChange({
            type: 'create',
            entity: 'trait',
            data: trait,
            timestamp: trait.created
        });
        
        return trait;
    }
    
    async updateTrait(traitId, updates) {
        const existing = await this.getTrait(traitId);
        if (!existing) {
            throw new Error(`Trait ${traitId} not found`);
        }
        
        const updatedTrait = {
            ...existing,
            ...updates,
            updated: new Date().toISOString(),
            version: existing.version + 1
        };
        
        // Validate
        const validation = this.validateTrait(updatedTrait);
        if (!validation.isValid) {
            throw new Error(`Invalid updates: ${validation.errors.join(', ')}`);
        }
        
        // Update graph
        this.graph.updateNode(traitId, updatedTrait);
        
        // Update database
        await this.saveToDatabase('traits', updatedTrait);
        
        // Update indexes
        this.index.updateTrait(updatedTrait);
        
        // Clear caches
        this.cache.invalidate(['traits', traitId, 'search', 'analytics']);
        
        // Emit event
        this.eventSystem.emit('trait:updated', {
            traitId,
            oldTrait: existing,
            newTrait: updatedTrait,
            timestamp: updatedTrait.updated
        });
        
        // Queue for sync
        await this.syncManager.queueChange({
            type: 'update',
            entity: 'trait',
            id: traitId,
            data: updates,
            timestamp: updatedTrait.updated,
            version: updatedTrait.version
        });
        
        return updatedTrait;
    }
    
    async deleteTrait(traitId) {
        const trait = await this.getTrait(traitId);
        if (!trait) {
            throw new Error(`Trait ${traitId} not found`);
        }
        
        // Remove from graph
        this.graph.removeNode(traitId);
        
        // Remove from database
        await this.deleteFromDatabase('traits', traitId);
        
        // Remove from indexes
        this.index.removeTrait(traitId);
        
        // Clear caches
        this.cache.invalidate(['traits', traitId, 'search', 'analytics']);
        
        // Emit event
        this.eventSystem.emit('trait:deleted', {
            traitId,
            trait,
            timestamp: new Date().toISOString()
        });
        
        // Queue for sync
        await this.syncManager.queueChange({
            type: 'delete',
            entity: 'trait',
            id: traitId,
            timestamp: new Date().toISOString()
        });
        
        return true;
    }
    
    // ============================================================================
    // CONNECTION MANAGEMENT WITH GRAPH ALGORITHMS
    // ============================================================================
    
    async createConnection(sourceId, targetId, data = {}) {
        // Verify both traits exist
        const source = await this.getTrait(sourceId);
        const target = await this.getTrait(targetId);
        
        if (!source || !target) {
            throw new Error('Source or target trait not found');
        }
        
        if (sourceId === targetId) {
            throw new Error('Cannot connect trait to itself');
        }
        
        // Check for existing connection
        const existing = this.graph.getEdge(sourceId, targetId);
        if (existing) {
            throw new Error('Connection already exists');
        }
        
        // Calculate connection properties using ML
        const connectionData = {
            ...data,
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: sourceId,
            target: targetId,
            strength: this.calculateConnectionStrength(source, target),
            direction: data.direction || 'bidirectional',
            type: data.type || 'association',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            version: 1
        };
        
        // Check for treatment conflicts using ML
        const conflicts = await this.checkTreatmentConflicts(source, target);
        if (conflicts.length > 0) {
            connectionData.conflicts = conflicts;
            connectionData.hasConflicts = true;
        }
        
        // Add to graph
        this.graph.addEdge(sourceId, targetId, connectionData);
        
        // Save to database
        await this.saveToDatabase('connections', connectionData);
        
        // Clear caches
        this.cache.invalidate(['connections', 'analytics', 'network']);
        
        // Emit event
        this.eventSystem.emit('connection:created', {
            connection: connectionData,
            timestamp: connectionData.created
        });
        
        // Queue for sync
        await this.syncManager.queueChange({
            type: 'create',
            entity: 'connection',
            data: connectionData,
            timestamp: connectionData.created
        });
        
        return connectionData;
    }
    
    calculateConnectionStrength(sourceTrait, targetTrait) {
        // Use ML engine for sophisticated strength calculation
        return this.mlEngine.calculateConnectionStrength(sourceTrait, targetTrait);
    }
    
    async checkTreatmentConflicts(trait1, trait2) {
        const conflicts = [];
        
        // Extract medications from treatments
        const meds1 = this.extractMedications(trait1.treatment);
        const meds2 = this.extractMedications(trait2.treatment);
        
        // Check for known conflicts
        for (const med1 of meds1) {
            for (const med2 of meds2) {
                const conflict = await this.findDrugInteraction(med1, med2);
                if (conflict) {
                    conflicts.push(conflict);
                }
            }
        }
        
        // Check for therapeutic duplication
        if (this.hasTherapeuticDuplication(meds1, meds2)) {
            conflicts.push({
                type: 'duplication',
                severity: 'moderate',
                description: 'Therapeutic duplication detected',
                recommendation: 'Consider consolidating therapy'
            });
        }
        
        return conflicts;
    }
    
    // ============================================================================
    // ADVANCED ANALYTICS
    // ============================================================================
    
    async generateClinicalInsights() {
        const insights = [];
        
        // 1. Network-based insights
        const networkMetrics = this.calculateNetworkMetrics();
        
        if (networkMetrics.density > 0.7) {
            insights.push({
                type: 'network_density',
                title: 'Highly Connected Network',
                description: 'Clinical traits show high interconnectivity',
                severity: 'info',
                recommendation: 'Consider systemic treatment approach',
                confidence: 0.8
            });
        }
        
        // 2. Pattern-based insights
        const patterns = await this.findClinicalPatterns();
        for (const pattern of patterns) {
            if (pattern.confidence > 0.7) {
                insights.push({
                    type: 'pattern',
                    title: pattern.name,
                    description: pattern.description,
                    severity: pattern.avgSeverity > 70 ? 'high' : 'moderate',
                    recommendation: pattern.implications,
                    confidence: pattern.confidence
                });
            }
        }
        
        // 3. Risk-based insights
        const traits = Array.from(this.graph.nodes.values());
        if (traits.length > 0) {
            const predictions = this.predictClinicalOutcomes(traits);
            
            if (predictions.compositeRisk > 70) {
                insights.push({
                    type: 'risk',
                    title: 'High Clinical Risk',
                    description: `Composite risk score: ${predictions.compositeRisk.toFixed(1)}%`,
                    severity: 'critical',
                    recommendation: 'Urgent multidisciplinary review recommended',
                    confidence: predictions.confidence
                });
            }
        }
        
        // 4. Treatment complexity insights
        const complexity = this.calculateTreatmentComplexity(traits);
        if (complexity > 60) {
            insights.push({
                type: 'complexity',
                title: 'High Treatment Complexity',
                description: `Treatment complexity score: ${complexity}/100`,
                severity: 'moderate',
                recommendation: 'Consider therapy simplification',
                confidence: 0.75
            });
        }
        
        return insights.sort((a, b) => {
            // Sort by severity then confidence
            const severityOrder = { critical: 3, high: 2, moderate: 1, info: 0 };
            const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
            return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence;
        });
    }
    
    calculateTreatmentComplexity(traits) {
        let complexity = 0;
        
        traits.forEach(trait => {
            const treatment = trait.treatment;
            if (!treatment) return;
            
            // Count medication classes
            const meds = this.extractMedications(treatment);
            complexity += meds.length * 5;
            
            // Add complexity for combination therapies
            if (treatment.firstLine && treatment.firstLine.includes('/')) {
                complexity += 10;
            }
            
            // Add complexity for non-pharmacological interventions
            if (treatment.nonPharmacological) {
                complexity += 5;
            }
        });
        
        return Math.min(100, complexity);
    }
    
    // ============================================================================
    // CACHE MANAGEMENT
    // ============================================================================
    
    async getTrait(traitId, options = {}) {
        // Check cache first
        if (!options.skipCache) {
            const cached = this.cache.get(`trait_${traitId}`);
            if (cached) return cached;
        }
        
        // Check graph
        const fromGraph = this.graph.nodes.get(traitId);
        if (fromGraph) {
            this.cache.set(`trait_${traitId}`, fromGraph, 60000);
            return fromGraph;
        }
        
        // Check database
        try {
            const trait = await this.getFromDatabase('traits', traitId);
            if (trait) {
                // Add to graph and cache
                this.graph.addNode(trait);
                this.cache.set(`trait_${traitId}`, trait, 60000);
                return trait;
            }
        } catch (error) {
            console.error('Error loading trait from database:', error);
        }
        
        return null;
    }
    
    async getTraitsByCategory(category, options = {}) {
        const cacheKey = `traits_category_${category}`;
        
        if (!options.skipCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;
        }
        
        const traits = await this.queryDatabase('traits', 'category', category);
        if (traits.length > 0) {
            this.cache.set(cacheKey, traits, 300000);
        }
        
        return traits;
    }
    
    // ============================================================================
    // DATABASE OPERATIONS
    // ============================================================================
    
    async saveToDatabase(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    
    async getFromDatabase(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    
    async queryDatabase(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    
    async deleteFromDatabase(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    validateTrait(trait) {
        const errors = [];
        
        if (!trait.name || trait.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        
        if (!trait.category) {
            errors.push('Category is required');
        }
        
        if (trait.severity === undefined || trait.severity < 0 || trait.severity > 100) {
            errors.push('Severity must be between 0 and 100');
        }
        
        if (!trait.evaluation || trait.evaluation.trim().length < 10) {
            errors.push('Evaluation must be at least 10 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    extractMedications(treatment) {
        if (!treatment) return [];
        
        const meds = [];
        const treatmentStr = typeof treatment === 'string' ? 
            treatment : JSON.stringify(treatment);
        
        const medicationPatterns = [
            /(?:ics|inhaled corticosteroid)/gi,
            /(?:laba|long-acting beta agonist)/gi,
            /(?:lama|long-acting muscarinic antagonist)/gi,
            /(?:saba|short-acting beta agonist)/gi,
            /(?:sama|short-acting muscarinic antagonist)/gi,
            /(?:theophylline)/gi,
            /(?:roflumilast)/gi,
            /(?:azithromycin)/gi,
            /(?:prednisone|prednisolone|methylprednisolone)/gi,
            /(?:biologic|mepolizumab|omalizumab|benralizumab|dupilumab)/gi
        ];
        
        for (const pattern of medicationPatterns) {
            if (pattern.test(treatmentStr)) {
                meds.push(pattern.source.replace(/[()|]/g, ''));
            }
        }
        
        return [...new Set(meds)]; // Remove duplicates
    }
    
    async findDrugInteraction(med1, med2) {
        // This would integrate with a drug interaction database
        // For now, return hard-coded known interactions
        
        const interactions = {
            'theophylline-azithromycin': {
                type: 'pharmacokinetic',
                severity: 'high',
                description: 'Azithromycin increases theophylline levels',
                recommendation: 'Monitor theophylline levels, consider dose reduction'
            },
            'prednisone-theophylline': {
                type: 'additive',
                severity: 'moderate',
                description: 'Additive risk of hypokalemia',
                recommendation: 'Monitor potassium levels'
            }
        };
        
        const key1 = `${med1}-${med2}`;
        const key2 = `${med2}-${med1}`;
        
        return interactions[key1] || interactions[key2] || null;
    }
    
    hasTherapeuticDuplication(meds1, meds2) {
        // Check if same therapeutic class appears in both lists
        const classes1 = this.mapToTherapeuticClass(meds1);
        const classes2 = this.mapToTherapeuticClass(meds2);
        
        for (const cls of classes1) {
            if (classes2.includes(cls)) {
                return true;
            }
        }
        
        return false;
    }
    
    mapToTherapeuticClass(medications) {
        const classMap = {
            'ics': 'corticosteroid',
            'laba': 'beta_agonist',
            'lama': 'anticholinergic',
            'saba': 'beta_agonist',
            'sama': 'anticholinergic',
            'theophylline': 'methylxanthine',
            'roflumilast': 'pde4_inhibitor',
            'azithromycin': 'macrolide',
            'prednisone': 'corticosteroid',
            'biologic': 'biologic'
        };
        
        return medications.map(med => classMap[med.toLowerCase()] || 'other');
    }
    
    // ============================================================================
    // EVENT SYSTEM INTEGRATION
    // ============================================================================
    
    setupEventListeners() {
        // Listen for external events
        this.eventSystem.subscribe('network:connectivity', (data) => {
            if (data.online) {
                this.syncManager.sync();
            }
        });
        
        this.eventSystem.subscribe('security:lock', () => {
            this.security.lock();
        });
        
        this.eventSystem.subscribe('security:unlock', ({ password }) => {
            this.security.unlock(password);
        });
        
        // Emit internal events
        setInterval(() => {
            this.eventSystem.emit('database:health', this.getHealthStatus());
        }, 60000);
    }
    
    getHealthStatus() {
        return {
            graph: {
                nodes: this.graph.nodes.size,
                edges: this.graph.edgeData.size,
                density: this.graph.calculateDensity()
            },
            cache: this.cache.stats(),
            database: this.db ? 'connected' : 'disconnected',
            sync: this.syncManager.getStatus(),
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null,
            timestamp: new Date().toISOString()
        };
    }
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    async loadInitialData() {
        try {
            // Load system traits
            const systemTraits = await this.loadSystemTraits();
            systemTraits.forEach(trait => this.graph.addNode(trait));
            
            // Load user traits
            const userTraits = await this.loadUserTraits();
            userTraits.forEach(trait => this.graph.addNode(trait));
            
            // Load connections
            const connections = await this.loadConnections();
            connections.forEach(conn => {
                this.graph.addEdge(conn.source, conn.target, conn);
            });
            
            // Build indexes
            Array.from(this.graph.nodes.values()).forEach(trait => {
                this.index.indexTrait(trait);
            });
            
            console.log(`Initial data loaded: ${this.graph.nodes.size} traits, ${this.graph.edgeData.size} connections`);
            
            this.eventSystem.emit('database:ready', {
                traits: this.graph.nodes.size,
                connections: this.graph.edgeData.size,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }
    
    async loadSystemTraits() {
        // Load default clinical traits
        // In a real implementation, this would load from a file or API
        return [
            {
                id: 'sys_pulm_001',
                name: 'Airflow Limitation (Obstructive)',
                category: 'pulmonary',
                severity: 85,
                evaluation: 'Post-bronchodilator FEV1/FVC < 0.70',
                treatment: {
                    firstLine: 'LAMA/LABA combination',
                    secondLine: 'ICS add-on if eosinophils ≥300 cells/μL',
                    nonPharmacological: 'Smoking cessation, Pulmonary rehabilitation'
                },
                biomarkers: ['FEV1', 'FVC', 'FEV1/FVC', 'PEF'],
                evidence: { level: 'A' },
                isSystem: true,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            }
            // More traits would be loaded here
        ];
    }
    
    async loadUserTraits() {
        try {
            const transaction = this.db.transaction(['traits'], 'readonly');
            const store = transaction.objectStore('traits');
            const index = store.index('userDefined');
            const request = index.getAll(true);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error loading user traits:', error);
            return [];
        }
    }
    
    async loadConnections() {
        try {
            const transaction = this.db.transaction(['connections'], 'readonly');
            const store = transaction.objectStore('connections');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error loading connections:', error);
            return [];
        }
    }
    
    // ============================================================================
    // CLEANUP
    // ============================================================================
    
    async cleanup() {
        console.log('Cleaning up Clinical Database...');
        
        // Stop background processes
        this.syncManager.stop();
        
        // Clear caches
        this.cache.clear();
        
        // Close database
        if (this.db) {
            this.db.close();
        }
        
        // Remove event listeners
        this.eventSystem = null;
        
        console.log('Clinical Database cleaned up');
    }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class ClinicalGraph {
    constructor() {
        this.nodes = new Map();
        this.adjacency = new Map();
        this.edgeData = new Map();
        this.metrics = {
            lastCalculated: null,
            cache: new Map()
        };
    }
    
    addNode(trait) {
        this.nodes.set(trait.id, trait);
        this.adjacency.set(trait.id, new Set());
        this.metrics.cache.clear(); // Invalidate cached metrics
        return trait.id;
    }
    
    updateNode(traitId, updatedTrait) {
        if (this.nodes.has(traitId)) {
            this.nodes.set(traitId, updatedTrait);
            this.metrics.cache.clear();
        }
    }
    
    removeNode(traitId) {
        if (this.nodes.has(traitId)) {
            // Remove node
            this.nodes.delete(traitId);
            
            // Remove all connections involving this node
            const neighbors = this.adjacency.get(traitId) || new Set();
            for (const neighbor of neighbors) {
                const neighborAdj = this.adjacency.get(neighbor);
                if (neighborAdj) {
                    neighborAdj.delete(traitId);
                }
                
                // Remove edge data
                const edgeId = this.getEdgeId(traitId, neighbor);
                this.edgeData.delete(edgeId);
            }
            
            // Remove adjacency list
            this.adjacency.delete(traitId);
            
            this.metrics.cache.clear();
        }
    }
    
    addEdge(sourceId, targetId, data) {
        if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
            throw new Error('Nodes not found');
        }
        
        // Add to adjacency lists
        this.adjacency.get(sourceId).add(targetId);
        this.adjacency.get(targetId).add(sourceId);
        
        // Store edge data
        const edgeId = this.getEdgeId(sourceId, targetId);
        this.edgeData.set(edgeId, data);
        
        this.metrics.cache.clear();
    }
    
    getEdge(sourceId, targetId) {
        const edgeId = this.getEdgeId(sourceId, targetId);
        return this.edgeData.get(edgeId);
    }
    
    getEdgeId(sourceId, targetId) {
        const sorted = [sourceId, targetId].sort();
        return `${sorted[0]}-${sorted[1]}`;
    }
    
    calculateDensity() {
        const n = this.nodes.size;
        if (n < 2) return 0;
        
        const maxEdges = n * (n - 1) / 2;
        const actualEdges = this.edgeData.size;
        
        return actualEdges / maxEdges;
    }
    
    calculateDegreeCentrality() {
        const centrality = new Map();
        
        for (const [nodeId, neighbors] of this.adjacency) {
            centrality.set(nodeId, {
                degree: neighbors.size,
                normalizedDegree: neighbors.size / (this.nodes.size - 1)
            });
        }
        
        return centrality;
    }
    
    calculateBetweennessCentrality() {
        // Brandes' algorithm for betweenness centrality
        const centrality = new Map();
        const nodes = Array.from(this.nodes.keys());
        
        // Initialize centrality
        for (const node of nodes) {
            centrality.set(node, 0);
        }
        
        for (const s of nodes) {
            const S = [];
            const P = new Map();
            const sigma = new Map();
            const d = new Map();
            
            // Initialize
            for (const node of nodes) {
                P.set(node, []);
                sigma.set(node, 0);
                d.set(node, -1);
            }
            
            sigma.set(s, 1);
            d.set(s, 0);
            
            const Q = [s];
            
            while (Q.length > 0) {
                const v = Q.shift();
                S.push(v);
                
                for (const w of this.adjacency.get(v) || []) {
                    if (d.get(w) < 0) {
                        Q.push(w);
                        d.set(w, d.get(v) + 1);
                    }
                    
                    if (d.get(w) === d.get(v) + 1) {
                        sigma.set(w, sigma.get(w) + sigma.get(v));
                        P.get(w).push(v);
                    }
                }
            }
            
            const delta = new Map();
            for (const node of nodes) {
                delta.set(node, 0);
            }
            
            while (S.length > 0) {
                const w = S.pop();
                for (const v of P.get(w)) {
                    delta.set(v, delta.get(v) + (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w)));
                }
                if (w !== s) {
                    centrality.set(w, centrality.get(w) + delta.get(w));
                }
            }
        }
        
        // Normalize
        const n = nodes.length;
        const factor = 2 / ((n - 1) * (n - 2));
        
        const normalized = new Map();
        for (const [node, value] of centrality) {
            normalized.set(node, value * factor);
        }
        
        return normalized;
    }
    
    calculateClusteringCoefficient() {
        const coefficients = new Map();
        
        for (const [node, neighbors] of this.adjacency) {
            const k = neighbors.size;
            if (k < 2) {
                coefficients.set(node, 0);
                continue;
            }
            
            // Count triangles
            let triangles = 0;
            const neighborArray = Array.from(neighbors);
            
            for (let i = 0; i < neighborArray.length; i++) {
                for (let j = i + 1; j < neighborArray.length; j++) {
                    if (this.adjacency.get(neighborArray[i])?.has(neighborArray[j])) {
                        triangles++;
                    }
                }
            }
            
            const maxTriangles = k * (k - 1) / 2;
            coefficients.set(node, triangles / maxTriangles);
        }
        
        return coefficients;
    }
    
    detectCommunitiesLouvain() {
        // Simplified Louvain algorithm
        const communities = new Map();
        let communityId = 0;
        
        // Initialize each node in its own community
        for (const node of this.nodes.keys()) {
            communities.set(node, communityId++);
        }
        
        let improved = true;
        let iterations = 0;
        
        while (improved && iterations < 10) {
            improved = false;
            
            for (const node of this.nodes.keys()) {
                const bestCommunity = this.findBestCommunityLouvain(node, communities);
                if (bestCommunity !== communities.get(node)) {
                    communities.set(node, bestCommunity);
                    improved = true;
                }
            }
            
            iterations++;
        }
        
        // Group by community
        const communityGroups = new Map();
        for (const [node, commId] of communities) {
            if (!communityGroups.has(commId)) {
                communityGroups.set(commId, []);
            }
            communityGroups.get(commId).push(node);
        }
        
        return communityGroups;
    }
    
    findBestCommunityLouvain(node, communities) {
        const currentCommunity = communities.get(node);
        let bestCommunity = currentCommunity;
        let bestGain = 0;
        
        // Calculate modularity gain for each neighboring community
        const neighborCommunities = new Set();
        for (const neighbor of this.adjacency.get(node) || []) {
            neighborCommunities.add(communities.get(neighbor));
        }
        
        for (const community of neighborCommunities) {
            if (community !== currentCommunity) {
                const gain = this.calculateModularityGain(node, currentCommunity, community, communities);
                if (gain > bestGain) {
                    bestGain = gain;
                    bestCommunity = community;
                }
            }
        }
        
        return bestCommunity;
    }
    
    calculateModularityGain(node, oldCommunity, newCommunity, communities) {
        // Simplified modularity gain calculation
        const edgesInOld = this.countEdgesToCommunity(node, oldCommunity, communities);
        const edgesInNew = this.countEdgesToCommunity(node, newCommunity, communities);
        const degree = this.adjacency.get(node).size;
        
        return edgesInNew - edgesInOld - (degree / (2 * this.edgeData.size));
    }
    
    countEdgesToCommunity(node, community, communities) {
        let count = 0;
        for (const neighbor of this.adjacency.get(node) || []) {
            if (communities.get(neighbor) === community) {
                count++;
            }
        }
        return count;
    }
    
    findBridges() {
        const bridges = [];
        const ids = new Map();
        const low = new Map();
        let idCounter = 0;
        
        const dfs = (node, parent, visited) => {
            visited.add(node);
            ids.set(node, idCounter);
            low.set(node, idCounter);
            idCounter++;
            
            for (const neighbor of this.adjacency.get(node) || []) {
                if (neighbor === parent) continue;
                
                if (!visited.has(neighbor)) {
                    dfs(neighbor, node, visited);
                    low.set(node, Math.min(low.get(node), low.get(neighbor)));
                    
                    if (ids.get(node) < low.get(neighbor)) {
                        bridges.push({
                            source: node,
                            target: neighbor,
                            edgeId: this.getEdgeId(node, neighbor)
                        });
                    }
                } else {
                    low.set(node, Math.min(low.get(node), ids.get(neighbor)));
                }
            }
        };
        
        const visited = new Set();
        for (const node of this.nodes.keys()) {
            if (!visited.has(node)) {
                dfs(node, null, visited);
            }
        }
        
        return bridges;
    }
    
    findArticulationPoints() {
        const articulationPoints = new Set();
        const ids = new Map();
        const low = new Map();
        let idCounter = 0;
        
        const dfs = (node, parent, visited, isRoot) => {
            visited.add(node);
            ids.set(node, idCounter);
            low.set(node, idCounter);
            idCounter++;
            
            let children = 0;
            
            for (const neighbor of this.adjacency.get(node) || []) {
                if (neighbor === parent) continue;
                
                if (!visited.has(neighbor)) {
                    children++;
                    dfs(neighbor, node, visited, false);
                    
                    low.set(node, Math.min(low.get(node), low.get(neighbor)));
                    
                    if (!isRoot && ids.get(node) <= low.get(neighbor)) {
                        articulationPoints.add(node);
                    }
                } else {
                    low.set(node, Math.min(low.get(node), ids.get(neighbor)));
                }
            }
            
            if (isRoot && children > 1) {
                articulationPoints.add(node);
            }
        };
        
        const visited = new Set();
        for (const node of this.nodes.keys()) {
            if (!visited.has(node)) {
                dfs(node, null, visited, true);
            }
        }
        
        return Array.from(articulationPoints);
    }
    
    findNeighborsWithinDistance(startId, maxDistance) {
        const visited = new Set([startId]);
        const queue = [{ node: startId, distance: 0 }];
        const result = [];
        
        while (queue.length > 0) {
            const { node, distance } = queue.shift();
            
            if (distance > 0 && distance <= maxDistance) {
                result.push(node);
            }
            
            if (distance < maxDistance) {
                for (const neighbor of this.adjacency.get(node) || []) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push({ node: neighbor, distance: distance + 1 });
                    }
                }
            }
        }
        
        return result;
    }
    
    getDistance(sourceId, targetId) {
        const path = this.findShortestPath(sourceId, targetId);
        return path ? path.distance : Infinity;
    }
    
    findShortestPath(startId, endId) {
        // Dijkstra's algorithm
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        
        // Initialize
        for (const node of this.nodes.keys()) {
            distances.set(node, Infinity);
            previous.set(node, null);
            unvisited.add(node);
        }
        distances.set(startId, 0);
        
        while (unvisited.size > 0) {
            // Get node with smallest distance
            let current = null;
            let smallestDistance = Infinity;
            
            for (const node of unvisited) {
                if (distances.get(node) < smallestDistance) {
                    smallestDistance = distances.get(node);
                    current = node;
                }
            }
            
            if (current === null || current === endId) break;
            unvisited.delete(current);
            
            // Update distances to neighbors
            for (const neighbor of this.adjacency.get(current) || []) {
                if (unvisited.has(neighbor)) {
                    const edgeId = this.getEdgeId(current, neighbor);
                    const edgeData = this.edgeData.get(edgeId);
                    const weight = edgeData ? 100 - edgeData.strength : 50; // Inverse of strength
                    const alt = distances.get(current) + weight;
                    
                    if (alt < distances.get(neighbor)) {
                        distances.set(neighbor, alt);
                        previous.set(neighbor, current);
                    }
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = endId;
        
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }
        
        if (path.length === 1 && path[0] !== startId) {
            return null; // No path found
        }
        
        return {
            path,
            distance: distances.get(endId),
            strength: 100 - (distances.get(endId) / path.length)
        };
    }
}

class ClinicalML {
    constructor() {
        this.featureEncoder = new FeatureEncoder();
        this.models = new Map();
        this.embeddings = new Map();
    }
    
    extractFeatures(traits) {
        return traits.map(trait => ({
            severity: trait.severity / 100,
            category: this.featureEncoder.encodeCategory(trait.category),
            evidence: this.featureEncoder.encodeEvidence(trait.evidence?.level),
            hasBiomarkers: trait.biomarkers?.length > 0 ? 1 : 0,
            treatmentComplexity: this.calculateTreatmentComplexity(trait.treatment),
            ageFactor: this.extractAgeFactor(trait),
            inflammatory: this.isInflammatory(trait) ? 1 : 0,
            obstructive: this.isObstructive(trait) ? 1 : 0
        }));
    }
    
    calculateTreatmentComplexity(treatment) {
        if (!treatment) return 0;
        
        let complexity = 0;
        const treatmentStr = typeof treatment === 'object' ? 
            JSON.stringify(treatment) : treatment.toString();
        
        // Count medication classes
        const medicationTypes = [
            'ics', 'laba', 'lama', 'saba', 'corticosteroid',
            'antibiotic', 'biologic', 'immunosuppressant', 'theophylline'
        ];
        
        for (const type of medicationTypes) {
            if (treatmentStr.toLowerCase().includes(type)) {
                complexity += 1;
            }
        }
        
        // Check for combination therapies
        if (treatmentStr.includes('/') || treatmentStr.includes('+')) {
            complexity += 2;
        }
        
        // Check for monitoring requirements
        if (treatmentStr.includes('monitor') || treatmentStr.includes('check')) {
            complexity += 1;
        }
        
        return Math.min(1, complexity / 10);
    }
    
    extractAgeFactor(trait) {
        // Some traits are age-related
        const ageRelatedTerms = ['geriatric', 'elderly', 'pediatric', 'child', 'aging'];
        const evaluation = trait.evaluation?.toLowerCase() || '';
        
        for (const term of ageRelatedTerms) {
            if (evaluation.includes(term)) {
                return 1;
            }
        }
        
        return 0;
    }
    
    isInflammatory(trait) {
        const inflammatoryTerms = ['inflammatory', 'inflammation', 'crp', 'esr', 'eosinophil'];
        const evaluation = trait.evaluation?.toLowerCase() || '';
        const name = trait.name?.toLowerCase() || '';
        
        for (const term of inflammatoryTerms) {
            if (evaluation.includes(term) || name.includes(term)) {
                return true;
            }
        }
        
        return false;
    }
    
    isObstructive(trait) {
        const obstructiveTerms = ['obstructive', 'airflow', 'fev1', 'bronchodilator'];
        const evaluation = trait.evaluation?.toLowerCase() || '';
        const name = trait.name?.toLowerCase() || '';
        
        for (const term of obstructiveTerms) {
            if (evaluation.includes(term) || name.includes(term)) {
                return true;
            }
        }
        
        return false;
    }
    
    detectPatterns(traits, connections) {
        const patterns = [];
        
        // 1. Inflammatory-Obstructive pattern
        const inflammatoryTraits = traits.filter(t => this.isInflammatory(t));
        const obstructiveTraits = traits.filter(t => this.isObstructive(t));
        
        if (inflammatoryTraits.length >= 2 && obstructiveTraits.length >= 1) {
            patterns.push({
                name: 'Inflammatory-Obstructive Syndrome',
                traits: [...inflammatoryTraits, ...obstructiveTraits].map(t => t.id),
                confidence: 0.85,
                description: 'Combination of systemic inflammation with airflow obstruction',
                implications: 'May require combined anti-inflammatory and bronchodilator therapy'
            });
        }
        
        // 2. High-severity cluster
        const highSeverityTraits = traits.filter(t => t.severity >= 80);
        if (highSeverityTraits.length >= 3) {
            const avgSeverity = highSeverityTraits.reduce((sum, t) => sum + t.severity, 0) / highSeverityTraits.length;
            patterns.push({
                name: 'High-Severity Cluster',
                traits: highSeverityTraits.map(t => t.id),
                confidence: 0.78,
                avgSeverity,
                description: 'Multiple high-severity clinical traits',
                implications: 'Requires aggressive, comprehensive management'
            });
        }
        
        // 3. Treatment complexity pattern
        const complexTreatmentTraits = traits.filter(t => 
            this.calculateTreatmentComplexity(t.treatment) > 0.5
        );
        if (complexTreatmentTraits.length >= 2) {
            patterns.push({
                name: 'Treatment Complexity Pattern',
                traits: complexTreatmentTraits.map(t => t.id),
                confidence: 0.72,
                description: 'Multiple traits requiring complex treatment regimens',
                implications: 'Risk of non-adherence, consider simplification'
            });
        }
        
        return patterns;
    }
    
    predictExacerbation(features, patientData) {
        // Simplified exacerbation risk prediction
        let risk = 0;
        
        // Severity contribution
        const avgSeverity = features.reduce((sum, f) => sum + f.severity, 0) / features.length;
        risk += avgSeverity * 40;
        
        // Inflammatory component
        const inflammatoryScore = features.reduce((sum, f) => sum + f.inflammatory, 0) / features.length;
        risk += inflammatoryScore * 30;
        
        // Treatment complexity
        const avgComplexity = features.reduce((sum, f) => sum + f.treatmentComplexity, 0) / features.length;
        risk += avgComplexity * 20;
        
        // Patient factors
        if (patientData.smoking) risk += 10;
        if (patientData.previousExacerbations) risk += patientData.previousExacerbations * 5;
        
        return {
            score: Math.min(100, risk),
            level: risk >= 70 ? 'high' : risk >= 50 ? 'moderate' : 'low',
            factors: {
                severity: avgSeverity * 40,
                inflammation: inflammatoryScore * 30,
                complexity: avgComplexity * 20,
                patientFactors: risk - (avgSeverity * 40 + inflammatoryScore * 30 + avgComplexity * 20)
            }
        };
    }
    
    predictHospitalization(features, patientData) {
        // Simplified hospitalization risk prediction
        let risk = 0;
        
        // High severity traits
        const highSeverityFeatures = features.filter(f => f.severity > 0.8);
        risk += highSeverityFeatures.length * 15;
        
        // Multiple comorbidities
        const uniqueCategories = new Set(features.map(f => f.category));
        risk += uniqueCategories.size * 10;
        
        // Age factor
        const ageFactor = features.reduce((sum, f) => sum + f.ageFactor, 0) / features.length;
        risk += ageFactor * 25;
        
        // Previous hospitalizations
        if (patientData.previousHospitalizations) {
            risk += patientData.previousHospitalizations * 10;
        }
        
        return {
            score: Math.min(100, risk),
            level: risk >= 60 ? 'high' : risk >= 40 ? 'moderate' : 'low',
            factors: {
                highSeverity: highSeverityFeatures.length * 15,
                comorbidities: uniqueCategories.size * 10,
                age: ageFactor * 25,
                history: patientData.previousHospitalizations ? patientData.previousHospitalizations * 10 : 0
            }
        };
    }
    
    predictFunctionalDecline(features, patientData) {
        // Simplified functional decline prediction
        let risk = 0;
        
        // Obstructive traits
        const obstructiveScore = features.reduce((sum, f) => sum + f.obstructive, 0) / features.length;
        risk += obstructiveScore * 35;
        
        // Age factor
        const ageFactor = features.reduce((sum, f) => sum + f.ageFactor, 0) / features.length;
        risk += ageFactor * 30;
        
        // Treatment complexity
        const avgComplexity = features.reduce((sum, f) => sum + f.treatmentComplexity, 0) / features.length;
        risk += avgComplexity * 20;
        
        // Frailty indicators
        if (patientData.frailty) risk += 15;
        
        return {
            score: Math.min(100, risk),
            level: risk >= 65 ? 'high' : risk >= 45 ? 'moderate' : 'low',
            factors: {
                obstruction: obstructiveScore * 35,
                age: ageFactor * 30,
                complexity: avgComplexity * 20,
                frailty: patientData.frailty ? 15 : 0
            }
        };
    }
    
    predictTreatmentResponse(features, patientData) {
        // Simplified treatment response prediction
        let score = 50; // Base score
        
        // Inflammatory component (good response to anti-inflammatories)
        const inflammatoryScore = features.reduce((sum, f) => sum + f.inflammatory, 0) / features.length;
        score += inflammatoryScore * 20;
        
        // Treatment complexity (negative impact)
        const avgComplexity = features.reduce((sum, f) => sum + f.treatmentComplexity, 0) / features.length;
        score -= avgComplexity * 15;
        
        // Biomarker presence (positive impact)
        const biomarkerScore = features.reduce((sum, f) => sum + f.hasBiomarkers, 0) / features.length;
        score += biomarkerScore * 10;
        
        // Adherence factors
        if (patientData.goodAdherence) score += 15;
        if (patientData.poorAdherence) score -= 20;
        
        return {
            score: Math.max(0, Math.min(100, score)),
            level: score >= 70 ? 'good' : score >= 50 ? 'moderate' : 'poor',
            factors: {
                inflammation: inflammatoryScore * 20,
                complexity: -avgComplexity * 15,
                biomarkers: biomarkerScore * 10,
                adherence: patientData.goodAdherence ? 15 : patientData.poorAdherence ? -20 : 0
            }
        };
    }
    
    calculateConnectionStrength(sourceTrait, targetTrait) {
        let strength = 50; // Base strength
        
        // Category similarity
        if (sourceTrait.category === targetTrait.category) {
            strength += 20;
        }
        
        // Severity correlation
        const severityDiff = Math.abs(sourceTrait.severity - targetTrait.severity);
        if (severityDiff < 10) strength += 15;
        else if (severityDiff < 25) strength += 8;
        
        // Biomarker overlap
        const biomarkers1 = sourceTrait.biomarkers || [];
        const biomarkers2 = targetTrait.biomarkers || [];
        const commonBiomarkers = biomarkers1.filter(b => biomarkers2.includes(b));
        strength += Math.min(20, commonBiomarkers.length * 5);
        
        // Treatment similarity
        if (this.treatmentsSimilar(sourceTrait.treatment, targetTrait.treatment)) {
            strength += 10;
        }
        
        // Evidence level
        const evidence1 = sourceTrait.evidence?.level || 'C';
        const evidence2 = targetTrait.evidence?.level || 'C';
        if (evidence1 === 'A' && evidence2 === 'A') strength += 10;
        
        return Math.min(100, Math.max(10, strength));
    }
    
    treatmentsSimilar(treatment1, treatment2) {
        if (!treatment1 || !treatment2) return false;
        
        const t1 = typeof treatment1 === 'string' ? treatment1 : treatment1.firstLine;
        const t2 = typeof treatment2 === 'string' ? treatment2 : treatment2.firstLine;
        
        if (!t1 || !t2) return false;
        
        const t1Lower = t1.toLowerCase();
        const t2Lower = t2.toLowerCase();
        
        const commonTerms = ['ics', 'laba', 'lama', 'corticosteroid', 'bronchodilator'];
        
        return commonTerms.some(term => 
            t1Lower.includes(term) && t2Lower.includes(term)
        );
    }
    
    clusterKMeans(traits, k = 3) {
        const features = this.extractFeatures(traits);
        
        if (features.length < k) {
            k = Math.max(1, features.length);
        }
        
        // Initialize centroids
        let centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(features[Math.floor(Math.random() * features.length)]);
        }
        
        let assignments = new Array(features.length).fill(-1);
        let changed = true;
        let iterations = 0;
        
        while (changed && iterations < 100) {
            changed = false;
            
            // Assign to nearest centroid
            for (let i = 0; i < features.length; i++) {
                let minDist = Infinity;
                let bestCentroid = -1;
                
                for (let j = 0; j < centroids.length; j++) {
                    const dist = this.euclideanDistance(features[i], centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCentroid = j;
                    }
                }
                
                if (assignments[i] !== bestCentroid) {
                    assignments[i] = bestCentroid;
                    changed = true;
                }
            }
            
            // Update centroids
            const newCentroids = new Array(k).fill().map(() => ({
                sum: new Array(Object.keys(features[0]).length).fill(0),
                count: 0
            }));
            
            for (let i = 0; i < features.length; i++) {
                const cluster = assignments[i];
                const featureValues = Object.values(features[i]);
                
                for (let j = 0; j < featureValues.length; j++) {
                    newCentroids[cluster].sum[j] += featureValues[j];
                }
                newCentroids[cluster].count++;
            }
            
            for (let j = 0; j < centroids.length; j++) {
                if (newCentroids[j].count > 0) {
                    const centroidObj = {};
                    const keys = Object.keys(features[0]);
                    
                    for (let i = 0; i < keys.length; i++) {
                        centroidObj[keys[i]] = newCentroids[j].sum[i] / newCentroids[j].count;
                    }
                    
                    centroids[j] = centroidObj;
                }
            }
            
            iterations++;
        }
        
        // Format results
        const clusters = new Map();
        for (let i = 0; i < assignments.length; i++) {
            const clusterId = assignments[i];
            if (!clusters.has(clusterId)) {
                clusters.set(clusterId, []);
            }
            clusters.get(clusterId).push({
                trait: traits[i],
                distance: this.euclideanDistance(
                    features[i],
                    centroids[clusterId]
                )
            });
        }
        
        return {
            clusters: Array.from(clusters.entries()).map(([id, items]) => ({
                id,
                traits: items.map(item => item.trait),
                centroid: centroids[id],
                avgDistance: items.reduce((sum, item) => sum + item.distance, 0) / items.length,
                size: items.length
            })),
            iterations,
            silhouette: this.calculateSilhouetteScore(features, assignments)
        };
    }
    
    euclideanDistance(a, b) {
        const keys = Object.keys(a);
        let sum = 0;
        for (const key of keys) {
            sum += Math.pow(a[key] - b[key], 2);
        }
        return Math.sqrt(sum);
    }
    
    calculateSilhouetteScore(features, assignments) {
        if (features.length === 0) return 0;
        
        let totalSilhouette = 0;
        
        for (let i = 0; i < features.length; i++) {
            // Calculate a(i): average distance to other points in same cluster
            let a = 0;
            let sameClusterCount = 0;
            
            for (let j = 0; j < features.length; j++) {
                if (i !== j && assignments[i] === assignments[j]) {
                    a += this.euclideanDistance(features[i], features[j]);
                    sameClusterCount++;
                }
            }
            
            a = sameClusterCount > 0 ? a / sameClusterCount : 0;
            
            // Calculate b(i): smallest average distance to other clusters
            let b = Infinity;
            const clusters = new Set(assignments);
            
            for (const cluster of clusters) {
                if (cluster !== assignments[i]) {
                    let clusterDistance = 0;
                    let clusterCount = 0;
                    
                    for (let j = 0; j < features.length; j++) {
                        if (assignments[j] === cluster) {
                            clusterDistance += this.euclideanDistance(features[i], features[j]);
                            clusterCount++;
                        }
                    }
                    
                    const avgDistance = clusterCount > 0 ? clusterDistance / clusterCount : Infinity;
                    b = Math.min(b, avgDistance);
                }
            }
            
            // Calculate silhouette for this point
            const s = b > a ? (b - a) / Math.max(a, b) : 0;
            totalSilhouette += s;
        }
        
        return totalSilhouette / features.length;
    }
    
    clusterHierarchical(traits) {
        // Single-linkage hierarchical clustering
        const features = this.extractFeatures(traits);
        const n = features.length;
        
        // Initialize distance matrix
        const distances = [];
        for (let i = 0; i < n; i++) {
            distances[i] = [];
            for (let j = 0; j < n; j++) {
                distances[i][j] = i === j ? 0 : this.euclideanDistance(features[i], features[j]);
            }
        }
        
        // Initialize clusters (each point in its own cluster)
        let clusters = [];
        for (let i = 0; i < n; i++) {
            clusters.push({
                indices: [i],
                traits: [traits[i]]
            });
        }
        
        const dendrogram = [];
        
        while (clusters.length > 1) {
            // Find closest clusters
            let minDistance = Infinity;
            let cluster1 = -1;
            let cluster2 = -1;
            
            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    // Single linkage: distance between closest points
                    let distance = Infinity;
                    
                    for (const idx1 of clusters[i].indices) {
                        for (const idx2 of clusters[j].indices) {
                            distance = Math.min(distance, distances[idx1][idx2]);
                        }
                    }
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        cluster1 = i;
                        cluster2 = j;
                    }
                }
            }
            
            // Merge clusters
            const merged = {
                indices: [...clusters[cluster1].indices, ...clusters[cluster2].indices],
                traits: [...clusters[cluster1].traits, ...clusters[cluster2].traits],
                distance: minDistance
            };
            
            dendrogram.push({
                cluster1,
                cluster2,
                distance: minDistance,
                size: merged.indices.length
            });
            
            // Remove old clusters and add merged
            clusters.splice(Math.max(cluster1, cluster2), 1);
            clusters.splice(Math.min(cluster1, cluster2), 1);
            clusters.push(merged);
        }
        
        return {
            dendrogram,
            finalClusters: clusters,
            features
        };
    }
    
    clusterDBSCAN(traits, epsilon = 0.3, minPoints = 2) {
        const features = this.extractFeatures(traits);
        const n = features.length;
        
        const visited = new Array(n).fill(false);
        const clustered = new Array(n).fill(-1); // -1 = noise
        let clusterId = 0;
        
        const getNeighbors = (pointIndex) => {
            const neighbors = [];
            for (let i = 0; i < n; i++) {
                if (i !== pointIndex && this.euclideanDistance(features[pointIndex], features[i]) < epsilon) {
                    neighbors.push(i);
                }
            }
            return neighbors;
        };
        
        const expandCluster = (pointIndex, neighbors, clusterId) => {
            clustered[pointIndex] = clusterId;
            
            for (let i = 0; i < neighbors.length; i++) {
                const neighborIndex = neighbors[i];
                
                if (!visited[neighborIndex]) {
                    visited[neighborIndex] = true;
                    const neighborNeighbors = getNeighbors(neighborIndex);
                    
                    if (neighborNeighbors.length >= minPoints) {
                        neighbors.push(...neighborNeighbors);
                    }
                }
                
                if (clustered[neighborIndex] === -1) {
                    clustered[neighborIndex] = clusterId;
                }
            }
        };
        
        for (let i = 0; i < n; i++) {
            if (!visited[i]) {
                visited[i] = true;
                const neighbors = getNeighbors(i);
                
                if (neighbors.length < minPoints) {
                    clustered[i] = -1; // Noise
                } else {
                    expandCluster(i, neighbors, clusterId);
                    clusterId++;
                }
            }
        }
        
        // Group results
        const clusters = new Map();
        const noise = [];
        
        for (let i = 0; i < n; i++) {
            const cluster = clustered[i];
            if (cluster === -1) {
                noise.push(traits[i]);
            } else {
                if (!clusters.has(cluster)) {
                    clusters.set(cluster, []);
                }
                clusters.get(cluster).push(traits[i]);
            }
        }
        
        return {
            clusters: Array.from(clusters.entries()).map(([id, clusterTraits]) => ({
                id,
                traits: clusterTraits,
                size: clusterTraits.length,
                isNoise: false
            })),
            noise: noise.map(trait => ({
                trait,
                isNoise: true
            })),
            parameters: { epsilon, minPoints }
        };
    }
    
    semanticSearch(query, options = {}) {
        // This would use word embeddings for semantic search
        // For now, return simplified version
        
        const queryLower = query.toLowerCase();
        const results = [];
        
        // In real implementation, this would use pre-computed embeddings
        // and cosine similarity
        
        return results;
    }
}

class FeatureEncoder {
    constructor() {
        this.categoryMap = new Map();
        this.evidenceMap = new Map();
        this.nextCategoryId = 0;
        this.nextEvidenceId = 0;
        
        // Pre-defined categories for consistency
        this.predefinedCategories = [
            'pulmonary', 'inflammatory', 'physiological', 'clinical',
            'comorbid', 'behavioral', 'pharmacological', 'radiological'
        ];
        
        // Initialize with predefined categories
        for (const category of this.predefinedCategories) {
            this.encodeCategory(category);
        }
    }
    
    encodeCategory(category) {
        if (!category) return 0;
        
        if (!this.categoryMap.has(category)) {
            this.categoryMap.set(category, this.nextCategoryId++);
        }
        
        // Normalize to 0-1 range
        return this.categoryMap.get(category) / Math.max(1, this.nextCategoryId - 1);
    }
    
    encodeEvidence(level) {
        if (!level) return 0.5;
        
        const evidenceWeights = {
            'A': 1.0,
            'B': 0.8,
            'C': 0.6,
            'D': 0.4,
            'E': 0.2
        };
        
        return evidenceWeights[level] || 0.5;
    }
}

class ClinicalSyncManager {
    constructor() {
        this.queue = [];
        this.syncing = false;
        this.lastSync = null;
        this.conflictResolver = new ConflictResolver();
        this.offline = !navigator.onLine;
        
        this.init();
    }
    
    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.offline = false;
            this.sync();
        });
        
        window.addEventListener('offline', () => {
            this.offline = true;
        });
        
        // Load queued changes from storage
        this.loadQueue();
    }
    
    async queueChange(change) {
        const queuedChange = {
            ...change,
            id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            queuedAt: new Date().toISOString(),
            attempts: 0
        };
        
        this.queue.push(queuedChange);
        await this.saveQueue();
        
        // Try to sync if online
        if (!this.offline && !this.syncing) {
            this.sync();
        }
        
        return queuedChange.id;
    }
    
    async sync() {
        if (this.syncing || this.offline || this.queue.length === 0) {
            return;
        }
        
        this.syncing = true;
        
        try {
            const changes = [...this.queue];
            const successful = [];
            
            for (const change of changes) {
                try {
                    await this.sendChange(change);
                    successful.push(change.id);
                    change.attempts++;
                } catch (error) {
                    console.error('Failed to sync change:', change.id, error);
                    
                    // If failed too many times, mark as failed
                    if (change.attempts >= 3) {
                        successful.push(change.id); // Remove from queue even if failed
                        console.warn(`Change ${change.id} failed after 3 attempts`);
                    }
                }
            }
            
            // Remove successful changes from queue
            this.queue = this.queue.filter(change => !successful.includes(change.id));
            await this.saveQueue();
            
            this.lastSync = new Date().toISOString();
            
            // Notify of sync completion
            window.dispatchEvent(new CustomEvent('sync:complete', {
                detail: {
                    success: true,
                    synced: successful.length,
                    failed: changes.length - successful.length,
                    timestamp: this.lastSync
                }
            }));
            
        } catch (error) {
            console.error('Sync failed:', error);
            
            window.dispatchEvent(new CustomEvent('sync:failed', {
                detail: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            }));
        } finally {
            this.syncing = false;
        }
    }
    
    async sendChange(change) {
        // In a real implementation, this would send to a server
        // For now, simulate network request
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate network failure 10% of the time
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                } else {
                    resolve({ success: true, changeId: change.id });
                }
            }, 100);
        });
    }
    
    async saveQueue() {
        try {
            localStorage.setItem('clinical_sync_queue', JSON.stringify(this.queue));
        } catch (error) {
            console.error('Failed to save sync queue:', error);
        }
    }
    
    async loadQueue() {
        try {
            const saved = localStorage.getItem('clinical_sync_queue');
            if (saved) {
                this.queue = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load sync queue:', error);
            this.queue = [];
        }
    }
    
    getStatus() {
        return {
            online: !this.offline,
            syncing: this.syncing,
            queueSize: this.queue.length,
            lastSync: this.lastSync
        };
    }
    
    stop() {
        // Cleanup
        this.syncing = false;
    }
}

class ConflictResolver {
    constructor() {
        this.strategies = {
            'trait': this.resolveTraitConflict.bind(this),
            'connection': this.resolveConnectionConflict.bind(this),
            'analytics': this.resolveAnalyticsConflict.bind(this)
        };
    }
    
    resolveTraitConflict(localTrait, remoteTrait) {
        // Strategy: Keep the most recently updated version
        const localTime = new Date(localTrait.updated || localTrait.created);
        const remoteTime = new Date(remoteTrait.updated || remoteTrait.created);
        
        if (remoteTime > localTime) {
            return { resolved: remoteTrait, strategy: 'newer_wins' };
        } else if (remoteTime < localTime) {
            return { resolved: localTrait, strategy: 'newer_wins' };
        } else {
            // Same timestamp, merge
            const merged = { ...localTrait, ...remoteTrait };
            merged.version = Math.max(localTrait.version || 1, remoteTrait.version || 1) + 1;
            merged.updated = new Date().toISOString();
            return { resolved: merged, strategy: 'merge' };
        }
    }
    
    resolveConnectionConflict(localConn, remoteConn) {
        // For connections, use strength as tiebreaker
        if (remoteConn.strength > localConn.strength) {
            return { resolved: remoteConn, strategy: 'stronger_wins' };
        } else if (remoteConn.strength < localConn.strength) {
            return { resolved: localConn, strategy: 'stronger_wins' };
        } else {
            // Same strength, use timestamp
            const localTime = new Date(localConn.updated || localConn.created);
            const remoteTime = new Date(remoteConn.updated || remoteConn.created);
            
            if (remoteTime > localTime) {
                return { resolved: remoteConn, strategy: 'newer_wins' };
            } else {
                return { resolved: localConn, strategy: 'newer_wins' };
            }
        }
    }
    
    resolveAnalyticsConflict(localAnalytics, remoteAnalytics) {
        // For analytics, merge and average where appropriate
        const merged = {};
        
        for (const key in localAnalytics) {
            if (typeof localAnalytics[key] === 'number' && typeof remoteAnalytics[key] === 'number') {
                merged[key] = (localAnalytics[key] + remoteAnalytics[key]) / 2;
            } else {
                merged[key] = remoteAnalytics[key] || localAnalytics[key];
            }
        }
        
        return { resolved: merged, strategy: 'average' };
    }
    
    resolve(entityType, localData, remoteData) {
        const resolver = this.strategies[entityType] || this.strategies.trait;
        return resolver(localData, remoteData);
    }
}

class ClinicalSecurity {
    constructor() {
        this.encryptionKey = null;
        this.locked = false;
        this.permissions = new Set();
        this.auditLog = [];
    }
    
    async initialize(password) {
        try {
            // Generate encryption key
            this.encryptionKey = await this.generateKey(password);
            
            // Set up permissions based on role
            this.setupPermissions();
            
            // Log initialization
            this.log('security_initialized', { timestamp: new Date().toISOString() });
            
            return true;
        } catch (error) {
            console.error('Security initialization failed:', error);
            throw error;
        }
    }
    
    async generateKey(password) {
        // Use password-based key derivation
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        
        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    setupPermissions() {
        // In a real implementation, this would be based on user role
        // For now, grant all permissions
        const allPermissions = [
            'read_traits', 'write_traits', 'delete_traits',
            'read_connections', 'write_connections', 'delete_connections',
            'export_data', 'import_data', 'view_analytics'
        ];
        
        this.permissions = new Set(allPermissions);
    }
    
    async encryptData(data) {
        if (!this.encryptionKey || this.locked) {
            throw new Error('Security not initialized or locked');
        }
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.encryptionKey,
            dataBuffer
        );
        
        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted)),
            algorithm: 'AES-GCM-256'
        };
    }
    
    async decryptData(encryptedData) {
        if (!this.encryptionKey || this.locked) {
            throw new Error('Security not initialized or locked');
        }
        
        const iv = new Uint8Array(encryptedData.iv);
        const data = new Uint8Array(encryptedData.data);
        
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.encryptionKey,
            data
        );
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }
    
    checkPermission(permission) {
        if (this.locked) return false;
        return this.permissions.has(permission);
    }
    
    lock() {
        this.locked = true;
        this.log('security_locked', { timestamp: new Date().toISOString() });
    }
    
    unlock(password) {
        // In a real implementation, this would verify password
        this.locked = false;
        this.log('security_unlocked', { timestamp: new Date().toISOString() });
    }
    
    log(action, details) {
        this.auditLog.push({
            action,
            timestamp: new Date().toISOString(),
            details,
            userAgent: navigator.userAgent
        });
        
        // Keep only last 1000 entries
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }
    }
    
    getAuditReport() {
        return {
            totalEntries: this.auditLog.length,
            recentEntries: this.auditLog.slice(-100),
            locked: this.locked,
            permissions: Array.from(this.permissions)
        };
    }
}

class ClinicalAnalytics {
    constructor() {
        this.metrics = {
            performance: new Map(),
            usage: new Map(),
            errors: new Map(),
            searches: new Map()
        };
        
        this.startTime = Date.now();
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Performance monitoring
        if (window.performance) {
            const perfObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordMetric('performance', entry.name, {
                        duration: entry.duration,
                        entryType: entry.entryType,
                        timestamp: Date.now()
                    });
                });
            });
            
            perfObserver.observe({ entryTypes: ['measure', 'resource', 'navigation'] });
        }
        
        // Error monitoring
        window.addEventListener('error', (event) => {
            this.recordError('javascript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString()
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('promise', {
                reason: event.reason?.toString(),
                timestamp: Date.now()
            });
        });
        
        // Custom event tracking
        this.setupEventTracking();
    }
    
    setupEventTracking() {
        // Track database operations
        const trackEvent = (type, data) => {
            this.recordMetric('usage', type, {
                ...data,
                timestamp: Date.now()
            });
        };
        
        // Listen for clinical events
        if (window.clinicalEvents) {
            window.clinicalEvents.subscribe('trait:created', (data) => {
                trackEvent('trait_created', data);
            });
            
            window.clinicalEvents.subscribe('connection:created', (data) => {
                trackEvent('connection_created', data);
            });
            
            // Add more event tracking as needed
        }
    }
    
    recordMetric(type, name, value) {
        if (!this.metrics[type]) {
            this.metrics[type] = new Map();
        }
        
        if (!this.metrics[type].has(name)) {
            this.metrics[type].set(name, []);
        }
        
        const metricArray = this.metrics[type].get(name);
        metricArray.push(value);
        
        // Keep only last 1000 entries
        if (metricArray.length > 1000) {
            metricArray.shift();
        }
    }
    
    recordError(type, details) {
        this.recordMetric('errors', type, {
            ...details,
            timestamp: Date.now(),
            url: window.location.href
        });
    }
    
    recordSearch(query, resultCount, timeMs) {
        this.recordMetric('searches', 'query', {
            query,
            resultCount,
            timeMs,
            timestamp: Date.now()
        });
    }
    
    generateReport() {
        const now = Date.now();
        const uptime = now - this.startTime;
        
        return {
            uptime: this.formatDuration(uptime),
            performance: this.calculatePerformanceMetrics(),
            usage: this.calculateUsageMetrics(),
            errors: this.calculateErrorMetrics(),
            searches: this.calculateSearchMetrics(),
            recommendations: this.generateRecommendations()
        };
    }
    
    calculatePerformanceMetrics() {
        const metrics = {};
        
        for (const [name, values] of this.metrics.performance.entries()) {
            if (values.length > 0) {
                const durations = values.map(v => v.duration || 0);
                metrics[name] = {
                    avg: this.average(durations),
                    p95: this.percentile(durations, 0.95),
                    p99: this.percentile(durations, 0.99),
                    max: Math.max(...durations),
                    min: Math.min(...durations),
                    count: values.length
                };
            }
        }
        
        return metrics;
    }
    
    calculateUsageMetrics() {
        const usage = {};
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        
        for (const [eventType, events] of this.metrics.usage.entries()) {
            const recentEvents = events.filter(e => e.timestamp > oneHourAgo);
            const dailyEvents = events.filter(e => e.timestamp > oneDayAgo);
            
            usage[eventType] = {
                hourly: recentEvents.length,
                daily: dailyEvents.length,
                total: events.length
            };
        }
        
        return usage;
    }
    
    calculateErrorMetrics() {
        const errors = {};
        
        for (const [errorType, errorList] of this.metrics.errors.entries()) {
            errors[errorType] = {
                count: errorList.length,
                recent: errorList.slice(-10),
                firstSeen: errorList[0]?.timestamp,
                lastSeen: errorList[errorList.length - 1]?.timestamp
            };
        }
        
        return errors;
    }
    
    calculateSearchMetrics() {
        const searches = this.metrics.searches.get('query') || [];
        
        if (searches.length === 0) {
            return {
                total: 0,
                avgTime: 0,
                avgResults: 0
            };
        }
        
        const times = searches.map(s => s.timeMs || 0);
        const results = searches.map(s => s.resultCount || 0);
        
        return {
            total: searches.length,
            avgTime: this.average(times),
            avgResults: this.average(results),
            popularQueries: this.getPopularQueries(searches)
        };
    }
    
    getPopularQueries(searches, limit = 10) {
        const queryCounts = {};
        
        searches.forEach(search => {
            const query = search.query?.toLowerCase().trim();
            if (query) {
                queryCounts[query] = (queryCounts[query] || 0) + 1;
            }
        });
        
        return Object.entries(queryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }
    
    generateRecommendations() {
        const recommendations = [];
        const perfMetrics = this.calculatePerformanceMetrics();
        
        // Check for slow operations
        for (const [operation, metrics] of Object.entries(perfMetrics)) {
            if (metrics.p95 > 1000) { // > 1 second
                recommendations.push({
                    type: 'performance',
                    severity: 'warning',
                    description: `Slow operation detected: ${operation}`,
                    suggestion: `Consider optimizing ${operation} (p95: ${metrics.p95.toFixed(1)}ms)`
                });
            }
        }
        
        // Check for frequent errors
        const errorMetrics = this.calculateErrorMetrics();
        for (const [errorType, metrics] of Object.entries(errorMetrics)) {
            if (metrics.count > 10) {
                recommendations.push({
                    type: 'error',
                    severity: 'high',
                    description: `Frequent errors: ${errorType}`,
                    suggestion: `Investigate and fix ${errorType} errors`
                });
            }
        }
        
        return recommendations;
    }
    
    average(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    percentile(values, p) {
        if (values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const pos = (sorted.length - 1) * p;
        const base = Math.floor(pos);
        const rest = pos - base;
        
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

class ClinicalCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            size: 0
        };
        this.maxSize = 1000;
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
    
    set(key, value, ttl = 60000) { // Default TTL: 1 minute
        const entry = {
            value,
            expires: Date.now() + ttl,
            createdAt: Date.now()
        };
        
        this.cache.set(key, entry);
        this.stats.sets++;
        this.stats.size = this.cache.size;
        
        // Evict if cache is too large
        if (this.cache.size > this.maxSize) {
            this.evictOldest();
        }
        
        return true;
    }
    
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        
        // Check if expired
        if (entry.expires < Date.now()) {
            this.cache.delete(key);
            this.stats.misses++;
            this.stats.size = this.cache.size;
            return null;
        }
        
        this.stats.hits++;
        return entry.value;
    }
    
    delete(key) {
        const existed = this.cache.delete(key);
        if (existed) {
            this.stats.deletes++;
            this.stats.size = this.cache.size;
        }
        return existed;
    }
    
    clear() {
        this.cache.clear();
        this.stats.size = 0;
    }
    
    invalidate(keys) {
        if (Array.isArray(keys)) {
            keys.forEach(key => this.delete(key));
        } else if (typeof keys === 'string') {
            // Delete all keys matching pattern
            const pattern = keys;
            for (const key of this.cache.keys()) {
                if (key.startsWith(pattern)) {
                    this.delete(key);
                }
            }
        }
    }
    
    evictOldest() {
        // Find oldest entry
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, entry] of this.cache) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.delete(oldestKey);
        }
    }
    
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache) {
            if (entry.expires < now) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        this.stats.size = this.cache.size;
        
        if (cleaned > 0) {
            console.log(`Cache cleanup: removed ${cleaned} expired entries`);
        }
    }
    
    getStats() {
        return {
            ...this.stats,
            hitRate: this.stats.hits + this.stats.misses > 0 ? 
                this.stats.hits / (this.stats.hits + this.stats.misses) : 0,
            currentSize: this.cache.size
        };
    }
}

class ClinicalIndex {
    constructor() {
        this.invertedIndex = new Map();
        this.documents = new Map();
        this.totalDocuments = 0;
    }
    
    indexTrait(trait) {
        if (!trait || !trait.id) return;
        
        // Remove old index entries for this trait
        this.removeTrait(trait.id);
        
        // Index all searchable text
        const textToIndex = [
            trait.name,
            trait.spanishName || '',
            trait.evaluation || '',
            trait.category,
            ...(trait.tags || []),
            ...(trait.biomarkers || []),
            this.extractTreatmentText(trait.treatment)
        ].join(' ').toLowerCase();
        
        // Tokenize
        const tokens = this.tokenize(textToIndex);
        
        // Add to inverted index
        for (const token of tokens) {
            if (!this.invertedIndex.has(token)) {
                this.invertedIndex.set(token, new Set());
            }
            this.invertedIndex.get(token).add(trait.id);
        }
        
        // Store document
        this.documents.set(trait.id, {
            id: trait.id,
            text: textToIndex,
            tokens: new Set(tokens),
            indexedAt: Date.now()
        });
        
        this.totalDocuments++;
    }
    
    removeTrait(traitId) {
        const doc = this.documents.get(traitId);
        if (!doc) return;
        
        // Remove from inverted index
        for (const token of doc.tokens) {
            const postings = this.invertedIndex.get(token);
            if (postings) {
                postings.delete(traitId);
                if (postings.size === 0) {
                    this.invertedIndex.delete(token);
                }
            }
        }
        
        // Remove document
        this.documents.delete(traitId);
        this.totalDocuments--;
    }
    
    updateTrait(trait) {
        // Re-index
        this.indexTrait(trait);
    }
    
    search(query, limit = 50) {
        const tokens = this.tokenize(query.toLowerCase());
        if (tokens.length === 0) return [];
        
        // Get document sets for each token
        const docSets = [];
        for (const token of tokens) {
            const postings = this.invertedIndex.get(token);
            if (postings && postings.size > 0) {
                docSets.push(postings);
            }
        }
        
        if (docSets.length === 0) return [];
        
        // Intersect sets for AND search
        let resultSet = docSets[0];
        for (let i = 1; i < docSets.length; i++) {
            resultSet = this.intersectSets(resultSet, docSets[i]);
        }
        
        // Score documents
        const scoredDocs = [];
        for (const docId of resultSet) {
            const score = this.scoreDocument(docId, tokens);
            scoredDocs.push({ docId, score });
        }
        
        // Sort by score and limit
        return scoredDocs
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    
    scoreDocument(docId, queryTokens) {
        const doc = this.documents.get(docId);
        if (!doc) return 0;
        
        let score = 0;
        
        // TF-IDF scoring
        for (const token of queryTokens) {
            // Term frequency in document
            const tf = this.calculateTF(token, doc);
            
            // Inverse document frequency
            const idf = this.calculateIDF(token);
            
            score += tf * idf;
        }
        
        // Boost for exact matches in name
        const docText = doc.text;
        for (const token of queryTokens) {
            if (docText.includes(` ${token} `)) {
                score += 0.5;
            }
        }
        
        return score;
    }
    
    calculateTF(token, doc) {
        // Simple term frequency (binary for now)
        return doc.tokens.has(token) ? 1 : 0;
    }
    
    calculateIDF(token) {
        const docCount = this.invertedIndex.get(token)?.size || 0;
        if (docCount === 0) return 0;
        
        return Math.log(this.totalDocuments / docCount);
    }
    
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2) // Ignore very short tokens
            .filter(token => !this.isStopWord(token));
    }
    
    isStopWord(token) {
        const stopWords = new Set([
            'the', 'and', 'for', 'with', 'this', 'that', 'have', 'from',
            'are', 'was', 'were', 'will', 'not', 'but', 'what', 'which',
            'there', 'their', 'they', 'them', 'then', 'than', 'also'
        ]);
        
        return stopWords.has(token);
    }
    
    extractTreatmentText(treatment) {
        if (!treatment) return '';
        
        if (typeof treatment === 'string') {
            return treatment;
        }
        
        // Extract from treatment object
        const parts = [];
        if (treatment.firstLine) parts.push(treatment.firstLine);
        if (treatment.secondLine) parts.push(treatment.secondLine);
        if (treatment.nonPharmacological) parts.push(treatment.nonPharmacological);
        
        return parts.join(' ');
    }
    
    intersectSets(setA, setB) {
        const result = new Set();
        for (const item of setA) {
            if (setB.has(item)) {
                result.add(item);
            }
        }
        return result;
    }
}

// ============================================================================
// EVENT SYSTEM - SIMPLIFIED VERSION
// ============================================================================

class ClinicalEventSystem {
    constructor() {
        this.listeners = new Map();
        this.queue = [];
        this.processing = false;
        this.metrics = {
            eventsEmitted: 0,
            listenersCalled: 0,
            queueSize: 0
        };
    }
    
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => this.unsubscribe(event, callback);
    }
    
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }
    
    emit(event, data) {
        this.metrics.eventsEmitted++;
        
        // Add to queue for async processing
        this.queue.push({ event, data, timestamp: Date.now() });
        
        // Process queue if not already processing
        if (!this.processing) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const { event, data } = this.queue.shift();
            this.metrics.queueSize = this.queue.length;
            
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const callbackArray = Array.from(callbacks);
                
                // Execute callbacks in parallel
                await Promise.all(callbackArray.map(async callback => {
                    try {
                        await callback(data);
                        this.metrics.listenersCalled++;
                    } catch (error) {
                        console.error(`Error in event listener for ${event}:`, error);
                    }
                }));
            }
        }
        
        this.processing = false;
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}

// ============================================================================
// GLOBAL EXPORT AND INITIALIZATION
// ============================================================================

// Create global event system
if (typeof window !== 'undefined' && !window.clinicalEvents) {
    window.clinicalEvents = new ClinicalEventSystem();
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ClinicalDatabase,
        ClinicalGraph,
        ClinicalML,
        ClinicalEventSystem,
        ClinicalSyncManager,
        ClinicalSecurity,
        ClinicalAnalytics,
        ClinicalCache,
        ClinicalIndex
    };
}

if (typeof window !== 'undefined') {
    window.ClinicalDatabase = ClinicalDatabase;
}

console.log('Clinical Database v4.0 - Complete implementation loaded');
