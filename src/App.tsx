import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import SpecialEffects from "./components/feature/SpecialEffects";
import ExpirationChecker from "./components/feature/ExpirationChecker";
import { BranchProvider } from "./contexts/BranchContext";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <BranchProvider>
          <SpecialEffects />
          <ExpirationChecker />
          <AppRoutes />
        </BranchProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
