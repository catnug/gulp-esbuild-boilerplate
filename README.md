<div align="center">
	<img src="./_readmeFiles/gulp.png" style="height:70px;"/>
	<img src="./_readmeFiles/esbuild.png" style="height:70px;"/>
</div>



# gulp-esbuild-boilerplate
>Boilerplate to ease your build flow with the power of [esbuild](https://esbuild.github.io/) 💪. Not dependant such slow and dated things 🫢

## Pre-acceptance
- Project file structure could break this build flow. Dependecies could be shown in `gulpfile.cjs` file.
>📢Note : If you are not sure of what to do just keep the protect's folder structure

```bash
.
├── .browserslistrc
├── .gitignore
├── .prettierrc
├── gulpfile.cjs
├── package-lock.json
├── package.json
└── src
    ├── assets
    │   ├── images
    │   │   ├── img
    │   │   └── svg
    │   ├── pug
    │   │   ├── about.pug
    │   │   ├── base
    │   │   ├── includes
    │   │   ├── index.pug
    │   │   └── templates
    │   ├── scripts
    │   │   ├── data.js
    │   │   └── index.js
    │   └── styles
    │       ├── partials
    │       └── style.scss
    └── favicon-32x32.png
```

- This flow assumes that you have one JavaScript entry point (using ESM for sure) and one .scss/.sass file. Otherwise, every bundled .css and .js files are injected to generated .html documents.

## How to use
in order to launch the project
```bash
npm i
npm run gulp:dev
```

when you want to use this boilder plate for your development, you should follow the instruction decribed in [gulp-inject](https://github.com/klei/gulp-inject), when injecting `<script>` and `<link>` element in your .pug files.

## Output
As an output of this flow, you get these, in `public` folder, mentioned below :

- a fat bundled (as IIFE), minified, transformed according to `.browserslistrc`, hash-named **.js file**
- a fat bundled, minified, transformed according to `.browserslistrc`, autoprefixed **.css file**
- .html files include bundled .js and .css file references
- minified image files

so, good luck then byee 👋