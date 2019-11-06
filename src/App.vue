<template>
  <div id="app">
    <v-app>
      <Navbar />
      <div class="pa-3">
        <Search />
        <VisNetwork />
      </div>
    </v-app>
  </div>
</template>

<script>
  import Navbar from './components/Navbar'
  import VisNetwork from './components/Network.vue'
  import Search from './components/Search'
  export default {
    name: 'app',
    components: {
      Navbar,
      VisNetwork,
      Search
    }
  }

</script>

<style>
  .gleif-blue {
    background-color:  #4e608a;
  }
</style>
