import { Switch, Route, Redirect } from 'wouter'
import ExplorerPage from './pages/ExplorerPage'
import BuilderPage from './pages/BuilderPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import NavBar from './components/NavBar'

function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      {/* Content area: add padding for side nav on desktop, bottom nav on mobile */}
      <main className="pb-20 md:pl-56 md:pb-0">
        <Switch>
          <Route path="/" component={ExplorerPage} />
          <Route path="/build" component={BuilderPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>
    </div>
  )
}

export default App
