import React, { Suspense } from "react"
import ReactDOM from "react-dom/client"
import { SceneProvider } from "./components/SceneContext"

import App from "./App"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
            <SceneProvider>
                <Suspense>
                  <App />
                </Suspense>
            </SceneProvider>
  </React.StrictMode>,
)
