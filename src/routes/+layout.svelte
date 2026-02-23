<script lang="ts">
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    </script>
  
  <div class="app">
    <Header />
  
    <main>
      <slot />
    </main>
  
    <Footer />
  </div>
  
  <style>
    .app {
      display: flex;
      flex-direction: column;
      min-height: 50vh;
    }
  
    main {
      padding: 1rem 0rem 1rem 0rem;
    }

  </style>
  