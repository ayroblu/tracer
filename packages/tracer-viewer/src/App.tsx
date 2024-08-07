import styles from "./App.module.css";
import { FileInput } from "./trace-viewer/FileInput.tsx";
import { TraceViewer } from "./trace-viewer/TraceViewer.tsx";

function App() {
  return (
    <>
      <p className={styles.center}>
        Trace Viewer <FileInput />
      </p>
      <TraceViewer />
    </>
  );
}

export default App;
