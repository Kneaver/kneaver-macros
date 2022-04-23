### to install the project:

npm install

### to package it:

npm run build

package ends up in dist/ made of multiple chunks 

It must then we served and added to plugins settings

### to serve it in development mode

npm start

- add the link to plugins list

http://localhost:3011

- hot reload is enabled, changes will be applied as you type

## structure

The entry point is *index.ts*
For module federation reason *index.ts* is nothing else than an import of *bootstrap.ts*
Don't change anything in *index.ts* or *bootstrap.ts*

The plugin entry point is *root.tsx*. That's where the real work starts.

The plugin delivers all it's structure by returning a complex javascript object from the default function *factory¨.

There are no other entry points, starting from there the structure of the module is free.

## underlying techniques

- the plugin is build and served using webpack
- the language is typescript. It's recommended but not a necessity. 
- preferred UI framework is React bit it's not a necessity

