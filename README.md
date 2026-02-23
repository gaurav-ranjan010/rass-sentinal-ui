# svelte-ui-template

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).


## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Using Template

When you create a new repo for your project, select this as your template. It has the basics to have a UI running in svelte.


### Steps for use

1. Rename everywhere you see `svelte-ui-template` to whatever your project is.
2. You'll want to setup a github actions self hosted runner for your service in order to use all of the actions in [`.github/workflows`](https://github.com/digicert/svelte-ui-template/tree/master/.github/workflows). Specifically the actions for building a docker image and pushing to our registry will need to be updated after an action runner is created for your repo
3. Develop!

### Deployment

This project is designed to be deployed in a docker container using k8s. You'll need to setup a namespace or use an existing one and then configure the github actions to properly deploy to it.