import styles from "./App.module.css";
import { TraceViewer } from "./trace-viewer/TraceViewer.tsx";

function App() {
  return (
    <>
      <p className={styles.center}>
        Basically view traces, upload button (+download), demo trace, and demo
        big trace
      </p>
      <TraceViewer />
    </>
  );
}

export default App;
