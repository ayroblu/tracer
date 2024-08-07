import { useSetAtom } from "jotai";
import * as React from "react";
import { fileAtom } from "./source-trace.ts";

export const FileInput = React.memo(() => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const setFile = useSetAtom(fileAtom);
  const [isLoading, setIsLoading] = React.useState(false);

  const fileOnChange = React.useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setIsLoading(true);
      const fileContents = await readFilePromise(file);
      const traces = fileContents.split("\n").map((line) => JSON.parse(line));
      setFile(traces);
      setIsLoading(false);
    }
  }, [setFile]);
  return (
    <label>
      Upload file:
      <input onChange={fileOnChange} ref={fileInputRef} type="file" />
      {isLoading ? "Loading..." : null}
    </label>
  );
});

function readFilePromise(file: File): Promise<string> {
  const reader = new FileReader();

  reader.readAsText(file);

  return new Promise((resolve, reject) => {
    reader.onload = function () {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new Error(`expected type string got type ${typeof reader.result}`),
        );
      }
    };

    reader.onerror = function () {
      reject(reader.error);
    };
  });
}
