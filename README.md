# Wooting Double Movement

One-click install for getting double movement in Fortnite.

## Read this first

**Go to the [main page](https://wooting.io/double-movement) for download and setup.** This page is aimed at developers who want to report issues or contribute to the code.

## Project stack

The project uses Rust to interact with [ViGEm](https://github.com/ViGEm). ViGEm is a Windows kernel-mode driver that emulates USB game controllers. The GUI is made with Electron / React / Typescript.

## Contributing

You can always open an issue if you encounter any problems. Looking to add something you created? If it's a small change (i.e. text change or bug fix) feel free to open a PR anytime. If you want to add a feature, please open an issue to discuss with the community first.

## Dependencies

- [Rust](https://www.rust-lang.org/)
- Node (Recommend using nvm and latest v10 node)
- [Yarn](https://yarnpkg.com/)
- VS 2019 C++ Desktop development package

## Building

Firstly run yarn to install all the dependencies

```
yarn
```

### Devving

First start the dev server which watches for changes and recompiles

```
yarn dev
```

Start the application (you'll need to use a different terminal instance than the `yarn dev`)

```
yarn start
```

### Deploying

Make a production build of all the code

```
yarn build
```

Build it into a package

```
yarn dist
```
