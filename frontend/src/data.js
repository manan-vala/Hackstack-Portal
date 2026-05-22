const mockUser = {
  id: "u1",
  githubId: "gh_42",
  username: "alex.dev",
  email: "alex@swc.edu",
  avatarUrl: "https://i.pravatar.cc/120?img=12",
  registeredModules: ["m1", "m2"],
  isAdmin: true
};
const modules = [
  {
    id: "m1",
    title: "HTML Foundations",
    description: "Master the building blocks of the web. Semantic structure, accessibility, and the document object model.",
    slug: "html-foundations",
    week: 1,
    color: "from-orange-500 to-red-600",
    chapters: [
      {
        id: "c1",
        day: 1,
        title: "How the Web Works",
        contentMarkdown: "## How the Web Works\n\nEvery webpage starts with a request. Your browser asks a server for a file, and the server sends back HTML.\n\n### Today's Goals\n- Understand the client-server model\n- Learn what HTTP/HTTPS means\n- Set up your dev environment (Node, VS Code)\n\n> **Task:** Open DevTools in your browser and inspect the Network tab while visiting any website. Identify at least 3 different types of requests.",
        videoUrl: "https://www.youtube.com/watch?v=zN8YNNHcaZc",
        quiz: [
          { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "HyperText Transport Page", "Hyper Transfer Text Protocol"], correctIndex: 0, points: 10 },
          { question: "What does a browser send to get a webpage?", options: ["A response", "A request", "A packet", "A file"], correctIndex: 1, points: 10 },
          { question: "Which tool lets you inspect network requests in the browser?", options: ["Terminal", "DevTools", "VS Code", "Postman"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c2",
        day: 2,
        title: "Semantic HTML",
        contentMarkdown: "## Semantic HTML\n\nSemantic elements clearly describe their meaning to both the browser and the developer.\n\n### Today's Goals\n- Use `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`\n- Understand why semantics matter for SEO and accessibility\n- Replace every `<div>` soup in a sample page\n\n```html\n<article>\n  <header>\n    <h1>My Blog Post</h1>\n  </header>\n  <p>Content goes here...</p>\n</article>\n```\n\n> **Task:** Rebuild a news article page using only semantic HTML tags.",
        quiz: [
          { question: "Which element represents the main content of a page?", options: ["<div>", "<section>", "<main>", "<body>"], correctIndex: 2, points: 10 },
          { question: "Which tag is used for navigation links?", options: ["<links>", "<nav>", "<menu>", "<header>"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c3",
        day: 3,
        title: "Forms & Inputs",
        contentMarkdown: "## Forms & Inputs\n\nForms are how users talk back to your app.\n\n### Today's Goals\n- Build accessible forms with labels\n- Understand input types: text, email, number, checkbox, radio\n- Use `<fieldset>` and `<legend>` for grouping\n\n> **Task:** Build a hackathon sign-up form with validation attributes only \u2014 no JavaScript yet.",
        quiz: [
          { question: "Which attribute makes an input required?", options: ["mandatory", "required", "must", "validate"], correctIndex: 1, points: 10 },
          { question: "What element should always pair with an <input>?", options: ["<span>", "<p>", "<label>", "<div>"], correctIndex: 2, points: 10 }
        ]
      },
      {
        id: "c4",
        day: 4,
        title: "Tables & Media",
        contentMarkdown: "## Tables & Media\n\n### Today's Goals\n- Build accessible data tables with `<thead>`, `<tbody>`, `scope`\n- Embed images, video, and audio with correct attributes\n- Use `srcset` for responsive images\n\n> **Task:** Create a leaderboard table and an embedded demo video for a product page.",
        quiz: [
          { question: "Which attribute improves table accessibility?", options: ["align", "scope", "border", "cell"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c5",
        day: 5,
        title: "Accessibility & Audit",
        contentMarkdown: "## Accessibility\n\n### Today's Goals\n- Understand WCAG 2.1 AA guidelines\n- Use ARIA roles and labels correctly\n- Run a Lighthouse accessibility audit\n\n> **Task:** Take any page you built this week and reach a Lighthouse accessibility score of 100.",
        videoUrl: "https://www.youtube.com/watch?v=HE2R86EZPMA",
        quiz: [
          { question: "What does ARIA stand for?", options: ["Accessible Rich Internet Applications", "A Rich Interactive App", "Async Render In App", "All Resources In Apps"], correctIndex: 0, points: 10 },
          { question: "What Lighthouse score should you aim for in accessibility?", options: ["70", "80", "90", "100"], correctIndex: 3, points: 10 }
        ]
      }
    ],
    assessment: {
      type: "quiz",
      questions: [
        { question: "Which element represents the main content?", options: ["<div>", "<main>", "<section>", "<body>"], correctIndex: 1, points: 10 },
        { question: "What does semantic HTML improve?", options: ["Performance", "SEO & Accessibility", "Animation speed", "File size"], correctIndex: 1, points: 10 },
        { question: "What does ARIA stand for?", options: ["Accessible Rich Internet Applications", "A Rich Interactive App", "Async Render In App", "Active Render Internet API"], correctIndex: 0, points: 10 }
      ]
    },
    learningOutcomes: [
      "Build semantic, accessible web pages",
      "Understand the client-server model and HTTP",
      "Create forms with proper validation and inputs",
      "Structure documents with correct HTML hierarchy"
    ],
    skills: ["Web Development", "Semantic HTML", "Accessibility", "Document Structure", "Forms & Inputs"],
    tools: ["VS Code", "Chrome DevTools", "HTML5", "W3C Validator"],
    finalTask: "## Final Task \u2014 Accessible Web Page\n\nBuild a fully accessible, multi-section static webpage about a topic of your choice using **only semantic HTML** \u2014 no CSS frameworks, no JavaScript.\n\n### Requirements\n- Use at least 6 different semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)\n- Every image must have a descriptive `alt` attribute\n- All form inputs must have associated `<label>` elements\n- Run a Lighthouse accessibility audit and achieve a score of **100**\n- Include at least one data table with proper `scope` attributes\n\n### Deliverable\nSubmit the link to your GitHub repository containing the `.html` file and a screenshot of your Lighthouse score."
  },
  {
    id: "m2",
    title: "CSS Mastery",
    description: "From box model basics to advanced layouts. Write CSS that scales beautifully across every screen.",
    slug: "css-mastery",
    week: 2,
    color: "from-sky-500 to-blue-700",
    chapters: [
      {
        id: "c6",
        day: 1,
        title: "Box Model & Cascade",
        contentMarkdown: "## Box Model & Cascade\n\n### Today's Goals\n- Understand margin, border, padding, content\n- Learn specificity and the cascade\n- Use `box-sizing: border-box` everywhere\n\n> **Task:** Debug a broken layout by inspecting box model values in DevTools.",
        videoUrl: "https://www.youtube.com/watch?v=rIO5326FgPE",
        quiz: [
          { question: "Which box model property is outermost?", options: ["padding", "border", "margin", "content"], correctIndex: 2, points: 10 },
          { question: "What does `box-sizing: border-box` do?", options: ["Adds a border", "Includes padding and border in width", "Removes margin", "Fixes overflow"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c7",
        day: 2,
        title: "Flexbox",
        contentMarkdown: "## Flexbox\n\n### Today's Goals\n- Understand `display: flex` and the main/cross axis\n- Use `justify-content`, `align-items`, `flex-wrap`\n- Build a responsive nav bar and card row\n\n> **Task:** Recreate the Hackstack sidebar layout using only Flexbox.",
        videoUrl: "https://www.youtube.com/watch?v=phWxA89Dy94",
        quiz: [
          { question: "Which axis does `justify-content` control?", options: ["Cross axis", "Main axis", "Z axis", "Both axes"], correctIndex: 1, points: 10 },
          { question: "What wraps flex items to the next line?", options: ["flex-flow", "flex-grow", "flex-wrap", "flex-break"], correctIndex: 2, points: 10 }
        ]
      },
      {
        id: "c8",
        day: 3,
        title: "CSS Grid",
        contentMarkdown: "## CSS Grid\n\n### Today's Goals\n- Define rows and columns with `grid-template`\n- Use `fr` units and `minmax()`\n- Place items with `grid-column` and `grid-row`\n\n> **Task:** Build the Hackstack dashboard layout (sidebar + main + cards) using Grid.",
        quiz: [
          { question: "What unit divides remaining space in Grid?", options: ["px", "%", "fr", "em"], correctIndex: 2, points: 10 }
        ]
      },
      {
        id: "c9",
        day: 4,
        title: "Responsive Design",
        contentMarkdown: "## Responsive Design\n\n### Today's Goals\n- Write mobile-first CSS\n- Use media queries effectively\n- Understand `clamp()` for fluid type\n\n> **Task:** Make your Grid layout from Day 3 responsive from 320px to 1440px.",
        quiz: [
          { question: "What approach writes CSS for small screens first?", options: ["Desktop-first", "Mobile-first", "Adaptive", "Fluid"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c10",
        day: 5,
        title: "CSS Variables & Theming",
        contentMarkdown: "## CSS Variables\n\n### Today's Goals\n- Define custom properties on `:root`\n- Build a light/dark theme switcher\n- Use `calc()` with CSS variables\n\n> **Task:** Add a working dark/light toggle to your project using only CSS variables.",
        quiz: [
          { question: "Where are CSS custom properties typically defined?", options: ["body", ":root", "html", "*"], correctIndex: 1, points: 10 },
          { question: "What syntax accesses a CSS variable?", options: ["$(--color)", "var(--color)", "@color", "#color"], correctIndex: 1, points: 10 }
        ]
      }
    ],
    assessment: {
      type: "project",
      prompt: "Build a fully responsive personal portfolio page using pure CSS \u2014 no frameworks. Deploy to GitHub Pages, Vercel, or Netlify and submit your live URL and repository link."
    },
    learningOutcomes: [
      "Master Flexbox and CSS Grid layouts",
      "Create responsive designs for all screen sizes",
      "Use CSS variables and custom properties",
      "Apply transitions and theming systems"
    ],
    skills: ["Responsive Design", "Layout Design", "CSS Animation", "Visual Design", "Mobile-First"],
    tools: ["CSS3", "Flexbox", "CSS Grid", "Chrome DevTools"],
    finalTask: "## Final Task \u2014 Responsive Portfolio Page\n\nDesign and build a **fully responsive personal portfolio page** using pure CSS \u2014 no frameworks.\n\n### Requirements\n- Layout built with **CSS Grid** for the overall structure and **Flexbox** for inner components\n- At least **two breakpoints** using media queries (mobile, tablet, desktop)\n- A working **light/dark mode toggle** powered by CSS custom properties on `:root`\n- Smooth hover and focus transitions on all interactive elements\n- Use `clamp()` for at least one fluid typography size\n\n### Deliverable\nDeploy to GitHub Pages, Vercel, or Netlify and submit the **live URL** along with your repository link."
  },
  {
    id: "m3",
    title: "JavaScript Essentials",
    description: "Go from script tags to async/await. Build real interactivity and master the language of the web.",
    slug: "javascript-essentials",
    week: 3,
    color: "from-yellow-400 to-amber-600",
    chapters: [
      {
        id: "c11",
        day: 1,
        title: "Variables, Types & Scope",
        contentMarkdown: "## Variables, Types & Scope\n\n### Today's Goals\n- Understand `let`, `const`, `var` \u2014 and why `var` is legacy\n- Primitive types: string, number, boolean, null, undefined, symbol\n- Closures and lexical scope\n\n> **Task:** Rewrite a legacy `var`-heavy codebase to use `let`/`const` correctly.",
        videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        quiz: [
          { question: "Which keyword is block-scoped?", options: ["var", "let", "function", "global"], correctIndex: 1, points: 10 },
          { question: "What is the value of an uninitialized variable?", options: ["null", "0", "undefined", "false"], correctIndex: 2, points: 10 }
        ]
      },
      {
        id: "c12",
        day: 2,
        title: "Functions & Arrow Syntax",
        contentMarkdown: "## Functions\n\n### Today's Goals\n- Function declarations vs expressions vs arrow functions\n- Default parameters and rest/spread\n- Higher-order functions: `map`, `filter`, `reduce`\n\n> **Task:** Build a leaderboard sorter using only pure functions and array methods.",
        quiz: [
          { question: "Which method transforms every element in an array?", options: ["filter", "find", "map", "reduce"], correctIndex: 2, points: 10 }
        ]
      },
      {
        id: "c13",
        day: 3,
        title: "DOM Manipulation",
        contentMarkdown: "## DOM Manipulation\n\n### Today's Goals\n- Query elements with `querySelector`\n- Modify classes, attributes, and text\n- Listen to events with `addEventListener`\n\n> **Task:** Build a live character counter for a textarea \u2014 no libraries.",
        quiz: [
          { question: "Which method selects the first matching element?", options: ["getElementById", "querySelector", "findElement", "select"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c14",
        day: 4,
        title: "Promises & Async/Await",
        contentMarkdown: "## Async JavaScript\n\n### Today's Goals\n- Understand the event loop\n- Write Promises and chain `.then()`\n- Use `async/await` with proper error handling\n\n> **Task:** Fetch GitHub user data with `async/await` and display it in your DOM.",
        videoUrl: "https://www.youtube.com/watch?v=V_Kr9OSfDeU",
        quiz: [
          { question: "What keyword pauses execution until a Promise resolves?", options: ["pause", "wait", "await", "hold"], correctIndex: 2, points: 10 },
          { question: "What handles async errors with async/await?", options: [".catch()", "try/catch", "onerror", "handleError()"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c15",
        day: 5,
        title: "Modules & Tooling",
        contentMarkdown: "## ES Modules & Tooling\n\n### Today's Goals\n- Use `import` and `export` syntax\n- Understand bundlers (Vite, webpack)\n- Set up ESLint and Prettier\n\n> **Task:** Refactor your project into multiple ES modules and bundle it with Vite.",
        quiz: [
          { question: "What keyword exports a value from an ES module?", options: ["module.exports", "export", "send", "emit"], correctIndex: 1, points: 10 }
        ]
      }
    ],
    assessment: {
      type: "quiz",
      questions: [
        { question: "What does `await` do?", options: ["Creates a Promise", "Pauses until Promise resolves", "Rejects a Promise", "Runs code in parallel"], correctIndex: 1, points: 10 },
        { question: "Which method transforms every array element?", options: ["filter", "find", "map", "reduce"], correctIndex: 2, points: 10 }
      ]
    },
    learningOutcomes: [
      "Manipulate the DOM dynamically",
      "Work with async/await and Promises",
      "Handle events and user interactions",
      "Fetch data from external APIs"
    ],
    skills: ["JavaScript", "DOM Manipulation", "Async Programming", "API Integration", "Event Handling"],
    tools: ["Node.js", "Chrome DevTools", "Fetch API", "ES6+", "Vite"],
    finalTask: "## Final Task \u2014 Interactive Web App\n\nBuild a **JavaScript-powered interactive web app** from scratch \u2014 no frameworks.\n\n### Requirements\n- Fetch data from a **public API** (e.g. GitHub, OpenWeather, PokeAPI) using `async/await`\n- Display a loading state while data is being fetched and handle errors gracefully\n- Allow users to **interact** with the data (search, filter, or sort)\n- Use ES Modules \u2014 split logic across at least **two `.js` files**\n- No jQuery or external JS libraries\n\n### Deliverable\nHost on GitHub Pages and submit both the **live URL** and **GitHub repository link**. Include a short `README.md` describing what your app does."
  },
  {
    id: "m4",
    title: "React & Modern Dev",
    description: "Build production-ready apps with React, hooks, state management, and ship them to the world.",
    slug: "react-modern-dev",
    week: 4,
    color: "from-cyan-400 to-teal-600",
    chapters: [
      {
        id: "c16",
        day: 1,
        title: "Components & Props",
        contentMarkdown: "## React Components\n\n### Today's Goals\n- Write function components\n- Pass and destructure props\n- Compose small components into larger UIs\n\n> **Task:** Build a reusable `<Card>` component used in at least 3 different ways.",
        videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
        quiz: [
          { question: "How do you pass data into a component?", options: ["state", "props", "context", "ref"], correctIndex: 1, points: 10 },
          { question: "What are React components made of?", options: ["Classes only", "Functions or Classes", "Functions only", "Objects"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c17",
        day: 2,
        title: "useState & State Patterns",
        contentMarkdown: "## useState\n\n### Today's Goals\n- Manage local state with `useState`\n- Understand immutability \u2014 never mutate state directly\n- Lift state up when siblings need to share\n\n> **Task:** Build a todo app with add, toggle, and delete \u2014 all in React state.",
        quiz: [
          { question: "What rule applies to updating state arrays?", options: ["Mutate directly", "Use a new array", "Use push()", "Use splice()"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c18",
        day: 3,
        title: "useEffect & Data Fetching",
        contentMarkdown: "## useEffect\n\n### Today's Goals\n- Run side effects after render\n- Understand dependency arrays\n- Fetch data and handle loading/error states\n\n> **Task:** Build a GitHub profile viewer that fetches on username input.",
        videoUrl: "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
        quiz: [
          { question: "When does useEffect with [] run?", options: ["Every render", "Only on mount", "On unmount", "Never"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c19",
        day: 4,
        title: "Context & Custom Hooks",
        contentMarkdown: "## Context & Hooks\n\n### Today's Goals\n- Share global state with `createContext` and `useContext`\n- Write a `useLocalStorage` custom hook\n- Know when NOT to use context\n\n> **Task:** Move your app's theme and auth state into a Context provider.",
        quiz: [
          { question: "What problem does Context solve?", options: ["Performance", "Prop drilling", "Styling", "Routing"], correctIndex: 1, points: 10 }
        ]
      },
      {
        id: "c20",
        day: 5,
        title: "Deploy & Ship",
        contentMarkdown: "## Deployment\n\n### Today's Goals\n- Build your app for production with Vite\n- Deploy to Vercel or Netlify in under 5 minutes\n- Set environment variables safely\n\n> **Task:** Deploy your hackathon project and share the live URL in the Discord.",
        quiz: [
          { question: "Which command creates a production build with Vite?", options: ["vite serve", "vite build", "vite deploy", "vite export"], correctIndex: 1, points: 10 }
        ]
      }
    ],
    assessment: {
      type: "project",
      prompt: "Build and deploy a complete React application that solves a real problem. Submit your GitHub repository URL and live demo link."
    },
    learningOutcomes: [
      "Build component-based UIs with React",
      "Manage state with hooks and context",
      "Implement routing with React Router",
      "Deploy applications to production"
    ],
    skills: ["React", "Component Design", "State Management", "Frontend Development", "Deployment"],
    tools: ["React", "Vite", "npm", "Git", "Vercel"],
    finalTask: "## Final Task \u2014 Ship a React App\n\nBuild and **deploy a complete React application** that solves a real problem or tells a story.\n\n### Requirements\n- At least **4 reusable components** with clearly defined props\n- State managed with `useState` and at least one `useContext` or custom hook\n- Data fetched from a real API using `useEffect` with proper loading and error states\n- Fully deployed to **Vercel or Netlify** with a custom project name\n- A `README.md` with setup instructions, screenshots, and a link to the live demo\n\n### Deliverable\nSubmit your **GitHub repository URL** and **live demo link**. Be prepared to do a 2-minute walkthrough of your app during the final showcase."
  }
];
const mockProgress = [
  { moduleId: "m1", completedChapters: ["c1", "c2", "c3", "c4", "c5"], quizStatus: false, score: 50, dailyScores: { c1: 30, c2: 20 } },
  { moduleId: "m2", completedChapters: ["c6"], quizStatus: false, score: 20, dailyScores: { c6: 20 } }
];
export {
  mockProgress,
  mockUser,
  modules
};
