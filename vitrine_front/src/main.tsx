import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/global.css";
import { pages, type PageId } from "./routes";
import { HomePage } from "./pages/Home";
import { CreatePage, DeployPage, DocumentsPage } from "./pages/Product";
import { UseCasesPage } from "./pages/UseCases";
import { PricingPage } from "./pages/Pricing";
import { UpdatesPage } from "./pages/Updates";
import { AboutPage } from "./pages/About";
import { SecurityPage } from "./pages/Security";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFound";

const components: Record<PageId, ComponentType> = {
  accueil: HomePage,
  creer: CreatePage,
  documents: DocumentsPage,
  deployer: DeployPage,
  "cas-usage": UseCasesPage,
  tarifs: PricingPage,
  "mises-a-jour": UpdatesPage,
  "a-propos": AboutPage,
  securite: SecurityPage,
  contact: ContactPage,
};

// shortcut: routage côté client (vercel.json renvoie tout vers index.html), titre et description posés en JS ;
// passer à un rendu statique par page si le référencement des pages secondaires devient un enjeu.
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const id = (Object.keys(pages) as PageId[]).find((key) => pages[key].path === path);
const Page = id ? components[id] : NotFoundPage;

if (id) {
  document.title = pages[id].title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", pages[id].description);
} else {
  document.title = "Page introuvable — GenRAG";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
