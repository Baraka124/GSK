// ============================================================================
// CLINICAL GRAPH ENGINE v4.0 - COMPLETE NETWORK ARCHITECTURE
// ============================================================================

class ClinicalGraphEngine {
    constructor() {
        console.log('Initializing Clinical Graph Engine v4.0...');
        
        // Core graph data structures
        this.graph = new Graph();
        this.layout = new ForceDirectedLayout();
        this.communityDetector = new CommunityDetector();
        this.pathFinder = new PathFinder();
        this.centralityCalculator = new CentralityCalculator();
        this.patternDetector = new PatternDetector();
        
        // Cache and performance
        this.cache = new GraphCache();
        this.worker = new GraphWorker();
        this.batchProcessor = new BatchProcessor();
        
        // Visualization state
        this.visualization = {
            nodes: new Map(),
            edges: new Map(),
            selected: new Set(),
            highlighted: new Set(),
            clusters: new Map(),
            tree: null
        };
        
        // Configuration
        this.config = {
            layoutIterations: 100,
            repulsionStrength: 200,
            attractionStrength: 0.1,
            gravity: 0.01,
            maxDistance: 1000,
            minDistance: 10,
            clusterThreshold: 0.7,
            animationSpeed: 0.1,
            physicsEnabled: true,
            autoLayout: true
        };
        
        // Initialize
        this.setupEventListeners();
        this.startLayoutEngine();
    }
    
    // ============================================================================
    // GRAPH DATA STRUCTURES
    // ============================================================================
    
    class Graph {
        constructor() {
            this.nodes = new Map();           // nodeId -> Node
            this.edges = new Map();           // edgeId -> Edge
            this.adjacency = new Map();       // nodeId -> Set(neighborIds)
            this.invertedIndex = new Map();   // property -> Set(nodeIds)
            
            // Multi-graph support
            this.multiEdges = new Map();      // (source,target) -> Set(edgeIds)
            
            // Tree structure for hierarchical data
            this.tree = new Tree();
            
            // Metrics
            this.metrics = {
                density: 0,
                diameter: 0,
                avgDegree: 0,
                clusteringCoefficient: 0,
                lastCalculated: 0
            };
        }
        
        // Node operations
        addNode(node) {
            const nodeObj = this.createNode(node);
            this.nodes.set(node.id, nodeObj);
            this.adjacency.set(node.id, new Set());
            this.multiEdges.set(node.id, new Map());
            
            // Update inverted index
            this.indexNode(nodeObj);
            
            // Update tree
            if (node.parentId) {
                this.tree.addNode(node.id, node.parentId);
            } else {
                this.tree.addNode(node.id);
            }
            
            this.invalidateMetrics();
            return nodeObj;
        }
        
        createNode(data) {
            return {
                id: data.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                label: data.name || 'Unnamed',
                type: data.category || 'default',
                data: data,
                
                // Position and visual properties
                x: Math.random() * 800 - 400,
                y: Math.random() * 600 - 300,
                z: 0,
                size: this.calculateNodeSize(data),
                color: this.getNodeColor(data),
                
                // Network properties
                degree: 0,
                centrality: 0,
                betweenness: 0,
                closeness: 0,
                clusterId: -1,
                
                // State
                fixed: false,
                hidden: false,
                selected: false,
                highlighted: false,
                
                // Metadata
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: 1
            };
        }
        
        calculateNodeSize(nodeData) {
            // Size based on severity and connections
            const baseSize = 20;
            const severityFactor = (nodeData.severity || 50) / 100;
            const connectionFactor = Math.log2((nodeData.connections || 0) + 1);
            
            return baseSize + (severityFactor * 30) + (connectionFactor * 10);
        }
        
        getNodeColor(nodeData) {
            const colorMap = {
                'pulmonary': '#2d6ca2',
                'inflammatory': '#d64550',
                'physiological': '#81b29a',
                'clinical': '#c4906a',
                'comorbid': '#e39a9c',
                'behavioral': '#4a7c8c',
                'pharmacological': '#6a8d73',
                'radiological': '#7b6ba9',
                'default': '#9fa8c7'
            };
            
            return colorMap[nodeData.category] || colorMap.default;
        }
        
        indexNode(node) {
            // Index by category
            if (!this.invertedIndex.has('category')) {
                this.invertedIndex.set('category', new Map());
            }
            const categoryIndex = this.invertedIndex.get('category');
            if (!categoryIndex.has(node.data.category)) {
                categoryIndex.set(node.data.category, new Set());
            }
            categoryIndex.get(node.data.category).add(node.id);
            
            // Index by severity range
            if (!this.invertedIndex.has('severity')) {
                this.invertedIndex.set('severity', new Map());
            }
            const severityIndex = this.invertedIndex.get('severity');
            const severityRange = Math.floor((node.data.severity || 0) / 25) * 25;
            if (!severityIndex.has(severityRange)) {
                severityIndex.set(severityRange, new Set());
            }
            severityIndex.get(severityRange).add(node.id);
            
            // Index by tags/biomarkers
            const tags = node.data.tags || [];
            const biomarkers = node.data.biomarkers || [];
            
            for (const tag of [...tags, ...biomarkers]) {
                if (!this.invertedIndex.has(tag)) {
                    this.invertedIndex.set(tag, new Set());
                }
                this.invertedIndex.get(tag).add(node.id);
            }
        }
        
        // Edge operations
        addEdge(sourceId, targetId, data = {}) {
            if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
                throw new Error('Source or target node not found');
            }
            
            const edgeId = this.generateEdgeId(sourceId, targetId, data.type);
            const edge = this.createEdge(edgeId, sourceId, targetId, data);
            
            this.edges.set(edgeId, edge);
            
            // Update adjacency
            this.adjacency.get(sourceId).add(targetId);
            this.adjacency.get(targetId).add(sourceId);
            
            // Update multi-edges
            if (!this.multiEdges.get(sourceId).has(targetId)) {
                this.multiEdges.get(sourceId).set(targetId, new Set());
            }
            this.multiEdges.get(sourceId).get(targetId).add(edgeId);
            
            if (!this.multiEdges.get(targetId).has(sourceId)) {
                this.multiEdges.get(targetId).set(sourceId, new Set());
            }
            this.multiEdges.get(targetId).get(sourceId).add(edgeId);
            
            // Update node degrees
            this.nodes.get(sourceId).degree++;
            this.nodes.get(targetId).degree++;
            
            this.invalidateMetrics();
            return edge;
        }
        
        createEdge(id, sourceId, targetId, data) {
            const strength = data.strength || this.calculateEdgeStrength(
                this.nodes.get(sourceId).data,
                this.nodes.get(targetId).data
            );
            
            return {
                id,
                source: sourceId,
                target: targetId,
                label: data.label || '',
                type: data.type || 'association',
                data,
                
                // Visual properties
                strength,
                width: this.calculateEdgeWidth(strength),
                color: this.getEdgeColor(strength, data.type),
                dashes: data.conflicts ? [5, 5] : false,
                
                // Direction
                directed: data.directed || false,
                arrows: data.arrows || 'to',
                
                // State
                hidden: false,
                selected: false,
                highlighted: false,
                
                // Metadata
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: 1
            };
        }
        
        generateEdgeId(sourceId, targetId, type = '') {
            const sorted = [sourceId, targetId].sort();
            const baseId = `${sorted[0]}-${sorted[1]}`;
            
            if (type) {
                return `${baseId}-${type}`;
            }
            
            // For multiple edges between same nodes
            const existing = Array.from(this.edges.keys())
                .filter(id => id.startsWith(baseId))
                .length;
            
            return existing > 0 ? `${baseId}-${existing + 1}` : baseId;
        }
        
        calculateEdgeStrength(sourceData, targetData) {
            let strength = 50; // Base
            
            // Category similarity
            if (sourceData.category === targetData.category) strength += 20;
            
            // Severity correlation
            const severityDiff = Math.abs((sourceData.severity || 0) - (targetData.severity || 0));
            if (severityDiff < 10) strength += 15;
            else if (severityDiff < 25) strength += 8;
            
            // Biomarker overlap
            const biomarkers1 = sourceData.biomarkers || [];
            const biomarkers2 = targetData.biomarkers || [];
            const commonBiomarkers = biomarkers1.filter(b => biomarkers2.includes(b));
            strength += Math.min(20, commonBiomarkers.length * 5);
            
            // Treatment similarity
            if (this.treatmentsSimilar(sourceData.treatment, targetData.treatment)) {
                strength += 10;
            }
            
            return Math.min(100, Math.max(10, strength));
        }
        
        treatmentsSimilar(treatment1, treatment2) {
            if (!treatment1 || !treatment2) return false;
            
            const t1 = typeof treatment1 === 'string' ? treatment1 : treatment1.firstLine || '';
            const t2 = typeof treatment2 === 'string' ? treatment2 : treatment2.firstLine || '';
            
            const commonTerms = ['ics', 'laba', 'lama', 'corticosteroid', 'bronchodilator'];
            const t1Lower = t1.toLowerCase();
            const t2Lower = t2.toLowerCase();
            
            return commonTerms.some(term => 
                t1Lower.includes(term) && t2Lower.includes(term)
            );
        }
        
        calculateEdgeWidth(strength) {
            // Width from 1 to 5 based on strength
            return 1 + (strength / 100) * 4;
        }
        
        getEdgeColor(strength, type) {
            if (type === 'conflict') return '#d64550';
            if (type === 'enhancement') return '#81b29a';
            if (type === 'required') return '#f2cc8f';
            
            // Gradient from blue (weak) to red (strong)
            if (strength >= 80) return '#d64550'; // Red
            if (strength >= 65) return '#e07a5f'; // Orange
            if (strength >= 50) return '#f2cc8f'; // Yellow
            return '#2d6ca2'; // Blue
        }
        
        // Graph algorithms
        findShortestPath(startId, endId, algorithm = 'dijkstra') {
            switch (algorithm) {
                case 'dijkstra':
                    return this.dijkstra(startId, endId);
                case 'astar':
                    return this.aStar(startId, endId);
                case 'bfs':
                    return this.bfsShortestPath(startId, endId);
                default:
                    return this.dijkstra(startId, endId);
            }
        }
        
