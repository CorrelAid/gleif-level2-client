import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

// initialize store
Vue.use(Vuex);

// load fake data (for testing only)
// let data = require('./data/artificial');
// let data = require('./data/UWJKFUJFZ02DKWI3RY53');
// data.nodes.forEach(node => node.companyName = node.label);


export default new Vuex.Store({
  state: {
    graph: false,
    //graph: data, // for testing only
    leiOfInterest: false
    // leiOfInterest: "UWJKFUJFZ02DKWI3RY53" // for testing only
  },
  getters: {
    graph: state => state.graph,
    leiOfInterest: state => state.leiOfInterest
  },
  mutations: {
    setGraph: (state, graph) => state.graph = graph,
    setLeiOfInterest: (state, leiOfInterest) => state.leiOfInterest = leiOfInterest
  },
  actions: {
    downloadGraph: (context, lei) => {
      const url = process.env.VUE_APP_SERVER_URL + "company/" + lei + "/structure";
      return axios.get(url)
          .then(response => {
            response.data.nodes.forEach(node => {
              node.companyName = node.label;
              if (node.id === context.state.leiOfInterest) {
                node.group = "LEIOFINTEREST";
              }
            });
            context.commit('setGraph', response.data);
          })
    },
    setLeiOfInterest: (context, leiOfInterest) => context.commit("setLeiOfInterest", leiOfInterest)
  }
})
