import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import routes from "./config";

let navigateResolver: ((navigate: NavigateFunction) => void) | null = null;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: NavigateFunction | null;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    if (navigateResolver) {
      navigateResolver(navigate);
      navigateResolver = null; // Prevent multiple calls
    }
  }, [navigate]);
  
  return element;
}