        dijkstra(startId, endId) {
            const distances = new Map();
            const previous = new Map();
            const unvisited = new Set();
            
            // Initialize
            for (const nodeId of this.nodes.keys()) {
                distances.set(nodeId, Infinity);
                previous.set(nodeId, null);
                unvisited.add(nodeId);
            }
            distances.set(startId, 0);
            
            while (unvisited.size > 0) {
                // Get node with smallest distance
                let current = null;
                let smallestDistance = Infinity;
                
                for (const nodeId of unvisited) {
                    if (distances.get(nodeId) < smallestDistance) {
                        smallestDistance = distances.get(nodeId);
                        current = nodeId;
                    }
                }
                
                if (current === null || current === endId) break;
                unvisited.delete(current);
                
                // Update distances to neighbors
                for (const neighbor of this.adjacency.get(current)) {
                    if (unvisited.has(neighbor)) {
                        // Weight based on inverse strength (stronger connection = shorter distance)
                        const edgeId = this.findEdgeId(current, neighbor);
                        const edge = this.edges.get(edgeId);
                        const weight = edge ? 100 - edge.strength : 50;
                        
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
                steps: path.length - 1,
                edges: this.getEdgesFromPath(path)
            };
        }
        
        aStar(startId, endId) {
            // Heuristic function (Euclidean distance between nodes)
            const heuristic = (nodeId1, nodeId2) => {
                const node1 = this.nodes.get(nodeId1);
                const node2 = this.nodes.get(nodeId2);
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                return Math.sqrt(dx * dx + dy * dy);
            };
            
            const openSet = new Set([startId]);
            const cameFrom = new Map();
            
            const gScore = new Map(); // Cost from start to node
            const fScore = new Map(); // Estimated total cost
            
            for (const nodeId of this.nodes.keys()) {
                gScore.set(nodeId, Infinity);
                fScore.set(nodeId, Infinity);
            }
            
            gScore.set(startId, 0);
            fScore.set(startId, heuristic(startId, endId));
            
            while (openSet.size > 0) {
                // Get node with lowest fScore
                let current = null;
                let lowestFScore = Infinity;
                
                for (const nodeId of openSet) {
                    if (fScore.get(nodeId) < lowestFScore) {
                        lowestFScore = fScore.get(nodeId);
                        current = nodeId;
                    }
                }
                
                if (current === endId) {
                    // Reconstruct path
                    const path = [current];
                    while (cameFrom.has(current)) {
                        current = cameFrom.get(current);
                        path.unshift(current);
                    }
                    
                    return {
                        path,
                        distance: gScore.get(endId),
                        steps: path.length - 1,
                        edges: this.getEdgesFromPath(path)
                    };
                }
                
                openSet.delete(current);
                
                for (const neighbor of this.adjacency.get(current)) {
                    // Edge weight
                    const edgeId = this.findEdgeId(current, neighbor);
                    const edge = this.edges.get(edgeId);
                    const weight = edge ? 100 - edge.strength : 50;
                    
                    const tentativeGScore = gScore.get(current) + weight;
                    
                    if (tentativeGScore < gScore.get(neighbor)) {
                        cameFrom.set(neighbor, current);
                        gScore.set(neighbor, tentativeGScore);
                        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, endId));
                        
                        if (!openSet.has(neighbor)) {
                            openSet.add(neighbor);
                        }
                    }
                }
            }
            
            return null; // No path found
        }
        
