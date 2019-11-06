<template>
    <div id="gleif-network" class="mt-3">
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="mx-0"
                       v-on="on"
                       @click="$refs.network.setZoom(0.1)"
                       :flat="!graph"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark>add</v-icon>
                </v-btn>
            </template>
            <span>Zoom in</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="mr-0"
                       v-on="on"
                       @click="$refs.network.setZoom(-0.1)"
                       :flat="!graph"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark>remove</v-icon>
                </v-btn>
            </template>
            <span>Zoom out</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="mr-0"
                       v-on="on"
                       @click="$refs.network.resetZoom()"
                       :flat="!graph"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark>my_location</v-icon>
                </v-btn>
            </template>
            <span>Reset zoom</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="ml-5 mr-0"
                       v-on="on"
                       @click="$refs.network.toggleName(); showingLEI = !showingLEI"
                       :flat="!graph"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark>{{ showingLEI ? 'font_download' : 'looks_3' }}</v-icon>
                </v-btn>
            </template>
            <span>Display {{ showingLEI ? 'company name' : 'LEI' }}</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="mr-0"
                       v-on="on"
                       @click="$refs.network.downloadGraph()"
                       :flat="!graph"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark style="transform: rotate(180deg)">publish</v-icon>
                </v-btn>
            </template>
            <span>Download graph</span>
        </v-tooltip>
        <v-dialog
                v-model="dialog"
                min-width="500"
                max-width="700"
        >
            <template v-slot:activator="{ on }">
                <v-btn icon dark color="accent" class="mr-0"
                       :flat="!graph"
                       v-on="on"
                       :class="{'disable-events': !graph}"
                >
                    <v-icon dark>share</v-icon>
                </v-btn>
            </template>

            <v-card>
                <v-card-text class="mb-0 pb-0">
                    <v-text-field :label="shareURL" outline disabled class="mb-1 pb-1"></v-text-field>
                    <p v-if="showCopied" class="my-0 py-0 turquoise--text">Copied!</p>
                </v-card-text>

                <v-card-actions class="pr-3 pt-0 mt-0">
                    <v-spacer></v-spacer>
                    <v-btn
                            color="accent"
                            @click="dialog = false;showCopied = false"
                    >
                        Close
                    </v-btn>
                    <v-btn
                            color="turquoise"
                            dark
                            @click="copyToClipboard"
                    >
                        Copy
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--
            TODO: INCLUDED IN THE NEXT RELEASE
        <v-btn dark color="accent" class="mr-0 right"
               :flat="!graph || Math.max.apply(null, graph.nodes.map(o => o.level)) < 5"
               :class="{'disable-events': !graph || Math.max.apply(null, graph.nodes.map(o => o.level)) < 5}"
               @click="expanded ? collapseNetwork($store.getters['leiOfInterest']) : expandNetwork()">
            {{expanded ? 'Collapse Network' : 'Expand Network'}}
        </v-btn>
        -->
        <h3 class="mt-4" v-if="!graph">Please search for an entity to create a network.</h3>
        <Network
                ref="network"
                :nodes="network.nodes"
                :edges="network.edges"
                :groups="network.groups"
                :options="network.options">
        </Network>
    </div>

</template>


