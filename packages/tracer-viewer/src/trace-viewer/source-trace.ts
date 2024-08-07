import { Trace } from "@ayroblu/tracer-lib";
import { atom } from "jotai";

export const fileAtom = atom<void | Trace[]>(undefined);
