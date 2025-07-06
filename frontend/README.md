# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Streams (how we read AI response)
- [Mozilla docs: Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)


# Routes rules
/path/to/route/pagename => /path/to/route/pagename/pagename**Page**.jsx (the Page makes it the main file in this folder)  
/path/to/route/pagename/components => Files specific to the *Page.jsx to be used
/path/to/route/components =>  files to be used by all subfolders of that route
/path/to/route/pagename/another/[path]/[path]Page.jsx