<script>
    import Network from './charts/NetworkChart'

    const data = require('../data/artificial.json');

    const setEdgeStyle = function (element) {
        if (element['label'].length > 0) {
            element['text'] = element['label'];
            element['label'] = '';
        }
        element['color'] = {};
        if(element['text'] === 'IS_DIRECTLY_CONSOLIDATED_BY') {
            element['color']['color'] = "#878787";
        }
        if(element['text'] === 'IS_ULTIMATELY_CONSOLIDATED_BY') {
            element['color']['color'] = "#878787";
            element['dashes'] = true;
        }
        if(element['text'] === 'IS_INTERNATIONAL_BRANCH_OF') {
            element['color']['color'] = "#878787";
        }
        element['color']['highlight'] = "#00ace9";
        element['color']['hover'] = "#00ace9";
    };

    function get_options() {
        return {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'LR',
                    levelSeparation: 400
                }
            },
            edges: {
                smooth: {
                    enabled: true,
                    type: "cubicBezier"
                },
                color: {
                },
                arrows: {
                    to: {
                        enabled: false
                    }
                },
                width: 5
            },
            nodes: {
                color: {
                    border: "#46618b",
                    background: "#46618b",
                    highlight: "#00ace9",
                    hover: "#00ace9"
                },
                font: {
                    color: "#ffffff",
                    face: "'Overpass Mono', 'monospace'"
                },
                shape: "box",
                margin: 10
            },
            interaction: {
                selectConnectedEdges: false
            }
        }

    }

    export default {
        data: () => ({
            networkEvents: '',
            expanded: true,
            loading: false,
            showingLEI: false,
            dialog: false,
            showCopied: false
        }),
        computed: {
            graph : function () {
                return this.$store.getters["graph"];
            },
            network: function () {
                if (this.graph) {
                    this.graph.edges.forEach(element => setEdgeStyle(element));
                }
                return {
                    nodes: this.graph['nodes'],
                    edges: this.graph.edges,
                    options: get_options(),
                }
            },
            shareURL: function () {
                return window.location.protocol + "//" + window.location.host + "?lei=" + this.$store.getters['leiOfInterest'];
            }
        },
        components: {
            Network,
        },
        methods: {
            collapseNetwork (id) {
                this.expanded = false;
                this.$refs.network.unselectAll();
                let node_of_interest = this.network.nodes.find(o => o.id === id);
                let level_of_interest = node_of_interest.level;
                let nodes = [];
                let lower = {
                    id: "lower",
                    level: 1,
                    label: "...",
                    title: "...",
                    cluster: true,
                    nodes: [],
                    shape: "ellipse"
                };
                let upper  = {
                    id: "upper",
                    level: level_of_interest < 3 ? 4 : 5,
                    label: "...",
                    title: "...",
                    cluster: true,
                    nodes: [],
                    shape: "ellipse"
                };
                for (let node of this.network.nodes) {
                    let n = JSON.parse(JSON.stringify(node));
                    if (node.level === 0) {
                        nodes.push(n)
                    } else if (node.level < level_of_interest - 1) {
                        lower.nodes.push(n);
                    } else if (node.level > level_of_interest + 1) {
                        upper.nodes.push(n);
                    } else {
                        nodes.push(n);
                    }
                }
                if (lower.nodes.length > 0) {
                    let diff = level_of_interest - 3;
                    for (let i in nodes) {
                        nodes[i].level = Math.max(nodes[i].level - diff, 0);
                    }
                    nodes.push(lower);
                } else {
                    let diff = level_of_interest - 2;
                    for (let i in nodes) {
                        nodes[i].level = Math.max(nodes[i].level - diff, 0);
                    }
                }
                nodes.push(upper);
                let edges = [];
                for (let edge of this.network.edges) {
                    let e = JSON.parse(JSON.stringify(edge));
                    if (upper.nodes.map(o => o.id).includes(e.from)) {
                        e.from = upper.id;
                    } else if (lower.nodes.map(o => o.id).includes(e.from)) {
                        e.from = lower.id;
                    } else if (upper.nodes.map(o => o.id).includes(e.to)) {
                        e.to = upper.id;
                    } else if (lower.nodes.map(o => o.id).includes(e.to)) {
                        e.to = lower.id;
                    }
                    setEdgeStyle(e);
                    if (!(edges.map(o => o.from).includes(e.from) && edges.map(o => o.to).includes(e.to))) edges.push(e)
                }
                this.network.nodes = nodes;
                this.network.edges = edges;
            },
            expandNetwork () {
                this.expanded = true;
                this.$refs.network.unselectAll();
                this.network.nodes = this.graph.nodes;
                this.network.edges = this.graph.edges;
            },
            copyToClipboard () {
                // Create new element
                let el = document.createElement('textarea');
                // Set value (string to be copied)
                el.value = this.shareURL;
                // Set non-editable to avoid focus and move outside of view
                el.setAttribute('readonly', '');
                el.style = {position: 'absolute', left: '-9999px'};
                document.body.appendChild(el);
                // Select text inside element
                el.select();
                // Copy text to clipboard
                document.execCommand('copy');
                // Remove temporary element
                document.body.removeChild(el);
                // show tooltip
                this.showCopied = true;
            }
        }
    };


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .disable-events {
        pointer-events: none;
    }
</style>
