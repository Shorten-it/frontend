import { Header } from './components/Header';
import { UrlShortener } from './components/UrlShortener';
import { UrlHistory } from './components/UrlHistory';
import { useUrlHistory } from './hooks/useUrlHistory';

function App() {
  const { history, addItem, removeItem, clearHistory } = useUrlHistory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main className="px-4 py-12">
        <UrlShortener onShorten={addItem} />
        <UrlHistory history={history} onRemove={removeItem} onClear={clearHistory} />
      </main>
      <footer className="text-center py-6 text-sm text-gray-400 dark:text-gray-600">
        Shortly &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