        bfsShortestPath(startId, endId) {
            const queue = [{ node: startId, path: [startId] }];
            const visited = new Set([startId]);
            
            while (queue.length > 0) {
                const { node, path } = queue.shift();
                
                if (node === endId) {
                    return {
                        path,
                        distance: path.length - 1,
                        steps: path.length - 1,
                        edges: this.getEdgesFromPath(path)
                    };
                }
                
                for (const neighbor of this.adjacency.get(node)) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push({
                            node: neighbor,
                            path: [...path, neighbor]
                        });
                    }
                }
            }
            
            return null; // No path found
        }
        
        findEdgeId(sourceId, targetId) {
            const edges = this.multiEdges.get(sourceId)?.get(targetId);
            if (edges && edges.size > 0) {
                return Array.from(edges)[0];
            }
            return null;
        }
        
        getEdgesFromPath(path) {
            const edges = [];
            for (let i = 0; i < path.length - 1; i++) {
                const edgeId = this.findEdgeId(path[i], path[i + 1]);
                if (edgeId) {
                    edges.push(this.edges.get(edgeId));
                }
            }
            return edges;
        }
        
        // Community detection
        detectCommunities(method = 'louvain') {
            switch (method) {
                case 'louvain':
                    return this.louvainCommunityDetection();
                case 'girvan_newman':
                    return this.girvanNewmanCommunityDetection();
                case 'label_propagation':
                    return this.labelPropagationCommunityDetection();
                case 'spectral':
                    return this.spectralClustering();
                default:
                    return this.louvainCommunityDetection();
            }
        }
        
        louvainCommunityDetection() {
            // Initialize each node in its own community
            const communities = new Map();
            let communityId = 0;
            
            for (const nodeId of this.nodes.keys()) {
                communities.set(nodeId, communityId++);
            }
            
            let improved = true;
            let iterations = 0;
            
            while (improved && iterations < 10) {
                improved = false;
                
                // Phase 1: Local moving of nodes
                const nodes = Array.from(this.nodes.keys());
                this.shuffleArray(nodes);
                
                for (const nodeId of nodes) {
                    const bestCommunity = this.findBestCommunityLouvain(nodeId, communities);
                    if (bestCommunity !== communities.get(nodeId)) {
                        communities.set(nodeId, bestCommunity);
                        improved = true;
                    }
                }
                
                // Phase 2: Aggregation
                if (improved) {
                    const aggregated = this.aggregateCommunities(communities);
                    // Re-run with aggregated graph
                    // (Simplified - in full implementation would rebuild graph)
                }
                
                iterations++;
            }
            
            // Update nodes with community assignments
            for (const [nodeId, community] of communities) {
                const node = this.nodes.get(nodeId);
                if (node) {
                    node.clusterId = community;
                }
            }
            
            return communities;
        }
        
        findBestCommunityLouvain(nodeId, communities) {
            const currentCommunity = communities.get(nodeId);
            let bestCommunity = currentCommunity;
            let bestModularityGain = 0;
            
            // Calculate modularity gain for each neighboring community
            const neighborCommunities = new Set();
            for (const neighbor of this.adjacency.get(nodeId)) {
                neighborCommunities.add(communities.get(neighbor));
            }
            
            for (const community of neighborCommunities) {
                if (community !== currentCommunity) {
                    const gain = this.calculateModularityGain(nodeId, currentCommunity, community, communities);
                    if (gain > bestModularityGain) {
                        bestModularityGain = gain;
                        bestCommunity = community;
                    }
                }
            }
            
            return bestModularityGain > 0 ? bestCommunity : currentCommunity;
        }
        
        calculateModularityGain(nodeId, oldCommunity, newCommunity, communities) {
            // Simplified modularity gain calculation
            const edgesInOld = this.countEdgesToCommunity(nodeId, oldCommunity, communities);
            const edgesInNew = this.countEdgesToCommunity(nodeId, newCommunity, communities);
            const degree = this.adjacency.get(nodeId).size;
            const totalEdges = this.edges.size;
            
            // ΔQ = [Σ_in + 2k_i,in / 2m - (Σ_tot + k_i / 2m)^2] - [Σ_in / 2m - (Σ_tot / 2m)^2 - (k_i / 2m)^2]
            // Simplified version:
            return (edgesInNew - edgesInOld) / (2 * totalEdges) - 
                   (degree * degree) / (4 * totalEdges * totalEdges);
        }
        
        countEdgesToCommunity(nodeId, community, communities) {
            let count = 0;
            for (const neighbor of this.adjacency.get(nodeId)) {
                if (communities.get(neighbor) === community) {
                    count++;
                }
            }
            return count;
        }
        
        aggregateCommunities(communities) {
            // Group nodes by community
            const communityGroups = new Map();
            for (const [nodeId, community] of communities) {
                if (!communityGroups.has(community)) {
                    communityGroups.set(community, []);
                }
                communityGroups.get(community).push(nodeId);
            }
            
            // Create aggregated graph
            const aggregated = {
                nodes: new Map(),
                edges: new Map(),
                adjacency: new Map()
            };
            
            // Add community nodes
            for (const [communityId, nodes] of communityGroups) {
                aggregated.nodes.set(communityId, {
                    id: communityId,
                    size: nodes.length,
                    internalEdges: this.countInternalEdges(nodes)
                });
                aggregated.adjacency.set(communityId, new Set());
            }
            
            // Add edges between communities
            for (const edge of this.edges.values()) {
                const sourceCommunity = communities.get(edge.source);
                const targetCommunity = communities.get(edge.target);
                
                if (sourceCommunity !== targetCommunity) {
                    const edgeId = `${sourceCommunity}-${targetCommunity}`;
                    
                    if (!aggregated.edges.has(edgeId)) {
                        aggregated.edges.set(edgeId, {
                            id: edgeId,
                            source: sourceCommunity,
                            target: targetCommunity,
                            weight: 0
                        });
                        aggregated.adjacency.get(sourceCommunity).add(targetCommunity);
                        aggregated.adjacency.get(targetCommunity).add(sourceCommunity);
                    }
                    
                    aggregated.edges.get(edgeId).weight += edge.strength;
                }
            }
            
            return aggregated;
        }
        
        countInternalEdges(nodes) {
            let count = 0;
            const nodeSet = new Set(nodes);
            
            for (const edge of this.edges.values()) {
                if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
                    count++;
                }
            }
            
            return count;
        }
        
        girvanNewmanCommunityDetection() {
            // Calculate edge betweenness
            const edgeBetweenness = this.calculateEdgeBetweenness();
            
            // Sort edges by betweenness
            const sortedEdges = Array.from(edgeBetweenness.entries())
                .sort((a, b) => b[1] - a[1]);
            
            // Remove edges and detect communities
            const communities = [];
            const tempGraph = this.clone();
            
            for (const [edgeId, betweenness] of sortedEdges) {
                // Remove edge
                const edge = tempGraph.edges.get(edgeId);
                if (edge) {
                    tempGraph.removeEdge(edgeId);
                    
                    // Check if removal created new components
                    const components = tempGraph.findConnectedComponents();
                    if (components.length > communities.length) {
                        communities.push(...components);
                    }
                }
            }
            
            return communities;
        }
        
        calculateEdgeBetweenness() {
            const edgeBetweenness = new Map();
            
            for (const edge of this.edges.values()) {
                edgeBetweenness.set(edge.id, 0);
            }
            
            for (const startId of this.nodes.keys()) {
                const { distances, predecessors, sigma } = this.brandesBFS(startId);
                const delta = this.brandesAccumulation(startId, distances, predecessors, sigma);
                
                // Accumulate edge betweenness
                for (const [edgeId, value] of delta) {
                    edgeBetweenness.set(edgeId, (edgeBetweenness.get(edgeId) || 0) + value);
                }
            }
            
            // Normalize for undirected graph
            for (const [edgeId, value] of edgeBetweenness) {
                edgeBetweenness.set(edgeId, value / 2);
            }
            
            return edgeBetweenness;
        }
        
        brandesBFS(startId) {
            const distances = new Map();
            const predecessors = new Map();
            const sigma = new Map();
            const queue = [startId];
            
            // Initialize
            for (const nodeId of this.nodes.keys()) {
                distances.set(nodeId, -1);
                predecessors.set(nodeId, []);
                sigma.set(nodeId, 0);
            }
            
            distances.set(startId, 0);
            sigma.set(startId, 1);
            
            const stack = [];
            
            while (queue.length > 0) {
                const current = queue.shift();
                stack.push(current);
                
                for (const neighbor of this.adjacency.get(current)) {
                    if (distances.get(neighbor) < 0) {
                        queue.push(neighbor);
                        distances.set(neighbor, distances.get(current) + 1);
                    }
                    
                    if (distances.get(neighbor) === distances.get(current) + 1) {
                        sigma.set(neighbor, sigma.get(neighbor) + sigma.get(current));
                        predecessors.get(neighbor).push(current);
                    }
                }
            }
            
            return { distances, predecessors, sigma, stack };
        }
        
        brandesAccumulation(startId, distances, predecessors, sigma) {
            const delta = new Map();
            const dependency = new Map();
            
            // Initialize
            for (const nodeId of this.nodes.keys()) {
                delta.set(nodeId, 0);
                dependency.set(nodeId, 0);
            }
            
            // Process in reverse order
            const stack = Array.from(this.nodes.keys()).reverse();
            
            for (const node of stack) {
                for (const predecessor of predecessors.get(node)) {
                    const edgeId = this.findEdgeId(predecessor, node);
                    if (edgeId) {
                        const coeff = (sigma.get(predecessor) / sigma.get(node)) * 
                                    (1 + dependency.get(node));
                        dependency.set(predecessor, dependency.get(predecessor) + coeff);
                        delta.set(edgeId, (delta.get(edgeId) || 0) + coeff);
                    }
                }
                
                if (node !== startId) {
                    delta.set(node, delta.get(node) + dependency.get(node));
                }
            }
            
            return delta;
        }
        
        labelPropagationCommunityDetection() {
            // Initialize each node with unique label
            const labels = new Map();
            let labelId = 0;
            
            for (const nodeId of this.nodes.keys()) {
                labels.set(nodeId, labelId++);
            }
            
            let changed = true;
            let iterations = 0;
            
            while (changed && iterations < 100) {
                changed = false;
                const nodes = Array.from(this.nodes.keys());
                this.shuffleArray(nodes);
                
                for (const nodeId of nodes) {
                    // Count neighbor labels
                    const neighborLabels = new Map();
                    for (const neighbor of this.adjacency.get(nodeId)) {
                        const label = labels.get(neighbor);
                        neighborLabels.set(label, (neighborLabels.get(label) || 0) + 1);
                    }
                    
                    // Find most frequent label
                    let maxCount = 0;
                    let bestLabel = labels.get(nodeId);
                    
                    for (const [label, count] of neighborLabels) {
                        if (count > maxCount || (count === maxCount && Math.random() > 0.5)) {
                            maxCount = count;
                            bestLabel = label;
                        }
                    }
                    
                    if (bestLabel !== labels.get(nodeId)) {
                        labels.set(nodeId, bestLabel);
                        changed = true;
                    }
                }
                
                iterations++;
            }
            
            return labels;
        }
        
        spectralClustering(k = 3) {
            // Build adjacency matrix
            const nodeIds = Array.from(this.nodes.keys());
            const n = nodeIds.size;
            const indexMap = new Map();
            
            nodeIds.forEach((id, i) => indexMap.set(id, i));
            
            // Create adjacency and degree matrices
            const A = Array(n).fill().map(() => Array(n).fill(0));
            const D = Array(n).fill().map(() => Array(n).fill(0));
            
            for (const edge of this.edges.values()) {
                const i = indexMap.get(edge.source);
                const j = indexMap.get(edge.target);
                const weight = edge.strength / 100; // Normalize to 0-1
                
                A[i][j] = weight;
                A[j][i] = weight;
            }
            
            // Calculate degree matrix
            for (let i = 0; i < n; i++) {
                let degree = 0;
                for (let j = 0; j < n; j++) {
                    degree += A[i][j];
                }
                D[i][i] = degree;
            }
            
            // Calculate Laplacian: L = D - A
            const L = Array(n).fill().map(() => Array(n).fill(0));
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    L[i][j] = D[i][j] - A[i][j];
                }
            }
            
            // Simplified: Use k-means on node positions
            // In full implementation, would calculate eigenvectors
            
            const positions = nodeIds.map(id => {
                const node = this.nodes.get(id);
                return [node.x, node.y];
            });
            
            // Run k-means on positions
            const clusters = this.kMeans(positions, k);
            
            // Map back to node IDs
            const result = new Map();
            nodeIds.forEach((id, i) => {
                result.set(id, clusters[i]);
            });
            
            return result;
        }
        
        kMeans(points, k, maxIterations = 100) {
            const n = points.length;
            if (n === 0) return [];
            
            // Initialize centroids randomly
            let centroids = [];
            for (let i = 0; i < k; i++) {
                centroids.push(points[Math.floor(Math.random() * n)]);
            }
            
            let assignments = new Array(n).fill(-1);
            let changed = true;
            let iterations = 0;
            
            while (changed && iterations < maxIterations) {
                changed = false;
                
                // Assign points to nearest centroid
                for (let i = 0; i < n; i++) {
                    let minDist = Infinity;
                    let bestCluster = -1;
                    
                    for (let j = 0; j < k; j++) {
                        const dist = this.euclideanDistance(points[i], centroids[j]);
                        if (dist < minDist) {
                            minDist = dist;
                            bestCluster = j;
                        }
                    }
                    
                    if (assignments[i] !== bestCluster) {
                        assignments[i] = bestCluster;
                        changed = true;
                    }
                }
                
                // Update centroids
                const newCentroids = Array(k).fill().map(() => [0, 0]);
                const counts = new Array(k).fill(0);
                
                for (let i = 0; i < n; i++) {
                    const cluster = assignments[i];
                    newCentroids[cluster][0] += points[i][0];
                    newCentroids[cluster][1] += points[i][1];
                    counts[cluster]++;
                }
                
                for (let j = 0; j < k; j++) {
                    if (counts[j] > 0) {
                        centroids[j] = [
                            newCentroids[j][0] / counts[j],
                            newCentroids[j][1] / counts[j]
                        ];
                    }
                }
                
                iterations++;
            }
            
            return assignments;
        }
        
        euclideanDistance(a, b) {
            const dx = a[0] - b[0];
            const dy = a[1] - b[1];
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        // Centrality calculations
        calculateCentralities() {
            return {
                degree: this.calculateDegreeCentrality(),
                betweenness: this.calculateBetweennessCentrality(),
                closeness: this.calculateClosenessCentrality(),
                eigenvector: this.calculateEigenvectorCentrality(),
                pagerank: this.calculatePageRank()
            };
        }
        
        calculateDegreeCentrality() {
            const centrality = new Map();
            const n = this.nodes.size;
            
            for (const [nodeId, node] of this.nodes) {
                centrality.set(nodeId, {
                    degree: node.degree,
                    normalized: node.degree / (n - 1)
                });
            }
            
            return centrality;
        }
        
        calculateBetweennessCentrality() {
            const centrality = new Map();
            
            for (const nodeId of this.nodes.keys()) {
                centrality.set(nodeId, 0);
            }
            
            for (const startId of this.nodes.keys()) {
                const { distances, predecessors, sigma, stack } = this.brandesBFS(startId);
                const delta = this.brandesAccumulation(startId, distances, predecessors, sigma);
                
                for (const [nodeId, value] of delta) {
                    if (this.nodes.has(nodeId)) {
                        centrality.set(nodeId, centrality.get(nodeId) + value);
                    }
                }
            }
            
            // Normalize
            const n = this.nodes.size;
            const factor = 2 / ((n - 1) * (n - 2));
            
            for (const [nodeId, value] of centrality) {
                centrality.set(nodeId, value * factor);
            }
            
            return centrality;
        }
        
        calculateClosenessCentrality() {
            const centrality = new Map();
            const n = this.nodes.size;
            
            for (const startId of this.nodes.keys()) {
                let totalDistance = 0;
                let reachable = 0;
                
                const distances = this.calculateDistancesFrom(startId);
                
                for (const distance of distances.values()) {
                    if (distance > 0 && distance < Infinity) {
                        totalDistance += distance;
                        reachable++;
                    }
                }
                
                if (reachable > 0) {
                    centrality.set(startId, reachable / totalDistance);
                } else {
                    centrality.set(startId, 0);
                }
            }
            
            return centrality;
        }
        
        calculateDistancesFrom(startId) {
            const distances = new Map();
            const queue = [{ node: startId, distance: 0 }];
            const visited = new Set([startId]);
            
            for (const nodeId of this.nodes.keys()) {
                distances.set(nodeId, Infinity);
            }
            distances.set(startId, 0);
            
            while (queue.length > 0) {
                const { node, distance } = queue.shift();
                
                for (const neighbor of this.adjacency.get(node)) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        const edgeId = this.findEdgeId(node, neighbor);
                                              const edge = this.edges.get(edgeId);
                        const weight = edge ? 100 - edge.strength : 50;
                        
                        const newDistance = distance + weight;
                        if (newDistance < distances.get(neighbor)) {
                            distances.set(neighbor, newDistance);
                            queue.push({ node: neighbor, distance: newDistance });
                        }
                    }
                }
            }
            
            return distances;
        }
        
        calculateEigenvectorCentrality(maxIterations = 100, epsilon = 0.0001) {
            const n = this.nodes.size;
            const nodeIds = Array.from(this.nodes.keys());
            const indexMap = new Map();
            
            nodeIds.forEach((id, i) => indexMap.set(id, i));
            
            // Create adjacency matrix
            const A = Array(n).fill().map(() => Array(n).fill(0));
            for (const edge of this.edges.values()) {
                const i = indexMap.get(edge.source);
                const j = indexMap.get(edge.target);
                const weight = edge.strength / 100; // Normalize to 0-1
                
                A[i][j] = weight;
                A[j][i] = weight;
            }
            
            // Initialize eigenvector
            let x = Array(n).fill(1 / Math.sqrt(n));
            let lambda = 0;
            
            // Power iteration
            for (let iter = 0; iter < maxIterations; iter++) {
                // Ax = b
                const b = Array(n).fill(0);
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        b[i] += A[i][j] * x[j];
                    }
                }
                
                // Calculate new eigenvalue
                const newLambda = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
                
                // Normalize
                for (let i = 0; i < n; i++) {
                    x[i] = b[i] / newLambda;
                }
                
                // Check convergence
                if (Math.abs(newLambda - lambda) < epsilon) {
                    lambda = newLambda;
                    break;
                }
                
                lambda = newLambda;
            }
            
            // Map back to node IDs
            const centrality = new Map();
            nodeIds.forEach((id, i) => {
                centrality.set(id, x[i]);
            });
            
            return centrality;
        }
        
        calculatePageRank(damping = 0.85, maxIterations = 100, epsilon = 0.0001) {
            const n = this.nodes.size;
            const nodeIds = Array.from(this.nodes.keys());
            const indexMap = new Map();
            
            nodeIds.forEach((id, i) => indexMap.set(id, i));
            
            // Create transition matrix
            const M = Array(n).fill().map(() => Array(n).fill(0));
            const outDegree = Array(n).fill(0);
            
            // Calculate out-degrees
            for (const edge of this.edges.values()) {
                const i = indexMap.get(edge.source);
                outDegree[i]++;
            }
            
            // Build transition matrix
            for (const edge of this.edges.values()) {
                const i = indexMap.get(edge.source);
                const j = indexMap.get(edge.target);
                const weight = edge.strength / 100;
                
                M[j][i] = weight / outDegree[i]; // Note: column stochastic
            }
            
            // Handle dangling nodes (no outgoing edges)
            for (let i = 0; i < n; i++) {
                if (outDegree[i] === 0) {
                    for (let j = 0; j < n; j++) {
                        M[j][i] = 1 / n;
                    }
                }
            }
            
            // Initialize PageRank vector
            let pr = Array(n).fill(1 / n);
            
            // Power iteration
            for (let iter = 0; iter < maxIterations; iter++) {
                const newPr = Array(n).fill((1 - damping) / n);
                
                // Multiply: newPr = damping * M * pr + (1-damping)/n
                for (let j = 0; j < n; j++) {
                    for (let i = 0; i < n; i++) {
                        newPr[j] += damping * M[j][i] * pr[i];
                    }
                }
                
                // Check convergence
                let diff = 0;
                for (let i = 0; i < n; i++) {
                    diff += Math.abs(newPr[i] - pr[i]);
                }
                
                pr = newPr;
                
                if (diff < epsilon) {
                    break;
                }
            }
            
            // Map back to node IDs
            const pagerank = new Map();
            nodeIds.forEach((id, i) => {
                pagerank.set(id, pr[i]);
            });
            
            return pagerank;
        }
        
        // Subgraph extraction
        extractSubgraph(nodeIds, depth = 1) {
            const subgraph = new Graph();
            const nodesToInclude = new Set();
            
            // Add selected nodes and their neighbors within depth
            for (const nodeId of nodeIds) {
                this.collectNodesWithinDepth(nodeId, depth, nodesToInclude);
            }
            
            // Add nodes to subgraph
            for (const nodeId of nodesToInclude) {
                const node = this.nodes.get(nodeId);
                if (node) {
                    subgraph.addNode({ ...node.data });
                }
            }
            
            // Add edges within subgraph
            for (const edge of this.edges.values()) {
                if (nodesToInclude.has(edge.source) && nodesToInclude.has(edge.target)) {
                    subgraph.addEdge(edge.source, edge.target, edge.data);
                }
            }
            
            return subgraph;
        }
        
        collectNodesWithinDepth(startId, maxDepth, collected) {
            const queue = [{ node: startId, depth: 0 }];
            const visited = new Set();
            
            while (queue.length > 0) {
                const { node, depth } = queue.shift();
                
                if (visited.has(node) || depth > maxDepth) continue;
                
                visited.add(node);
                collected.add(node);
                
                if (depth < maxDepth) {
                    for (const neighbor of this.adjacency.get(node)) {
                        if (!visited.has(neighbor)) {
                            queue.push({ node: neighbor, depth: depth + 1 });
                        }
                    }
                }
            }
        }
        
        findConnectedComponents() {
            const visited = new Set();
            const components = [];
            
            for (const nodeId of this.nodes.keys()) {
                if (!visited.has(nodeId)) {
                    const component = this.bfsComponent(nodeId, visited);
                    components.push(component);
                }
            }
            
            return components;
        }
        
        bfsComponent(startId, visited) {
            const component = [];
            const queue = [startId];
            visited.add(startId);
            
            while (queue.length > 0) {
                const nodeId = queue.shift();
                component.push(nodeId);
                
                for (const neighbor of this.adjacency.get(nodeId)) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
            
            return component;
        }
        
        // Pattern detection
        findPatterns() {
            const patterns = [];
            
            // 1. Stars (hub-spoke patterns)
            patterns.push(...this.findStarPatterns());
            
            // 2. Chains (linear sequences)
            patterns.push(...this.findChainPatterns());
            
            // 3. Cliques (fully connected subgraphs)
            patterns.push(...this.findCliques());
            
            // 4. Bridges (critical connections)
            patterns.push(...this.findBridgePatterns());
            
            // 5. Isolated clusters
            patterns.push(...this.findIsolatedClusters());
            
            return patterns;
        }
        
        findStarPatterns(minDegree = 5) {
            const stars = [];
            
            for (const [nodeId, node] of this.nodes) {
                if (node.degree >= minDegree) {
                    // Check if neighbors are not highly connected to each other
                    const neighbors = Array.from(this.adjacency.get(nodeId));
                    let neighborConnections = 0;
                    let maxPossible = neighbors.length * (neighbors.length - 1) / 2;
                    
                    for (let i = 0; i < neighbors.length; i++) {
                        for (let j = i + 1; j < neighbors.length; j++) {
                            if (this.adjacency.get(neighbors[i]).has(neighbors[j])) {
                                neighborConnections++;
                            }
                        }
                    }
                    
                    const density = maxPossible > 0 ? neighborConnections / maxPossible : 0;
                    
                    if (density < 0.3) { // Low density indicates star pattern
                        stars.push({
                            type: 'star',
                            center: nodeId,
                            spokes: neighbors,
                            degree: node.degree,
                            density,
                            description: `Hub node with ${node.degree} connections`
                        });
                    }
                }
            }
            
            return stars;
        }
        
        findChainPatterns(minLength = 3) {
            const chains = [];
            const visited = new Set();
            
            for (const nodeId of this.nodes.keys()) {
                if (this.adjacency.get(nodeId).size === 1 && !visited.has(nodeId)) {
                    const chain = this.traverseChain(nodeId, visited);
                    if (chain.length >= minLength) {
                        chains.push({
                            type: 'chain',
                            nodes: chain,
                            length: chain.length,
                            description: `Linear chain of ${chain.length} nodes`
                        });
                    }
                }
            }
            
            return chains;
        }
        
        traverseChain(startId, visited) {
            const chain = [startId];
            visited.add(startId);
            
            let current = startId;
            let neighbors = Array.from(this.adjacency.get(current));
            
            while (neighbors.length === 2 || (chain.length === 1 && neighbors.length === 1)) {
                // Find next node not in chain
                let next = null;
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        next = neighbor;
                        break;
                    }
                }
                
                if (!next) break;
                
                chain.push(next);
                visited.add(next);
                current = next;
                neighbors = Array.from(this.adjacency.get(current));
            }
            
            return chain;
        }
        
        findCliques(minSize = 3) {
            const cliques = [];
            const nodes = Array.from(this.nodes.keys());
            
            // Use Bron-Kerbosch algorithm for maximal cliques
            const bronKerbosch = (R, P, X) => {
                if (P.size === 0 && X.size === 0) {
                    if (R.size >= minSize) {
                        cliques.push({
                            type: 'clique',
                            nodes: Array.from(R),
                            size: R.size,
                            density: 1.0,
                            description: `Fully connected group of ${R.size} nodes`
                        });
                    }
                    return;
                }
                
                // Choose pivot
                const pivot = this.choosePivot(P, X);
                const candidates = new Set(P);
                
                // Remove neighbors of pivot
                for (const neighbor of this.adjacency.get(pivot)) {
                    candidates.delete(neighbor);
                }
                
                for (const v of candidates) {
                    const neighbors = this.adjacency.get(v);
                    
                    const newR = new Set(R);
                    newR.add(v);
                    
                    const newP = new Set(P);
                    const newX = new Set(X);
                    
                    // Intersect with neighbors
                    for (const item of newP) {
                        if (!neighbors.has(item)) {
                            newP.delete(item);
                        }
                    }
                    for (const item of newX) {
                        if (!neighbors.has(item)) {
                            newX.delete(item);
                        }
                    }
                    
                    bronKerbosch(newR, newP, newX);
                    
                    P.delete(v);
                    X.add(v);
                }
            };
            
            bronKerbosch(new Set(), new Set(nodes), new Set());
            
            return cliques;
        }
        
        choosePivot(P, X) {
            // Choose node with maximum degree in P ∪ X
            let maxDegree = -1;
            let pivot = null;
            
            for (const node of new Set([...P, ...X])) {
                const degree = this.adjacency.get(node).size;
                if (degree > maxDegree) {
                    maxDegree = degree;
                    pivot = node;
                }
            }
            
            return pivot || (P.values().next().value);
        }
        
        findBridgePatterns() {
            const bridges = [];
            const articulationPoints = this.findArticulationPoints();
            
            for (const edge of this.edges.values()) {
                // Temporarily remove edge
                this.adjacency.get(edge.source).delete(edge.target);
                this.adjacency.get(edge.target).delete(edge.source);
                
                // Check if graph becomes disconnected
                const components = this.findConnectedComponents();
                
                // Restore edge
                this.adjacency.get(edge.source).add(edge.target);
                this.adjacency.get(edge.target).add(edge.source);
                
                if (components.length > 1) {
                    bridges.push({
                        type: 'bridge',
                        edge: edge.id,
                        source: edge.source,
                        target: edge.target,
                        strength: edge.strength,
                        description: 'Critical connection between graph components'
                    });
                }
            }
            
            return bridges;
        }
        
        findArticulationPoints() {
            const discoveryTime = new Map();
            const lowTime = new Map();
            const parent = new Map();
            const articulationPoints = new Set();
            let time = 0;
            
            const dfs = (nodeId, visited) => {
                visited.add(nodeId);
                discoveryTime.set(nodeId, time);
                lowTime.set(nodeId, time);
                time++;
                
                let children = 0;
                
                for (const neighbor of this.adjacency.get(nodeId)) {
                    if (!visited.has(neighbor)) {
                        parent.set(neighbor, nodeId);
                        children++;
                        
                        dfs(neighbor, visited);
                        
                        lowTime.set(nodeId, Math.min(lowTime.get(nodeId), lowTime.get(neighbor)));
                        
                        // Check if node is articulation point
                        if (parent.get(nodeId) === null && children > 1) {
                            articulationPoints.add(nodeId);
                        }
                        if (parent.get(nodeId) !== null && lowTime.get(neighbor) >= discoveryTime.get(nodeId)) {
                            articulationPoints.add(nodeId);
                        }
                    } else if (neighbor !== parent.get(nodeId)) {
                        lowTime.set(nodeId, Math.min(lowTime.get(nodeId), discoveryTime.get(neighbor)));
                    }
                }
            };
            
            const visited = new Set();
            for (const nodeId of this.nodes.keys()) {
                if (!visited.has(nodeId)) {
                    parent.set(nodeId, null);
                    dfs(nodeId, visited);
                }
            }
            
            return Array.from(articulationPoints);
        }
        
        findIsolatedClusters(minSize = 3) {
            const components = this.findConnectedComponents();
            const isolated = [];
            
            for (const component of components) {
                if (component.length >= minSize) {
                    // Calculate external connections
                    let externalConnections = 0;
                    for (const nodeId of component) {
                        for (const neighbor of this.adjacency.get(nodeId)) {
                            if (!component.includes(neighbor)) {
                                externalConnections++;
                            }
                        }
                    }
                    
                    if (externalConnections === 0) {
                        isolated.push({
                            type: 'isolated_cluster',
                            nodes: component,
                            size: component.length,
                            description: `Isolated cluster of ${component.length} nodes`
                        });
                    }
                }
            }
            
            return isolated;
        }
        
        // Metrics calculation
        calculateMetrics() {
            if (Date.now() - this.metrics.lastCalculated < 60000 && this.metrics.density > 0) {
                return this.metrics;
            }
            
            const n = this.nodes.size;
            const m = this.edges.size;
            
            // Basic metrics
            this.metrics.density = n > 1 ? (2 * m) / (n * (n - 1)) : 0;
            this.metrics.avgDegree = n > 0 ? (2 * m) / n : 0;
            
            // Diameter (approximate)
            this.metrics.diameter = this.estimateDiameter();
            
            // Clustering coefficient
            this.metrics.clusteringCoefficient = this.calculateGlobalClusteringCoefficient();
            
            // Connected components
            const components = this.findConnectedComponents();
            this.metrics.components = components.length;
            this.metrics.largestComponent = Math.max(...components.map(c => c.length));
            
            this.metrics.lastCalculated = Date.now();
            
            return this.metrics;
        }
        
        estimateDiameter(samples = 20) {
            if (this.nodes.size === 0) return 0;
            
            const nodeIds = Array.from(this.nodes.keys());
            let maxDistance = 0;
            
            // Sample random nodes
            for (let i = 0; i < Math.min(samples, nodeIds.length); i++) {
                const startId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                const distances = this.calculateDistancesFrom(startId);
                
                for (const distance of distances.values()) {
                    if (distance > maxDistance && distance < Infinity) {
                        maxDistance = distance;
                    }
                }
            }
            
            return maxDistance;
        }
        
        calculateGlobalClusteringCoefficient() {
            let triangles = 0;
            let triplets = 0;
            
            for (const [nodeId, neighbors] of this.adjacency) {
                const k = neighbors.size;
                if (k < 2) continue;
                
                // Count connected neighbor pairs
                let connectedPairs = 0;
                const neighborArray = Array.from(neighbors);
                
                for (let i = 0; i < neighborArray.length; i++) {
                    for (let j = i + 1; j < neighborArray.length; j++) {
                        if (this.adjacency.get(neighborArray[i]).has(neighborArray[j])) {
                            connectedPairs++;
                        }
                    }
                }
                
                triangles += connectedPairs;
                triplets += k * (k - 1) / 2;
            }
            
            return triplets > 0 ? triangles / triplets : 0;
        }
        
        // Utility methods
        clone() {
            const clone = new Graph();
            
            // Clone nodes
            for (const node of this.nodes.values()) {
                clone.addNode({ ...node.data });
            }
            
            // Clone edges
            for (const edge of this.edges.values()) {
                clone.addEdge(edge.source, edge.target, edge.data);
            }
            
            return clone;
        }
        
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        invalidateMetrics() {
            this.metrics.lastCalculated = 0;
        }
        
        // Serialization
        toJSON() {
            return {
                nodes: Array.from(this.nodes.values()).map(node => ({
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    data: node.data,
                    position: { x: node.x, y: node.y },
                    size: node.size,
                    color: node.color
                })),
                edges: Array.from(this.edges.values()).map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label,
                    type: edge.type,
                    strength: edge.strength,
                    width: edge.width,
                    color: edge.color
                })),
                metrics: this.metrics
            };
        }
        
        fromJSON(data) {
            this.nodes.clear();
            this.edges.clear();
            this.adjacency.clear();
            this.multiEdges.clear();
            this.invertedIndex.clear();
            
            // Add nodes
            for (const nodeData of data.nodes) {
                this.addNode(nodeData.data);
                const node = this.nodes.get(nodeData.id);
                if (node) {
                    node.x = nodeData.position.x;
                    node.y = nodeData.position.y;
                    node.size = nodeData.size;
                    node.color = nodeData.color;
                }
            }
            
            // Add edges
            for (const edgeData of data.edges) {
                this.addEdge(edgeData.source, edgeData.target, edgeData);
            }
            
            this.metrics = data.metrics || this.metrics;
        }
        
        // Visualization helper
        getVisualizationData() {
            return {
                nodes: Array.from(this.nodes.values()).map(node => ({
                    id: node.id,
                    label: node.label,
                    title: `
                        <div style="padding: 10px;">
                            <strong>${node.label}</strong><br/>
                            Type: ${node.type}<br/>
                            Severity: ${node.data.severity || 'N/A'}<br/>
                            Degree: ${node.degree}<br/>
                            ${node.data.evaluation ? `Evaluation: ${node.data.evaluation.substring(0, 100)}...` : ''}
                        </div>
                    `,
                    x: node.x,
                    y: node.y,
                    size: node.size,
                    color: node.color,
                    borderWidth: node.selected ? 3 : 1,
                    borderColor: node.highlighted ? '#ff6b6b' : '#2d3436',
                    shape: 'dot',
                    clusterId: node.clusterId
                })),
                edges: Array.from(this.edges.values()).map(edge => ({
                    id: edge.id,
                    from: edge.source,
                    to: edge.target,
                    label: edge.label,
                    title: `
                        <div style="padding: 10px;">
                            <strong>Connection</strong><br/>
                            Type: ${edge.type}<br/>
                            Strength: ${edge.strength.toFixed(1)}<br/>
                            ${edge.data.conflicts ? '⚠️ Has conflicts' : ''}
                        </div>
                    `,
                    width: edge.width,
                    color: edge.color,
                    dashes: edge.dashes,
                    arrows: edge.directed ? { to: { enabled: true } } : {}
                }))
            };
        }
        
        // Query methods
        queryNodes(query) {
            const results = [];
            const queryLower = query.toLowerCase();
            
            for (const [nodeId, node] of this.nodes) {
                if (node.label.toLowerCase().includes(queryLower) ||
                    node.data.evaluation?.toLowerCase().includes(queryLower) ||
                    node.type.toLowerCase().includes(queryLower)) {
                    results.push(node);
                }
            }
            
            return results;
        }
        
        getNodesByProperty(property, value) {
            const index = this.invertedIndex.get(property);
            if (!index) return [];
            
            const nodeIds = index.get(value);
            if (!nodeIds) return [];
            
            return Array.from(nodeIds).map(id => this.nodes.get(id)).filter(Boolean);
        }
        
        // Tree structure class
        class Tree {
            constructor() {
                this.root = null;
                this.nodes = new Map(); // nodeId -> { id, parentId, children: [], depth: 0 }
                this.levels = new Map(); // depth -> [nodeIds]
            }
            
            addNode(nodeId, parentId = null) {
                const node = {
                    id: nodeId,
                    parentId,
                    children: [],
                    depth: 0
                };
                
                this.nodes.set(nodeId, node);
                
                if (parentId) {
                    const parent = this.nodes.get(parentId);
                    if (parent) {
                        parent.children.push(nodeId);
                        node.depth = parent.depth + 1;
                    }
                } else if (this.root === null) {
                    this.root = nodeId;
                }
                
                // Add to levels
                if (!this.levels.has(node.depth)) {
                    this.levels.set(node.depth, []);
                }
                this.levels.get(node.depth).push(nodeId);
                
                return node;
            }
            
            getPathToRoot(nodeId) {
                const path = [];
                let current = nodeId;
                
                while (current) {
                    path.unshift(current);
                    const node = this.nodes.get(current);
                    current = node?.parentId || null;
                }
                
                return path;
            }
            
            getSubtree(nodeId) {
                const subtree = [];
                const queue = [nodeId];
                
                while (queue.length > 0) {
                    const current = queue.shift();
                    subtree.push(current);
                    
                    const node = this.nodes.get(current);
                    if (node) {
                        queue.push(...node.children);
                    }
                }
                
                return subtree;
            }
            
            getSiblings(nodeId) {
                const node = this.nodes.get(nodeId);
                if (!node || !node.parentId) return [];
                
                const parent = this.nodes.get(node.parentId);
                return parent.children.filter(id => id !== nodeId);
            }
            
            getLeaves() {
                const leaves = [];
                for (const [id, node] of this.nodes) {
                    if (node.children.length === 0) {
                        leaves.push(id);
                    }
                }
                return leaves;
            }
            
            calculateDepths() {
                if (!this.root) return;
                
                const calculateDepth = (nodeId, depth) => {
                    const node = this.nodes.get(nodeId);
                    if (!node) return;
                    
                    node.depth = depth;
                    
                    for (const childId of node.children) {
                        calculateDepth(childId, depth + 1);
                    }
                };
                
                calculateDepth(this.root, 0);
                
                // Rebuild levels
                this.levels.clear();
                for (const [id, node] of this.nodes) {
                    if (!this.levels.has(node.depth)) {
                        this.levels.set(node.depth, []);
                    }
                    this.levels.get(node.depth).push(id);
                }
            }
            
            toJSON() {
                const nodes = Array.from(this.nodes.values());
                return {
                    root: this.root,
                    nodes,
                    levels: Array.from(this.levels.entries()).map(([depth, nodeIds]) => ({
                        depth,
                        nodeIds
                    }))
                };
            }
        }
        
        get tree() {
            return this._tree || (this._tree = new Tree());
        }
    }
    
    // Layout engine
    class ForceDirectedLayout {
        constructor() {
            this.config = {
                repulsion: 200,
                attraction: 0.1,
                gravity: 0.01,
                maxDistance: 1000,
                minDistance: 10,
                damping: 0.9,
                maxSpeed: 50
            };
            
            this.forces = new Map();
            this.velocities = new Map();
            this.running = false;
            this.iteration = 0;
        }
        
        initialize(graph) {
            // Initialize forces and velocities
            for (const nodeId of graph.nodes.keys()) {
                this.forces.set(nodeId, { x: 0, y: 0 });
                this.velocities.set(nodeId, { x: 0, y: 0 });
            }
        }
        
        calculateForces(graph) {
            const nodes = Array.from(graph.nodes.values());
            const edges = Array.from(graph.edges.values());
            
            // Reset forces
            for (const force of this.forces.values()) {
                force.x = 0;
                force.y = 0;
            }
            
            // Repulsion between all nodes
            for (let i = 0; i < nodes.length; i++) {
                const node1 = nodes[i];
                
                for (let j = i + 1; j < nodes.length; j++) {
                    const node2 = nodes[j];
                    
                    // Calculate distance
                    const dx = node1.x - node2.x;
                    const dy = node1.y - node2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                    
                    // Calculate repulsion force (Coulomb's law)
                    const repulsionForce = this.config.repulsion / (distance * distance);
                    const forceX = repulsionForce * dx / distance;
                    const forceY = repulsionForce * dy / distance;
                    
                    this.forces.get(node1.id).x += forceX;
                    this.forces.get(node1.id).y += forceY;
                    this.forces.get(node2.id).x -= forceX;
                    this.forces.get(node2.id).y -= forceY;
                }
            }
            
            // Attraction along edges (Hooke's law)
            for (const edge of edges) {
                const node1 = graph.nodes.get(edge.source);
                const node2 = graph.nodes.get(edge.target);
                
                if (!node1 || !node2) continue;
                
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                
                // Ideal length based on edge strength
                const idealLength = 100 + (100 - edge.strength);
                const displacement = distance - idealLength;
                
                // Attraction force
                const attractionForce = this.config.attraction * displacement;
                const forceX = attractionForce * dx / distance;
                const forceY = attractionForce * dy / distance;
                
                this.forces.get(node1.id).x -= forceX;
                this.forces.get(node1.id).y -= forceY;
                this.forces.get(node2.id).x += forceX;
                this.forces.get(node2.id).y += forceY;
            }
            
            // Gravity towards center
            const center = this.calculateCenter(nodes);
            for (const node of nodes) {
                const dx = node.x - center.x;
                const dy = node.y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                
                const gravityForce = this.config.gravity * distance;
                this.forces.get(node.id).x -= gravityForce * dx / distance;
                this.forces.get(node.id).y -= gravityForce * dy / distance;
            }
        }
        
        calculateCenter(nodes) {
            if (nodes.length === 0) return { x: 0, y: 0 };
            
            let sumX = 0, sumY = 0;
            for (const node of nodes) {
                sumX += node.x;
                sumY += node.y;
            }
            
            return {
                x: sumX / nodes.length,
                y: sumY / nodes.length
            };
        }
        
        applyForces(graph, deltaTime = 0.1) {
            for (const node of graph.nodes.values()) {
                const force = this.forces.get(node.id);
                const velocity = this.velocities.get(node.id);
                
                if (!force || !velocity) continue;
                
                // Update velocity (F = ma, m = 1)
                velocity.x += force.x * deltaTime;
                velocity.y += force.y * deltaTime;
                
                // Apply damping
                velocity.x *= this.config.damping;
                velocity.y *= this.config.damping;
                
                // Limit speed
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                if (speed > this.config.maxSpeed) {
                    velocity.x = (velocity.x / speed) * this.config.maxSpeed;
                    velocity.y = (velocity.y / speed) * this.config.maxSpeed;
                }
                
                // Update position
                if (!node.fixed) {
                    node.x += velocity.x * deltaTime;
                    node.y += velocity.y * deltaTime;
                }
            }
            
            this.iteration++;
        }
        
        step(graph) {
            this.calculateForces(graph);
            this.applyForces(graph);
            
            // Check convergence
            const totalForce = this.calculateTotalForce();
            return totalForce < 0.1; // Convergence threshold
        }
        
        calculateTotalForce() {
            let total = 0;
            for (const force of this.forces.values()) {
                total += Math.sqrt(force.x * force.x + force.y * force.y);
            }
            return total / this.forces.size;
        }
        
        run(graph, maxIterations = 1000, callback = null) {
            this.initialize(graph);
            this.running = true;
            
            const stepFunction = () => {
                if (!this.running || this.iteration >= maxIterations) {
                    this.running = false;
                    if (callback) callback(this.iteration);
                    return;
                }
                
                const converged = this.step(graph);
                
                if (callback) callback(this.iteration, converged);
                
                if (!converged) {
                    requestAnimationFrame(stepFunction);
                } else {
                    this.running = false;
                    if (callback) callback(this.iteration, true);
                }
            };
            
            requestAnimationFrame(stepFunction);
        }
        
        stop() {
            this.running = false;
        }
        
        setPositions(graph, positions) {
            for (const [nodeId, pos] of positions) {
                const node = graph.nodes.get(nodeId);
                if (node) {
                    node.x = pos.x;
                    node.y = pos.y;
                }
            }
        }
    }
    
    // Community detector
    class CommunityDetector {
        constructor() {
            this.methods = {
                louvain: this.detectLouvain.bind(this),
                girvan_newman: this.detectGirvanNewman.bind(this),
                label_propagation: this.detectLabelPropagation.bind(this),
                spectral: this.detectSpectral.bind(this)
            };
        }
        
        detect(graph, method = 'louvain') {
            const detector = this.methods[method] || this.methods.louvain;
            return detector(graph);
        }
        
        detectLouvain(graph) {
            // Implementation from Graph class
            return graph.louvainCommunityDetection();
        }
        
        detectGirvanNewman(graph) {
            return graph.girvanNewmanCommunityDetection();
        }
        
        detectLabelPropagation(graph) {
            return graph.labelPropagationCommunityDetection();
        }
        
        detectSpectral(graph, k = 3) {
            return graph.spectralClustering(k);
        }
        
        calculateModularity(graph, communities) {
            const m = graph.edges.size;
            if (m === 0) return 0;
            
            let modularity = 0;
            const degrees = new Map();
            
            // Calculate degrees
            for (const [nodeId, node] of graph.nodes) {
                degrees.set(nodeId, graph.adjacency.get(nodeId).size);
            }
            
            // Group nodes by community
            const communityMap = new Map();
            for (const [nodeId, communityId] of communities) {
                if (!communityMap.has(communityId)) {
                    communityMap.set(communityId, []);
                }
                communityMap.get(communityId).push(nodeId);
            }
            
            // Calculate modularity for each community
            for (const [communityId, nodeIds] of communityMap) {
                let edgesInside = 0;
                let totalDegree = 0;
                
                // Count edges inside community
                for (const nodeId of nodeIds) {
                    totalDegree += degrees.get(nodeId);
                    
                    for (const neighbor of graph.adjacency.get(nodeId)) {
                        if (nodeIds.includes(neighbor)) {
                            edgesInside++;
                        }
                    }
                }
                
                // Each edge counted twice
                edgesInside /= 2;
                
                modularity += (edgesInside / m) - Math.pow(totalDegree / (2 * m), 2);
            }
            
            return modularity;
        }
        
        findOptimalCommunities(graph, method = 'louvain', maxK = 10) {
            let bestModularity = -Infinity;
            let bestCommunities = null;
            let bestK = 0;
            
            for (let k = 2; k <= maxK; k++) {
                let communities;
                
                if (method === 'spectral') {
                    communities = this.detectSpectral(graph, k);
                } else {
                    communities = this.detect(graph, method);
                }
                
                const modularity = this.calculateModularity(graph, communities);
                
                if (modularity > bestModularity) {
                    bestModularity = modularity;
                    bestCommunities = communities;
                    bestK = k;
                }
            }
            
            return {
                communities: bestCommunities,
                modularity: bestModularity,
                k: bestK
            };
        }
    }
    
    // Path finder
    class PathFinder {
        constructor() {
            this.algorithms = {
                dijkstra: this.findDijkstra.bind(this),
                astar: this.findAStar.bind(this),
                bfs: this.findBFS.bind(this),
                bellman_ford: this.findBellmanFord.bind(this)
            };
        }
        
        find(graph, startId, endId, algorithm = 'dijkstra') {
            const finder = this.algorithms[algorithm] || this.algorithms.dijkstra;
            return finder(graph, startId, endId);
        }
        
        findDijkstra(graph, startId, endId) {
            return graph.dijkstra(startId, endId);
        }
        
        findAStar(graph, startId, endId) {
            return graph.aStar(startId, endId);
        }
        
        findBFS(graph, startId, endId) {
            return graph.bfsShortestPath(startId, endId);
        }
        
        findBellmanFord(graph, startId, endId) {
            const distances = new Map();
            const previous = new Map();
            
            // Initialize
            for (const nodeId of graph.nodes.keys()) {
                distances.set(nodeId, Infinity);
                previous.set(nodeId, null);
            }
            distances.set(startId, 0);
            
            // Relax edges V-1 times
            const edges = Array.from(graph.edges.values());
            for (let i = 0; i < graph.nodes.size - 1; i++) {
                let changed = false;
                
                for (const edge of edges) {
                    const u = edge.source;
                    const v = edge.target;
                    const weight = 100 - edge.strength;
                    
                    if (distances.get(u) + weight < distances.get(v)) {
                        distances.set(v, distances.get(u) + weight);
                        previous.set(v, u);
                        changed = true;
                    }
                    
                    // For undirected graph, check both directions
                    if (distances.get(v) + weight < distances.get(u)) {
                        distances.set(u, distances.get(v) + weight);
                        previous.set(u, v);
                        changed = true;
                    }
                }
                
                if (!changed) break;
            }
            
            // Check for negative cycles (not applicable here, but for completeness)
            for (const edge of edges) {
                const u = edge.source;
                const v = edge.target;
                const weight = 100 - edge.strength;
                
                if (distances.get(u) + weight < distances.get(v)) {
                    console.warn('Graph contains negative cycle');
                    return null;
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
                return null;
            }
            
            return {
                path,
                distance: distances.get(endId),
                steps: path.length - 1
            };
        }
        
        findAllPaths(graph, startId, endId, maxDepth = 6) {
            const paths = [];
            const visited = new Set();
            
            const dfs = (current, path, depth) => {
                if (depth > maxDepth) return;
                
                visited.add(current);
                path.push(current);
                
                if (current === endId) {
                    paths.push([...path]);
                } else {
                    for (const neighbor of graph.adjacency.get(current)) {
                        if (!visited.has(neighbor)) {
                            dfs(neighbor, path, depth + 1);
                        }
                    }
                }
                
                visited.delete(current);
                path.pop();
            };
            
            dfs(startId, [], 0);
            
            // Sort by length
            return paths.sort((a, b) => a.length - b.length);
        }
        
        findKShortestPaths(graph, startId, endId, k = 3) {
            const paths = [];
            const queue = [];
            
            // First shortest path
            const firstPath = this.find(graph, startId, endId, 'dijkstra');
            if (firstPath) {
                queue.push({
                    path: firstPath.path,
                    distance: firstPath.distance,
                    spurIndex: 0
                });
            }
            
            while (paths.length < k && queue.length > 0) {
                // Get path with smallest distance
                queue.sort((a, b) => a.distance - b.distance);
                const current = queue.shift();
                paths.push(current);
                
                // For each spur node
                for (let i = current.spurIndex; i < current.path.length - 1; i++) {
                    const spurNode = current.path[i];
                    const rootPath = current.path.slice(0, i + 1);
                    
                    // Temporarily remove edges from root path to spur node
                    const removedEdges = [];
                    for (let j = 0; j < i; j++) {
                        const edgeId = graph.findEdgeId(current.path[j], current.path[j + 1]);
                        if (edgeId) {
                            const edge = graph.edges.get(edgeId);
                            removedEdges.push(edge);
                            graph.edges.delete(edgeId);
                            graph.adjacency.get(current.path[j]).delete(current.path[j + 1]);
                            graph.adjacency.get(current.path[j + 1]).delete(current.path[j]);
                        }
                    }
                    
                    // Find spur path
                    const spurPath = this.find(graph, spurNode, endId, 'dijkstra');
                    
                    if (spurPath) {
                        const totalPath = [...rootPath.slice(0, -1), ...spurPath.path];
                        const totalDistance = current.distance + spurPath.distance;
                        
                        queue.push({
                            path: totalPath,
                            distance: totalDistance,
                            spurIndex: i
                        });
                    }
                    
                    // Restore removed edges
                    for (const edge of removedEdges) {
                        graph.edges.set(edge.id, edge);
                        graph.adjacency.get(edge.source).add(edge.target);
                        graph.adjacency.get(edge.target).add(edge.source);
                    }
                }
            }
            
            return paths;
        }
    }
    
    // Centrality calculator
    class CentralityCalculator {
        constructor() {
            this.cache = new Map();
            this.cacheTime = new Map();
        }
        
        calculate(graph, type = 'all') {
            const cacheKey = `${type}_${graph.nodes.size}_${graph.edges.size}`;
            const now = Date.now();
            
            // Check cache (valid for 1 minute)
            if (this.cache.has(cacheKey) && now - (this.cacheTime.get(cacheKey) || 0) < 60000) {
                return this.cache.get(cacheKey);
            }
            
            let result;
            switch (type) {
                case 'degree':
                    result = graph.calculateDegreeCentrality();
                    break;
                case 'betweenness':
                    result = graph.calculateBetweennessCentrality();
                    break;
                case 'closeness':
                    result = graph.calculateClosenessCentrality();
                    break;
                case 'eigenvector':
                    result = graph.calculateEigenvectorCentrality();
                    break;
                case 'pagerank':
                    result = graph.calculatePageRank();
                    break;
                case 'all':
                    result = graph.calculateCentralities();
                    break;
                default:
                    result = graph.calculateDegreeCentrality();
            }
            
            // Cache result
            this.cache.set(cacheKey, result);
            this.cacheTime.set(cacheKey, now);
            
            return result;
        }
        
        getTopNodes(graph, type = 'degree', count = 10) {
            const centrality = this.calculate(graph, type);
            
            if (type === 'all') {
                // Handle composite ranking
                const scores = new Map();
                
                for (const [nodeId, centralities] of centrality) {
                    // Weighted sum of different centralities
                    const score = 
                        (centralities.degree?.normalized || 0) * 0.3 +
                        (centralities.betweenness || 0) * 0.3 +
                        (centralities.closeness || 0) * 0.2 +
                        (centralities.eigenvector || 0) * 0.1 +
                        (centralities.pagerank || 0) * 0.1;
                    
                    scores.set(nodeId, score);
                }
                
                return Array.from(scores.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, count)
                    .map(([nodeId, score]) => ({
                        node: graph.nodes.get(nodeId),
                        score,
                        rank: 'composite'
                    }));
            } else {
                return Array.from(centrality.entries())
                    .sort((a, b) => {
                        if (typeof a[1] === 'object') {
                            return b[1].normalized - a[1].normalized;
                        }
                        return b[1] - a[1];
                    })
                    .slice(0, count)
                    .map(([nodeId, value], index) => ({
                        node: graph.nodes.get(nodeId),
                        value,
                        rank: index + 1
                    }));
            }
        }
        
        identifyHubs(graph, threshold = 0.8) {
            const degreeCentrality = this.calculate(graph, 'degree');
            const hubs = [];
            
            for (const [nodeId, centrality] of degreeCentrality) {
                if (centrality.normalized >= threshold) {
                    hubs.push({
                        node: graph.nodes.get(nodeId),
                        centrality: centrality.normalized,
                        type: 'hub'
                    });
                }
            }
            
            return hubs.sort((a, b) => b.centrality - a.centrality);
        }
        
        identifyBridges(graph) {
            const betweenness = this.calculate(graph, 'betweenness');
            const bridges = [];
            
            // Find edges with high betweenness
            for (const edge of graph.edges.values()) {
                // Edge betweenness approximation
                const nodeBetweenness = 
                    (betweenness.get(edge.source) || 0) + 
                    (betweenness.get(edge.target) || 0);
                
                bridges.push({
                    edge,
                    betweenness: nodeBetweenness,
                    criticality: nodeBetweenness / (graph.nodes.size - 1)
                });
            }
            
            return bridges.sort((a, b) => b.criticality - a.criticality);
        }
        
        clearCache() {
            this.cache.clear();
            this.cacheTime.clear();
        }
    }
    
    // Pattern detector
    class PatternDetector {
        constructor() {
            this.patterns = new Map();
        }
        
        detectAll(graph) {
            const patterns = graph.findPatterns();
            
            // Categorize patterns
            const categorized = {
                hubs: patterns.filter(p => p.type === 'star'),
                chains: patterns.filter(p => p.type === 'chain'),
                cliques: patterns.filter(p => p.type === 'clique'),
                bridges: patterns.filter(p => p.type === 'bridge'),
                isolated: patterns.filter(p => p.type === 'isolated_cluster'),
                custom: []
            };
            
            // Add custom pattern detection
            categorized.custom.push(...this.detectClinicalPatterns(graph));
            
            // Store for later reference
            this.patterns.set(graph, categorized);
            
            return categorized;
        }
        
        detectClinicalPatterns(graph) {
            const patterns = [];
            
            // Inflammation patterns
            const inflammatoryNodes = graph.getNodesByProperty('category', 'inflammatory');
            if (inflammatoryNodes.length >= 3) {
                patterns.push({
                    type: 'clinical_inflammatory_cluster',
                    nodes: inflammatoryNodes.map(n => n.id),
                    severity: this.calculateAverageSeverity(inflammatoryNodes),
                    description: 'Cluster of inflammatory traits',
                    implications: 'Consider anti-inflammatory therapy'
                });
            }
            
            // Pulmonary-obstructive patterns
            const pulmonaryNodes = graph.getNodesByProperty('category', 'pulmonary');
            const obstructiveNodes = pulmonaryNodes.filter(n => 
                n.data.evaluation?.toLowerCase().includes('obstructive') ||
                n.data.name?.toLowerCase().includes('obstructive')
            );
            
            if (obstructiveNodes.length >= 2) {
                patterns.push({
                    type: 'obstructive_syndrome',
                    nodes: obstructiveNodes.map(n => n.id),
                    severity: this.calculateAverageSeverity(obstructiveNodes),
                    description: 'Multiple obstructive pulmonary traits',
                    implications: 'Consider bronchodilator therapy'
                });
            }
            
            // Treatment complexity patterns
            const complexNodes = [];
            for (const node of graph.nodes.values()) {
                if (this.hasComplexTreatment(node.data.treatment)) {
                    complexNodes.push(node.id);
                }
            }
            
            if (complexNodes.length >= 2) {
                patterns.push({
                    type: 'treatment_complexity',
                    nodes: complexNodes,
                    description: 'Multiple traits requiring complex treatments',
                    implications: 'Risk of non-adherence, consider simplification'
                });
            }
            
            return patterns;
        }
        
        calculateAverageSeverity(nodes) {
            if (nodes.length === 0) return 0;
            const total = nodes.reduce((sum, node) => sum + (node.data.severity || 0), 0);
            return total / nodes.length;
        }
        
        hasComplexTreatment(treatment) {
            if (!treatment) return false;
            
            const treatmentStr = typeof treatment === 'string' ? 
                treatment : JSON.stringify(treatment);
            
            // Complexity indicators
            const complexityMarkers = [
                'combination',
                'multiple',
                'add-on',
                'step-up',
                'rescue',
                'maintenance'
            ];
            
            return complexityMarkers.some(marker => 
                treatmentStr.toLowerCase().includes(marker)
            );
        }
        
        findPatternInHistory(graph, patternType) {
            // Check if pattern existed in previous states
            // This would require storing graph history
            return null;
        }
        
        predictPatternEvolution(graph, pattern, steps = 5) {
            // Predict how pattern might evolve
            // Simplified prediction based on network growth patterns
            const prediction = {
                pattern: pattern,
                currentState: this.analyzePatternState(pattern),
                predictions: []
            };
            
            for (let i = 1; i <= steps; i++) {
                prediction.predictions.push({
                    step: i,
                    expectedGrowth: this.predictPatternGrowth(pattern, i),
                    riskFactors: this.identifyPatternRisks(pattern)
                });
            }
            
            return prediction;
        }
        
        analyzePatternState(pattern) {
            // Analyze current state of pattern
            return {
                size: pattern.nodes?.length || 0,
                density: pattern.density || 0,
                connectivity: pattern.connectivity || 'unknown',
                stability: this.calculatePatternStability(pattern)
            };
        }
        
        calculatePatternStability(pattern) {
            // Calculate how stable the pattern is
            // Simplified calculation
            if (pattern.type === 'clique') return 'high';
            if (pattern.type === 'chain') return 'medium';
            if (pattern.type === 'star') return 'low'; // Hubs can change
            return 'unknown';
        }
        
        predictPatternGrowth(pattern, steps) {
            // Predict growth based on pattern type
            switch (pattern.type) {
                case 'star':
                    return pattern.nodes.length + steps * 2; // Hubs attract connections
                case 'chain':
                    return pattern.nodes.length + steps; // Linear growth
                case 'clique':
                    return pattern.nodes.length + Math.floor(steps / 2); // Slow growth
                default:
                    return pattern.nodes.length + 1;
            }
        }
        
        identifyPatternRisks(pattern) {
            const risks = [];
            
            if (pattern.type === 'star') {
                risks.push({
                    type: 'hub_failure',
                    description: 'Loss of central node would disconnect spokes',
                    severity: 'high'
                });
            }
            
            if (pattern.type === 'bridge') {
                risks.push({
                    type: 'connection_loss',
                    description: 'Breaking this connection would separate network components',
                    severity: 'critical'
                });
            }
            
            if (pattern.density < 0.3) {
                risks.push({
                    type: 'fragile_structure',
                    description: 'Low density makes pattern vulnerable to disruptions',
                    severity: 'medium'
                });
            }
            
            return risks;
        }
    }
    
    // Graph cache
    class GraphCache {
        constructor() {
            this.cache = new Map();
            this.stats = {
                hits: 0,
                misses: 0,
                size: 0,
                memory: 0
            };
            this.maxSize = 100;
        }
        
        set(key, data, ttl = 60000) {
            const entry = {
                data,
                expires: Date.now() + ttl,
                size: this.estimateSize(data),
                accessCount: 0,
                lastAccessed: Date.now()
            };
            
            this.cache.set(key, entry);
            this.stats.size = this.cache.size;
            this.updateMemoryStats();
            
            // Evict if needed
            if (this.cache.size > this.maxSize) {
                this.evictLRU();
            }
        }
        
        get(key) {
            const entry = this.cache.get(key);
            
            if (!entry) {
                this.stats.misses++;
                return null;
            }
            
            // Check expiration
            if (entry.expires < Date.now()) {
                this.cache.delete(key);
                this.stats.misses++;
                this.stats.size = this.cache.size;
                return null;
            }
            
            // Update access info
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            
            this.stats.hits++;
            return entry.data;
        }
        
        delete(key) {
            const existed = this.cache.delete(key);
            if (existed) {
                this.stats.size = this.cache.size;
                this.updateMemoryStats();
            }
            return existed;
        }
        
        clear() {
            this.cache.clear();
            this.stats.size = 0;
            this.stats.memory = 0;
        }
        
        estimateSize(data) {
            // Rough size estimation
            const str = JSON.stringify(data);
            return str.length * 2; // Approximate bytes (2 bytes per char for UTF-16)
        }
        
        updateMemoryStats() {
            let total = 0;
            for (const entry of this.cache.values()) {
                total += entry.size;
            }
            this.stats.memory = total;
        }
        
        evictLRU() {
            let lruKey = null;
            let lruTime = Infinity;
            
            for (const [key, entry] of this.cache) {
                if (entry.lastAccessed < lruTime) {
                    lruTime = entry.lastAccessed;
                    lruKey = key;
                }
            }
            
            if (lruKey) {
                this.delete(lruKey);
            }
        }
        
        getStats() {
            return {
                ...this.stats,
                hitRate: this.stats.hits + this.stats.misses > 0 ? 
                    this.stats.hits / (this.stats.hits + this.stats.misses) : 0
            };
        }
    }
    
    // Graph worker (Web Worker wrapper)
    class GraphWorker {
        constructor() {
            this.worker = null;
            this.callbacks = new Map();
            this.taskId = 0;
            
            if (typeof Worker !== 'undefined') {
                this.createWorker();
            }
        }
        
        createWorker() {
            const workerCode = `
                self.onmessage = function(event) {
                    const { taskId, type, data } = event.data;
                    
                    try {
                        let result;
                        switch (type) {
                            case 'calculate_centralities':
                                result = calculateCentralities(data.graph);
                                break;
                            case 'detect_communities':
                                result = detectCommunities(data.graph, data.method);
                                break;
                            case 'find_patterns':
                                result = findPatterns(data.graph);
                                break;
                            case 'layout':
                                result = calculateLayout(data.graph, data.config);
                                break;
                            default:
                                throw new Error('Unknown task type: ' + type);
                        }
                        
                        self.postMessage({ taskId, result, success: true });
                    } catch (error) {
                        self.postMessage({ 
                            taskId, 
                            error: error.message, 
                            success: false 
                        });
                    }
                };
                
                function calculateCentralities(graphData) {
                    // Implement centrality calculations
                    // This would be a full implementation in the worker
                    return { status: 'calculated' };
                }
                
                function detectCommunities(graphData, method) {
                    // Implement community detection
                    return { status: 'detected', method };
                }
                
                function findPatterns(graphData) {
                    // Implement pattern detection
                    return { status: 'found' };
                }
                
                function calculateLayout(graphData, config) {
                    // Implement layout calculation
                    return { status: 'calculated' };
                }
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
            
            this.worker.onmessage = (event) => {
                const { taskId, result, error, success } = event.data;
                const callback = this.callbacks.get(taskId);
                
                if (callback) {
                    if (success) {
                        callback.resolve(result);
                    } else {
                        callback.reject(new Error(error));
                    }
                    this.callbacks.delete(taskId);
                }
            };
        }
        
        async runTask(type, data) {
            if (!this.worker) {
                // Fallback to main thread
                return this.runInMainThread(type, data);
            }
            
            const taskId = this.taskId++;
            const promise = new Promise((resolve, reject) => {
                this.callbacks.set(taskId, { resolve, reject });
            });
            
            this.worker.postMessage({ taskId, type, data });
            
            return promise;
        }
        
        runInMainThread(type, data) {
            // Main thread fallback implementations
            switch (type) {
                case 'calculate_centralities':
                    // Use existing graph methods
                    return Promise.resolve({ status: 'main_thread_fallback' });
                default:
                    return Promise.reject(new Error('Main thread fallback not implemented'));
            }
        }
        
        terminate() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
        }
    }
    
    // Batch processor
    class BatchProcessor {
        constructor() {
            this.queue = [];
            this.processing = false;
            this.batchSize = 50;
            this.delay = 16; // ~60fps
        }
        
        add(task) {
            this.queue.push(task);
            if (!this.processing) {
                this.process();
            }
        }
        
        async process() {
            this.processing = true;
            
            while (this.queue.length > 0) {
                const batch = this.queue.splice(0, this.batchSize);
                
                // Process batch
                for (const task of batch) {
                    try {
                        await task();
                    } catch (error) {
                        console.error('Batch task failed:', error);
                    }
                }
                
                // Yield to prevent blocking
                if (this.queue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.delay));
                }
            }
            
            this.processing = false;
        }
        
        clear() {
            this.queue = [];
            this.processing = false;
        }
        
        getQueueSize() {
            return this.queue.length;
        }
    }
    
    // Visualization engine methods
    setupEventListeners() {
        // Setup event listeners for graph interactions
        this.events = {
            nodeClick: this.handleNodeClick.bind(this),
            nodeDoubleClick: this.handleNodeDoubleClick.bind(this),
            nodeDrag: this.handleNodeDrag.bind(this),
            edgeClick: this.handleEdgeClick.bind(this),
            backgroundClick: this.handleBackgroundClick.bind(this)
        };
    }
    
    handleNodeClick(nodeId, event) {
        const node = this.graph.nodes.get(nodeId);
        if (!node) return;
        
        // Update selection
        this.clearSelection();
        node.selected = true;
        this.state.selectedNode = nodeId;
        
        // Highlight neighbors
        this.highlightNeighbors(nodeId);
        
        // Emit event
        this.emit('node:selected', { node, event });
    }
    
    handleNodeDoubleClick(nodeId, event) {
        const node = this.graph.nodes.get(nodeId);
        if (!node) return;
        
        // Extract subgraph around node
        const subgraph = this.graph.extractSubgraph([nodeId], 2);
        
        // Emit event
        this.emit('node:doubleclick', { node, subgraph, event });
    }
    
    handleNodeDrag(nodeId, newPosition) {
        const node = this.graph.nodes.get(nodeId);
        if (!node) return;
        
        // Update position
        node.x = newPosition.x;
        node.y = newPosition.y;
        node.fixed = true; // Fix dragged nodes
        
        // Emit event
        this.emit('node:dragged', { node, position: newPosition });
    }
    
    handleEdgeClick(edgeId, event) {
        const edge = this.graph.edges.get(edgeId);
        if (!edge) return;
        
        // Update selection
        this.clearSelection();
        edge.selected = true;
        this.state.selectedEdge = edgeId;
        
        // Highlight connected nodes
        const sourceNode = this.graph.nodes.get(edge.source);
        const targetNode = this.graph.nodes.get(edge.target);
        
        if (sourceNode) sourceNode.highlighted = true;
        if (targetNode) targetNode.highlighted = true;
        
        // Emit event
        this.emit('edge:selected', { edge, sourceNode, targetNode, event });
    }
    
    handleBackgroundClick(event) {
        // Clear all selections
        this.clearSelection();
        
        // Emit event
        this.emit('background:clicked', { event });
    }
    
    highlightNeighbors(nodeId) {
        const neighbors = this.graph.adjacency.get(nodeId);
        if (!neighbors) return;
        
        for (const neighborId of neighbors) {
            const neighbor = this.graph.nodes.get(neighborId);
            if (neighbor) {
                neighbor.highlighted = true;
            }
        }
    }
    
    clearSelection() {
        // Clear node selections
        for (const node of this.graph.nodes.values()) {
            node.selected = false;
            node.highlighted = false;
        }
        
        // Clear edge selections
        for (const edge of this.graph.edges.values()) {
            edge.selected = false;
        }
        
        // Clear state
        this.state.selectedNode = null;
        this.state.selectedEdge = null;
    }
    
    startLayoutEngine() {
        if (this.config.autoLayout && this.layout) {
            this.layout.run(this.graph, 1000, (iteration, converged) => {
                if (converged) {
                    this.emit('layout:converged', { iteration });
                }
            });
        }
    }
    
    emit(event, data) {
        // Emit events to external listeners
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.eventListeners && this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }
    
    // Public API
    async loadGraph(graphData) {
        this.graph = new Graph();
        this.graph.fromJSON(graphData);
        
        // Initialize layout
        this.layout = new ForceDirectedLayout();
        this.layout.initialize(this.graph);
        
        // Detect communities
        const communities = this.communityDetector.detect(this.graph);
        
        // Calculate centralities
        const centralities = this.centralityCalculator.calculate(this.graph);
        
        // Detect patterns
        const patterns = this.patternDetector.detectAll(this.graph);
        
        return {
            graph: this.graph,
            communities,
            centralities,
            patterns
        };
    }
    
    async analyzeGraph() {
        if (!this.graph) return null;
        
        const metrics = this.graph.calculateMetrics();
        const communities = this.communityDetector.detect(this.graph);
        const centralities = this.centralityCalculator.calculate(this.graph, 'all');
        const patterns = this.patternDetector.detectAll(this.graph);
        const modularity = this.communityDetector.calculateModularity(this.graph, communities);
        
        return {
            metrics,
            communities: {
                assignments: communities,
                count: new Set(Array.from(communities.values())).size,
                modularity
            },
            centralities,
            patterns,
            recommendations: this.generateRecommendations(metrics, patterns)
        };
    }
    
    generateRecommendations(metrics, patterns) {
        const recommendations = [];
        
        // Based on network density
        if (metrics.density < 0.1) {
            recommendations.push({
                type: 'network_sparsity',
                severity: 'low',
                description: 'Network is very sparse',
                suggestion: 'Consider adding more connections between related traits'
            });
        } else if (metrics.density > 0.7) {
            recommendations.push({
                type: 'network_density',
                severity: 'medium',
                description: 'Network is very dense',
                suggestion: 'Consider if all connections are clinically meaningful'
            });
        }
        
        // Based on patterns
        for (const pattern of patterns.bridges || []) {
            recommendations.push({
                type: 'critical_connection',
                severity: 'high',
                description: `Critical bridge connection detected: ${pattern.edge}`,
                suggestion: 'Monitor this connection carefully as its loss would fragment the network'
            });
        }
        
        // Based on isolated clusters
        for (const pattern of patterns.isolated || []) {
            recommendations.push({
                type: 'isolated_cluster',
                severity: 'medium',
                description: `Isolated cluster of ${pattern.size} nodes detected`,
                suggestion: 'Consider connecting this cluster to the main network if clinically relevant'
            });
        }
        
        return recommendations;
    }
    
    async findPaths(startId, endId, options = {}) {
        if (!this.graph) return null;
        
        const algorithm = options.algorithm || 'dijkstra';
        const pathFinder = new PathFinder();
        
        return pathFinder.find(this.graph, startId, endId, algorithm);
    }
    
    async findKShortestPaths(startId, endId, k = 3) {
        if (!this.graph) return null;
        
        const pathFinder = new PathFinder();
        return pathFinder.findKShortestPaths(this.graph, startId, endId, k);
    }
    
    async extractSubgraph(nodeIds, depth = 2) {
        if (!this.graph) return null;
        
        return this.graph.extractSubgraph(nodeIds, depth);
    }
    
    getVisualizationData() {
        if (!this.graph) return { nodes: [], edges: [] };
        
        return this.graph.getVisualizationData();
    }
    
    async exportGraph(format = 'json') {
        if (!this.graph) return null;
        
        switch (format) {
            case 'json':
                return this.graph.toJSON();
            case 'gexf':
                return this.exportToGEXF();
            case 'graphml':
                return this.exportToGraphML();
            default:
                return this.graph.toJSON();
        }
    }
    
    exportToGEXF() {
        // GEXF format export
        const nodes = Array.from(this.graph.nodes.values());
        const edges = Array.from(this.graph.edges.values());
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
    <graph mode="static" defaultedgetype="undirected">
        <nodes>
            ${nodes.map(node => `
            <node id="${node.id}" label="${node.label}">
                <attvalues>
                    <attvalue for="type" value="${node.type}"/>
                    <attvalue for="severity" value="${node.data.severity || 0}"/>
                </attvalues>
            </node>`).join('')}
        </nodes>
        <edges>
            ${edges.map(edge => `
            <edge id="${edge.id}" source="${edge.source}" target="${edge.target}" weight="${edge.strength / 100}"/>`).join('')}
        </edges>
    </graph>
</gexf>`;
    }
    
    exportToGraphML() {
        // GraphML format export
        const nodes = Array.from(this.graph.nodes.values());
        const edges = Array.from(this.graph.edges.values());
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
    <key id="type" for="node" attr.name="type" attr.type="string"/>
    <key id="severity" for="node" attr.name="severity" attr.type="double"/>
    <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
    <graph id="clinical_graph" edgedefault="undirected">
        ${nodes.map(node => `
        <node id="${node.id}">
            <data key="type">${node.type}</data>
            <data key="severity">${node.data.severity || 0}</data>
        </node>`).join('')}
        ${edges.map(edge => `
        <edge source="${edge.source}" target="${edge.target}">
            <data key="weight">${edge.strength / 100}</data>
        </edge>`).join('')}
    </graph>
</graphml>`;
    }
    
    async importGraph(data, format = 'json') {
        switch (format) {
            case 'json':
                return this.loadGraph(data);
            case 'gexf':
                return this.importFromGEXF(data);
            case 'graphml':
                return this.importFromGraphML(data);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    
    importFromGEXF(xmlString) {
        // Parse GEXF XML
        // Simplified implementation
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        const graphData = {
            nodes: [],
            edges: []
        };
        
        // Parse nodes
        const nodeElements = xmlDoc.getElementsByTagName('node');
        for (let i = 0; i < nodeElements.length; i++) {
            const node = nodeElements[i];
            graphData.nodes.push({
                id: node.getAttribute('id'),
                label: node.getAttribute('label'),
                data: {
                    category: 'imported',
                    severity: 50
                }
            });
        }
        
        // Parse edges
        const edgeElements = xmlDoc.getElementsByTagName('edge');
        for (let i = 0; i < edgeElements.length; i++) {
            const edge = edgeElements[i];
            graphData.edges.push({
                id: edge.getAttribute('id'),
                source: edge.getAttribute('source'),
                target: edge.getAttribute('target'),
                strength: parseFloat(edge.getAttribute('weight')) * 100 || 50
            });
        }
        
        return this.loadGraph(graphData);
    }
    
    importFromGraphML(xmlString) {
        // Similar to GEXF import
        return this.importFromGEXF(xmlString); // Simplified
    }
    
    // Cleanup
    destroy() {
        if (this.layout) {
            this.layout.stop();
        }
        
        if (this.worker) {
            this.worker.terminate();
        }
        
        this.graph = null;
        this.layout = null;
        this.communityDetector = null;
        this.pathFinder = null;
        this.centralityCalculator = null;
        this.patternDetector = null;
        this.cache = null;
        this.worker = null;
        this.batchProcessor = null;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ClinicalGraphEngine,
        Graph,
        ForceDirectedLayout,
        CommunityDetector,
        PathFinder,
        CentralityCalculator,
        PatternDetector,
        GraphCache,
        GraphWorker,
        BatchProcessor
    };
}

if (typeof window !== 'undefined') {
    window.ClinicalGraphEngine = ClinicalGraphEngine;
}

console.log('Clinical Graph Engine v4.0 - Complete network architecture loaded');
                      
