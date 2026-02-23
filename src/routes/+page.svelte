<script>
    import Counter from './Counter.svelte';
    import Paper from '@smui/paper';
  </script>
  
  <svelte:head>
    <title>svelte-ui-template</title>
    <meta name="description" content="svelte-ui-template" />
  </svelte:head>
  
  <Paper>
    <section>
      <h2>
        try editing <strong>src/routes/+page.svelte</strong>
      </h2>
      <Counter />
    </section>
  </Paper>
  
  <style>
    section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 0.6;
    }
  </style>
  