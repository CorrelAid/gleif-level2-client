<template>
    <div>
        <div ref="visualization" id="gleif-network"></div>
        <div v-if="entity">
            <v-list class="background" ref="entityDetails">
                <h1 class="ml-3">Details</h1>
                <div class="mx-3">
                <v-progress-linear :indeterminate="true"
                    v-if="loadingEntity"
                ></v-progress-linear>
                </div>
                <v-expand-transition>
                    <div v-if="error" class="error ma-3 pa-3">
                        <h4 v-text="error"></h4>
                    </div>
                </v-expand-transition>
                <div v-if="entityLEI">
                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-sub-title class="accent--text">LEI</v-list-tile-sub-title>
                            <v-list-tile-title v-text="entityLEI" class="black--text"></v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </div>
                <h3 class="ml-3" v-if="!entityLEI && !loadingEntity">Please select a node to see further details.</h3>
                <v-expand-transition>
                    <div v-if="showDetails">
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-sub-title class="accent--text">Legal Name</v-list-tile-sub-title>
                                <v-list-tile-title v-text="entity.attributes.entity.legalName.name" class="black--text"></v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-sub-title class="accent--text">Legal Address</v-list-tile-sub-title>
                                <v-list-tile-title class="black--text">
                                    {{ entity.attributes.entity.legalAddress.addressLines[0] }},
                                    {{ entity.attributes.entity.legalAddress.postalCode }}
                                    {{ entity.attributes.entity.legalAddress.city }},
                                    {{ entity.attributes.entity.legalAddress.country }}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-sub-title class="accent--text">Jurisdiction</v-list-tile-sub-title>
                                <v-list-tile-title class="black--text">
                                    {{ entity.attributes.entity.jurisdiction }}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-sub-title class="accent--text">Status</v-list-tile-sub-title>
                                <v-list-tile-title v-text="entity.attributes.entity.status" class="black--text"></v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </div>
                </v-expand-transition>
           
                <div style="clear: both"></div>
            </v-list>
        </div>
        <a id="download-link" style="display: none"></a>
    </div>
</template>

