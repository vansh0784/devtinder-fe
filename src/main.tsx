import { createRoot } from "react-dom/client";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.tsx";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthProvider";

createRoot(document.getElementById("root")!).render(
	<Auth0Provider
		domain={import.meta.env.VITE_AUTH0_DOMAIN}
		clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
		authorizationParams={{
			redirect_uri: `${window.location.origin}/home`,
		}}
	>
		<AuthProvider>

			<NotificationProvider>
				<App />
			</NotificationProvider>
		</AuthProvider>


	</Auth0Provider>
);
