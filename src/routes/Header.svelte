<script lang="ts">
  import Paper, { Title } from '@smui/paper';
</script>

<header>
  <Paper>
    <Title>
      <div class="header-div">
        <img class="logo" src="./DigiCertLogo_MainNavigation.svg" alt="Digicert logo" />
        <h1>svelte-ui-template</h1>
      </div>
    </Title>
  </Paper>
</header>

<style>
  .header-div {
    display: flex;
  }
  .logo {
    width: 8rem;
    padding: 0rem 8rem 0rem 2rem;
  }
  h1 {
    font-size: 1em;
  }
</style>
