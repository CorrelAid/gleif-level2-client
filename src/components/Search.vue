<template>
    <v-card
            color="primary"
            dark
    >
        <v-card-text class="">
            <v-autocomplete
                    v-model="model"
                    :items="items"
                    :loading="isLoading"
                    :search-input.sync="search"
                    color="white"
                    hide-no-data
                    hide-selected
                    item-text="name"
                    item-value="lei"
                    label="Entity Search"
                    placeholder="Search for LEI, legal name or other data fields"
                    return-object
                    @input="loadEntity"
                    clearable
                    @click:clear="showDetails = false;error=false;model=null;entity=false"
                    no-data-text="Start typing to see suggestions."
            ></v-autocomplete>
        </v-card-text>
        <v-expand-transition>
            <v-list v-if="showDetails" class="background">
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-sub-title class="accent--text">LEI</v-list-tile-sub-title>
                        <v-list-tile-title v-text="entity.id" class="black--text"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-sub-title class="accent--text">Legal Name</v-list-tile-sub-title>
                        <v-list-tile-title v-text="entity.attributes.entity.legalName.name" class="black--text"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-sub-title class="accent--text">Status</v-list-tile-sub-title>
                        <v-list-tile-title v-text="entity.attributes.entity.status" class="black--text"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-sub-title class="accent--text">Legal Address Country</v-list-tile-sub-title>
                        <v-list-tile-title v-text="entity.attributes.entity.legalAddress.country" class="black--text"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-expand-transition>
        <v-expand-transition>
            <v-card-text v-if="error" class="error">
                <h4 v-text="error"></h4>
            </v-card-text>
        </v-expand-transition>
        <v-card-actions class="background">
            <v-btn
                    :color="model ? 'turquoise' : 'accent'" :flat="!model"
                    :class="{'disable-events': !model}"
                    @click="loadGraph"
                    :loading="loadingGraph"
            >
                Draw network
            </v-btn>
            <v-spacer></v-spacer>
            <v-tooltip bottom v-if="model">
                <template v-slot:activator="{ on }">
                    <v-btn
                            v-on="on"
                            light
                            @click="showDetails = !showDetails" icon>
                        <v-icon>{{ showDetails ? 'expand_less' : 'expand_more' }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ showDetails ? 'Collapse' : 'Expand' }}</span>
            </v-tooltip>
        </v-card-actions>
    </v-card>
</template>

<script>
    import axios from 'axios'

    export default {
        name: "Search",
        data: () => ({
            descriptionLimit: 60,
            entries: [],
            isLoading: false,
            model: null,
            search: null,
            entity: false,
            showDetails: false,
            loadingGraph: false,
            error: false
        }),
        computed: {
            fields () {
                if (!this.model) return [];

                return Object.keys(this.model).map(key => {
                    return {
                        key,
                        value: this.model[key] || 'n/a'
                    }
                });
            },
            items () {
                let results = [];
                this.entries.forEach(entry => {
                    if (entry.relationships) {
                        results.push({
                            name: entry.attributes.value,
                            lei: entry.relationships["lei-records"]["data"]["id"],
                            url: entry.relationships["lei-records"]["links"]["related"]
                        })
                    }
                });
                return results;
            }
        },
        watch: {
            search (val) {

                this.error = false;
                this.isLoading = true;

                // Lazily load input items
                axios.get(process.env.VUE_APP_SEARCH_URL, {
                    params: {
                        q: val,
                        field: "fulltext"
                    }
                })
                    .then(response => {
                        this.entries = response.data.data;
                    })
                    .catch(error => {
                        this.error = error;
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        },
        methods: {
            loadEntity: function () {
                // hide error
                this.error = false;
                // check if model available
                if (!this.model) return;
                // download details
                axios.get(this.model.url)
                    .then(response => {
                        this.entity = response.data.data;
                        this.showDetails = true;
                        this.$store.dispatch("setLeiOfInterest", this.entity.id);
                    })
                    .catch(error => {
                        this.error = error;
                    })
            },
            loadGraph: function () {
                // hide error
                this.error = false;
                // show loading animation
                this.loadingGraph = true;
                // download graph data
                this.$store.dispatch("downloadGraph", this.model.lei)
                    .catch(error => {
                        this.error = error;
                    })
                    .finally(() => {
                        this.loadingGraph = false;
                        this.showDetails = false;
                    });
            }
        },
        created () {
            // hide error
            this.error = false;
            // load initial search data
            axios.get(process.env.VUE_APP_SEARCH_URL, {
                params: {
                    q: "A",
                    field: "fulltext"
                }
            })
                .then(response => {
                    this.entries = response.data.data;
                })
                .catch(error => {
                    this.error = error;
                })
                .finally(() => {
                    this.isLoading = false;
                });

            // get query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const lei = urlParams.get('lei');
            // check if query parameter is provided
            if (lei) {
                // save lei
                this.$store.dispatch('setLeiOfInterest', lei);
                // show loading animation
                this.loadingGraph = true;
                // download graph
                this.$store.dispatch('downloadGraph', lei)
                    .finally(() => {
                        this.loadingGraph = false;
                        this.showDetails = false;
                    });
            }
        }
    }
</script>

<style scoped>
    .disable-events {
        pointer-events: none;
    }
</style>
