* Frontend is using vite to build and deploy. So to build, use `vite build`
* When styling, use TailwindCSS
* Use the components/atoms folder to manage and organize repeatable components at their basic levels. For example if all h1 should have the same style, create an atom called MainTitle with only h1 and its style. return <h1 className="some tailwindcss classnames">{children}</h1>
* frontend is using Redux to maintain state and react-router-dom to handle navigation. If an piece of information is part of the url, then this is how you will maintain state for that piece of info.
  For example, user scores, maintain in Redux. Current game name, maintain in the url /game/{some game name}/
* In reactjs `require` is not a keyword. `import` and `export` are what is used.
* Each game you develop, test it's logic in the test component you have created. Test the game after each change.
