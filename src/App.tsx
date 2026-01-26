import { Switch, Route, Redirect } from 'wouter'
import ExplorerPage from './pages/ExplorerPage'
import BuilderPage from './pages/BuilderPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Switch>
      <Route path="/" component={ExplorerPage} />
      <Route path="/build" component={BuilderPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  )
}

export default App
