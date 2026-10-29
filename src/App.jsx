import { useState } from "react";
import Home from "./components/Home.jsx";
import Placeholder from "./components/Placeholder.jsx";
import Wardrobe from "./components/Wardrobe.jsx";

const TABS = [
  { page: "home", label: "Home" },
  { page: "wardrobe", label: "Wardrobe" },
  { page: "match", label: "Matcher" },
  { page: "saved", label: "Saved" },
  { page: "settings", label: "Settings" },
];

function Screen({ page, go }) {
  switch (page) {
    case "wardrobe":
      return <Wardrobe />;
    case "match":
      return <Placeholder title="Outfit Matcher" stage={4}>Pick a piece and see what goes with it.</Placeholder>;
    case "style":
      return <Placeholder title="Style Me Today" stage={5}>Choose an occasion and get outfit ideas.</Placeholder>;
    case "saved":
      return <Placeholder title="Saved Looks" stage={5}>Your saved outfits will appear here.</Placeholder>;
    case "settings":
      return <Placeholder title="Settings" stage={6}>Backup, restore, privacy and delete-all will be here.</Placeholder>;
    default:
      return <Home go={go} />;
  }
}

export default function App() {
  const [page, setPage] = useState("home");
  const go = (p) => { setPage(p); window.scrollTo(0, 0); };
  return (
    <div className="app">
      <header className="top">
        <button className="brand" onClick={() => go("home")} aria-label="WearWise home">WearWise</button>
      </header>
      <main id="main">
        <Screen page={page} go={go} />
      </main>
      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.page} onClick={() => go(t.page)} aria-current={page === t.page ? "page" : undefined}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
