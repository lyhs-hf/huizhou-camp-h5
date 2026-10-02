import { createContext, useContext, useReducer, type ReactNode } from "react";
import type {
  SceneId,
  ExpectationType,
  InteractionId,
  JourneyStamp,
  LeadState,
} from "../content/types";
interface JourneyState {
  currentScene: SceneId;
  expectation: ExpectationType | null;
  completedInteractions: InteractionId[];
  collectedStamps: JourneyStamp[];
  soundEnabled: boolean;
  resultGenerated: boolean;
  leadState: LeadState;
  locked: boolean;
  direction: number;
  observation: { discovery: string; question: string } | null;
  inkGold: number[][];
}
type Action =
  | { type: "scene"; scene: SceneId }
  | { type: "expectation"; value: ExpectationType }
  | { type: "complete"; id: InteractionId; stamp: JourneyStamp }
  | { type: "lock"; value: boolean }
  | { type: "retry"; id: InteractionId }
  | { type: "sound"; value: boolean }
  | { type: "result" }
  | { type: "observation"; discovery: string; question: string }
  | { type: "inkGold"; value: number[][] }
  | { type: "lead"; value: LeadState };
const initial: JourneyState = {
  currentScene: 0,
  expectation: null,
  completedInteractions: [],
  collectedStamps: [],
  soundEnabled: false,
  resultGenerated: false,
  leadState: "idle",
  locked: false,
  direction: 1,
  observation: null,
  inkGold: [[], [], []],
};
function reducer(state: JourneyState, action: Action): JourneyState {
  switch (action.type) {
    case "scene":
      return {
        ...state,
        currentScene: action.scene,
        locked: false,
        direction: action.scene >= state.currentScene ? 1 : -1,
      };
    case "expectation":
      return { ...state, expectation: action.value };
    case "lock":
      return { ...state, locked: action.value };
    case "complete":
      return {
        ...state,
        completedInteractions: [
          ...new Set([...state.completedInteractions, action.id]),
        ],
        collectedStamps: [...new Set([...state.collectedStamps, action.stamp])],
      };
    case "retry":
      return { ...state, completedInteractions: state.completedInteractions.filter(id => id !== action.id), inkGold: action.id === "ink" ? [[], [], []] : state.inkGold };
    case "sound":
      return { ...state, soundEnabled: action.value };
    case "result":
      return { ...state, resultGenerated: true };
    case "observation":
      return { ...state, observation: { discovery: action.discovery, question: action.question } };
    case "inkGold":
      return { ...state, inkGold: action.value.map(branch => [...branch]) };
    case "lead":
      return { ...state, leadState: action.value };
  }
}
const Context = createContext<{
  state: JourneyState;
  dispatch: React.Dispatch<Action>;
} | null>(null);
export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}
export function useJourney() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing journey provider");
  return c;
}