<script>
    /*
        The code for this component was copied from https://github.com/alexcode/vue2vis.
        Some parts were adjusted to match our use case.
     */
    import { DataSet, DataView, Network } from 'vis';
    import { mountVisData, translateEvent } from './utils';
    import axios from 'axios';

    export default {
        name: 'network',
        props: {
            edges: {
                type: [Array, DataSet, DataView],
                default: () => []
            },
            nodes: {
                type: [Array, DataSet, DataView],
                default: () => []
            },
            events: {
                type: Array,
                default: () => [
                    'click',
                    'doubleClick',
                    'oncontext',
                    'hold',
                    'release',
                    'select',
                    'selectNode',
                    'selectEdge',
                    'deselectNode',
                    'deselectEdge',
                    'dragStart',
                    'dragging',
                    'dragEnd',
                    'hoverNode',
                    'blurNode',
                    'hoverEdge',
                    'blurEdge',
                    'zoom',
                    'showPopup',
                    'hidePopup',
                    'startStabilizing',
                    'stabilizationProgress',
                    'stabilizationIterationsDone',
                    'stabilized',
                    'resize',
                    'initRedraw',
                    'beforeDrawing',
                    'afterDrawing',
                    'animationFinished',
                    'configChange'
                ],
            },
            options: {
                type: Object,
                default: () => ({})
            }
        },
        data: () => ({
            visData: {
                nodes: null,
                edges: null
            },
            original_zoom: 0.2,
            highlight_node: '14',
            showDetails: false,
            entity: false,
            error: false,
            entityLEI: false,
            loadingEntity: false
        }),
        watch: {
            options: {
                deep: false,
                handler(o) {
                    this.network.setOptions(o);
                }
            }
        },
        methods: {
            setData(n, e) {
                this.visData.nodes = Array.isArray(n) ? new DataSet(n) : n;
                this.visData.edges =  Array.isArray(e) ? new DataSet(e) : e;
                this.network.setData(this.visData);
            },
            destroy() {
                this.network.destroy();
            },
            getNode(id) {
                return this.visData.nodes.get(id);
            },
            getEdge(id) {
                return this.visData.edges.get(id);
            },
            setOptions(options) {
                this.network.setOptions(options);
            },
            on(event, callback) {
                this.network.moveTo(event, callback);
            },
            off(event, callback) {
                this.network.moveTo(event, callback);
            },
            once(event, callback) {
                this.network.moveTo(event, callback);
            },
            canvasToDom(p) {
                return this.network.canvasToDOM(p);
            },
            domToCanvas(p) {
                return this.network.DOMtoCanvas(p);
            },
            redraw() {
                this.network.redraw();
            },
            setSize(w, h) {
                this.network.setSize(w, h);
            },
            cluster(options) {
                this.network.cluster(options);
            },
            clusterByConnection(nodeId, options) {
                this.network.clusterByConnection(nodeId, options);
            },
            clusterByHubsize(hubsize, options) {
                this.network.clusterByHubsize(hubsize, options);
            },
            clusterOutliers(options) {
                this.network.clusterOutliers(options);
            },
            findNode(id) {
                return this.network.findNode(id);
            },
            getClusteredEdges(baseEdgeId) {
                return this.network.clustering.getClusteredEdges(baseEdgeId);
            },
            getBaseEdge(clusteredEdgeId) {
                return this.network.clustering.getBaseEdge(clusteredEdgeId);
            },
            getBaseEdges(clusteredEdgeId) {
                return this.network.clustering.getBaseEdges(clusteredEdgeId);
            },
            updateEdge(startEdgeId, options) {
                this.network.clustering.updateEdge(startEdgeId, options);
            },
            updateClusteredNode(clusteredNodeId, options) {
                this.network.clustering.updateClusteredNode(clusteredNodeId, options);
            },
            isCluster(nodeId) {
                return this.network.isCluster(nodeId);
            },
            getNodesInCluster(clusterNodeId) {
                return this.network.getNodesInCluster(clusterNodeId);
            },
            openCluster(nodeId, options) {
                this.network.openCluster(nodeId, options);
            },
            getSeed() {
                return this.network.getSeed();
            },
            enableEditMode() {
                this.network.enableEditMode();
            },
            disableEditMode() {
                this.network.disableEditMode();
            },
            addNodeMode() {
                this.network.addNodeMode();
            },
            editNode() {
                this.network.editNode();
            },
            addEdgeMode() {
                this.network.addEdgeMode();
            },
            editEdgeMode() {
                this.network.editEdgeMode();
            },
            deleteSelected() {
                this.network.deleteSelected();
            },
            getPositions(nodeIds) {
                return this.network.getPositions(nodeIds);
            },
            storePositions() {
                this.network.storePositions();
            },
            moveNode(nodeId, x, y) {
                this.network.moveNode(nodeId, x, y);
            },
            getBoundingBox(nodeId) {
                return this.network.getBoundingBox(nodeId);
            },
            getConnectedNodes(nodeId, direction) {
                return this.network.getConnectedNodes(nodeId, direction);
            },
            getConnectedEdges(nodeId) {
                return this.network.getConnectedEdges(nodeId);
            },
            startSimulation() {
                this.network.startSimulation();
            },
            stopSimulation() {
                this.network.stopSimulation();
            },
            stabilize(iterations) {
                this.network.stabilize(iterations);
            },
            getSelection() {
                return this.network.getSelection();
            },
            getSelectedNodes() {
                return this.network.getSelectedNodes();
            },
            getSelectedEdges() {
                return this.network.getSelectedEdges();
            },
            getNodeAt(p) {
                return this.network.getNodeAt(p);
            },
            getEdgeAt(p) {
                return this.network.getEdgeAt(p);
            },
            selectNodes(nodeIds, highlightEdges) {
                this.network.selectNodes(nodeIds, highlightEdges);
            },
            selectEdges(edgeIds) {
                this.network.selectEdges(edgeIds);
            },
            setSelection(selection, options) {
                this.network.setSelection(selection, options);
            },
            unselectAll() {
                this.network.unselectAll();
            },
            getScale() {
                return this.network.getScale();
            },
            getViewPosition() {
                return this.network.getViewPosition();
            },
            fit(options) {
                this.network.fit(options);
            },
            focus(nodeId, options) {
                this.network.focus(nodeId, options);
            },
            moveTo(options) {
                this.network.moveTo(options);
            },
            releaseNode() {
                this.network.releaseNode();
            },
            getOptionsFromConfigurator() {
                return this.network.getOptionsFromConfigurator();
            },
            setZoom (step) {
                let animationOptions = {
                    scale: this.network.getScale() + step,
                    animation: { duration: 300 }
                };
                this.network.view.moveTo(animationOptions);
            },
            resetZoom() {
                // define original zoom
                let animationOptions = {
                    scale: this.original_zoom,
                    animation: {duration: 300}
                };
                // update zoom
                this.network.view.moveTo(animationOptions)
            },
            downloadGraph () {
                // select canvas
                let canvas = document.querySelector('#gleif-network div.vis-network canvas');
                // compute data url from canvas
                let dataURL = canvas.toDataURL('image/png');
                // select download link
                let link = document.querySelector('#download-link');
                // define file name
                link.setAttribute('download', 'network-' + this.$store.getters['leiOfInterest'] + '.png');
                // add data url
                link.setAttribute('href', dataURL.replace('image/png', 'image/octet-stream'));
                // "download" image
                link.click();
            },
            toggleName () {
                // loop through nodes to change displayed name
                this.nodes.forEach(node => {
                    if (node.label === node.id) {
                        // if lei show name
                        node.label = node.companyName;
                    } else {
                        // if name show lei
                        node.label = node.id;
                    }
                })
            }
        },
        created() {
            this.network = null;
        },
        mounted() {

            // initialize network
            const container = this.$refs.visualization;
            this.visData.nodes = mountVisData(this, 'nodes');
            this.visData.edges = mountVisData(this, 'edges');
            this.network = new Network(container, this.visData, this.options);

            const LEI_URL = process.env.VUE_APP_LEI_URL + "";

            // set initial zoom after finding initial network position
            this.network.on('stabilizationIterationsDone', () => {
                this.original_zoom = this.network.getScale();
                if (this.nodes.length === 1) {
                    let animationOptions = {
                        scale: 1,
                        animation: { duration: 300 }
                    };
                    this.network.view.moveTo(animationOptions);
                }
            });

            this.network.on('click', (properties) => {
                // get clicked nodes
                const ids = properties.nodes;
                // unselect all nodes and edges (no highlighting)
                this.network.unselectAll();
                // if nodes not clicked finished
                if (ids.length <= 0) return;
                // find parent edges
                function findParentEdge(lei, edges, colorfulEdges) {
                    let e = edges.find(o => o.from === lei);
                    if (e) {
                        colorfulEdges.push(e);
                        return findParentEdge(e.to, edges, colorfulEdges);
                    } else {
                        return colorfulEdges;
                    }
                }
                let colorfulEdges = findParentEdge(ids[0], this.edges, []);
                // select nodes and edges of interest (highlight)
                this.network.setSelection({
                    nodes: ids,
                    edges: colorfulEdges.map(o => o.id)
                });
                // hide error
                this.error = false;
                // get entity
                this.entityLEI = ids[0];
                // do not load if already loaded
                if (this.entityLEI === this.entity.id) return;
                // show loading animation
                this.loadingEntity = true;
                // download lei details
                axios.get(`${LEI_URL}${ids[0]}`)
                    .then(response => {
                        this.entity = response.data.data;
                        this.showDetails = true;
                    })
                    .catch(error => {
                        this.error = error;
                        this.showDetails = false;
                        this.entity = false;
                    })
                    .finally(() => {
                        this.loadingEntity = false;
                    })
            });
            // add all event handlers
            this.events.forEach(eventName =>
                this.network.on(eventName, props => this.$emit(translateEvent(eventName), props))
            );
        },
        beforeDestroy() {
            this.network.destroy();
        },
    };
</script>

<style scoped>
    #gleif-network  {
        width: 100%;
        height: calc(100vh - 300px);
    }
</style>
