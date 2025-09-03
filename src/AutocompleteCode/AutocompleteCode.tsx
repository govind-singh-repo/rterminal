import { MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useDebounceValue } from "./debounce";
import getLocalSuggestions from "./localSuggestions";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { GeminiCmdSuggestor } from "./gemini";

let activeWindow: ActiveWindowPayloadType = {};
const unlisten = listen("active-window", (event) => {
    console.log("Active window event received:", event);
    activeWindow = event.payload as ActiveWindowPayloadType;
    unlisten.then((fn) => fn());
});

let geminiSuggestor = new GeminiCmdSuggestor();

function sendCommandToWindow(cmd: string, window_id: string) {
  try {
    console.log(cmd);
    invoke("send_keystrokes", { windowId: parseInt(window_id), cmd });
    getCurrentWindow().hide();
  } catch (error) {}
}

import "./autocomplete.scss";
import { getCurrentWindow } from "@tauri-apps/api/window";
import AutoWidthTextField from "./AutoWidthTextField";

type CommandPart = {
  type: "static" | "input";
  label: string;
  value: string;
  trailingSpace?: boolean;
};

function parseCommand(cmdString: string): CommandPart[] {
  const regex = /\[([^\]]+)\]/g;
  const result: CommandPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cmdString)) !== null) {
    const staticRaw = cmdString.slice(lastIndex, match.index);
    const staticPart = staticRaw.trim();
    const hasTrailingSpace = /\s$/.test(staticRaw);

    if (staticPart) {
      result.push({
        type: "static",
        label: staticPart,
        value: "",
        trailingSpace: hasTrailingSpace,
      });
    }

    result.push({
      type: "input",
      label: match[1].trim(),
      value: "",
      trailingSpace: /\s/.test(cmdString[regex.lastIndex] || ""),
    });

    lastIndex = regex.lastIndex;
  }

  const remainingRaw = cmdString.slice(lastIndex);
  const remaining = remainingRaw.trim();
  if (remaining) {
    result.push({
      type: "static",
      label: remaining,
      value: "",
      trailingSpace: false,
    });
  }

  return result;
}

function joinCommand(parts: CommandPart[]): string {
  return parts
    .map((part) => {
      const content = part.type === "input" ? part.value || `[${part.label}]` : part.label;
      return part.trailingSpace ? content + " " : content;
    })
    .join("")
    .trim();
}

interface ActiveWindowPayloadType {
  executable_path?: string;
  google_gemini_api_key?: string;
  position?: string;
  process_id?: string;
  process_name?: string;
  window_id?: string;
}

const ShellTypes = ["Powershell", "cmd", "bash"] as const;
interface AutocompleteState {
  inputValue: string;
  suggestions: { description?: string; cmd: string }[];
  selectedIndex: number;
  selectedCmd: CommandPart[];
  mode: "search" | "selection" | "cmd";
  activeWindow: ActiveWindowPayloadType;
  inputType: (typeof ShellTypes)[number];
}
const initialState: AutocompleteState = {
  inputValue: "",
  suggestions: [],
  selectedIndex: -1,
  mode: "search",
  selectedCmd: [],
  inputType: "cmd",
  activeWindow: {},
};

export default function AutocompleteCode() {
  const [state, updateState] = useState<AutocompleteState>(initialState);
  const setState = (newState: Partial<typeof state>) => {
    updateState((prevState) => ({ ...prevState, ...newState }));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    let caught = 0;
    switch (state.mode) {
      case "search":
        if (event.key === "Enter") {
          // TODO: Search for suggestions
          caught++;
        } else if (event.key === "ArrowDown") {
          // TODO: Highlight the next suggestion
          if (state.suggestions.length > 0) {
            // Move highlight to next suggestion
            setState({ mode: "selection", selectedIndex: 0 }); // Highlight the first suggestion
            caught++;
          }
        } else if (event.key === "ArrowUp") {
          // TODO: Highlight the previous suggestion
          if (state.suggestions.length > 0) {
            // Move highlight to previous suggestion
            setState({ mode: "selection", selectedIndex: state.suggestions.length - 1 }); // Highlight the last suggestion
          }
        } else if (event.key === "ArrowLeft") {
          let i = ShellTypes.indexOf(state.inputType);
          setState({ inputType: ShellTypes[(i - 1 + ShellTypes.length) % ShellTypes.length] });
          caught++;
        } else if (event.key === "ArrowRight") {
          let i = ShellTypes.indexOf(state.inputType);
          setState({ inputType: ShellTypes[(i + 1) % ShellTypes.length] });
          caught++;
        } else if (event.key === "Escape") {
          // TODO: Close/Hide the window
          getCurrentWindow().hide();
          updateState(initialState);
          caught++;
        }
        break;
      case "selection":
        if (event.key === "Enter") {
          // TODO: Select the highlighted suggestion
          caught++;
        } else if (event.key === "ArrowDown") {
          // Highlight the next suggestion (circular)
          if (state.suggestions.length > 0) {
            setState({
              mode: "selection",
              selectedIndex: (state.selectedIndex + 1) % state.suggestions.length,
            });
            caught++;
          }
        } else if (event.key === "ArrowUp") {
          // Highlight the previous suggestion (circular)
          if (state.suggestions.length > 0) {
            setState({
              mode: "selection",
              selectedIndex: (state.selectedIndex - 1 + state.suggestions.length) % state.suggestions.length,
            });
            caught++;
          }
        } else if (event.key === "Escape") {
          setState({ mode: "search", selectedIndex: -1 });
          caught++;
        } else if (event.key === "Tab") {
          if (state.suggestions.length > 0) {
            setState({
              mode: "cmd",
              selectedIndex: state.selectedIndex == -1 ? 0 : state.selectedIndex,
              selectedCmd: parseCommand(state.suggestions[state.selectedIndex == -1 ? 0 : state.selectedIndex].cmd),
            });
            caught++;
          } else {
            setState({ mode: "cmd", selectedIndex: -1, selectedCmd: parseCommand(state.inputValue) });
          }
        } else {
          setState({ mode: "search", selectedIndex: -1 });
        }
        break;
      case "cmd":
        if (event.key === "Escape") {
          setState({ mode: "selection", selectedIndex: -1 });
          caught++;
        } else if (event.key === "Enter") {
          // TODO: Execute the command
          const finalCmd = joinCommand(state.selectedCmd);
          //   console.log("Executing command:", finalCmd);
          if (state.activeWindow?.window_id) {
            sendCommandToWindow(finalCmd, state.activeWindow.window_id);
            getCurrentWindow().hide();
            updateState(initialState);
          } else {
            console.log("Executing command:", finalCmd);
          }
        }
        break;
    }
    if (caught) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown as any);
    return () => {
        window.removeEventListener("keydown", handleKeyDown as any);
    }
  }, [state]);

  useEffect(() => {
    if(activeWindow.google_gemini_api_key && !geminiSuggestor.client) {
        geminiSuggestor.init(activeWindow.google_gemini_api_key);
        (window as any).gemini = geminiSuggestor;
        console.log(geminiSuggestor);
        setState({activeWindow});
    }
    const unlisten = listen("active-window", (event) => {
      let payload: ActiveWindowPayloadType = event.payload as any;
      if (!geminiSuggestor.client && payload.google_gemini_api_key) {
        geminiSuggestor.init(payload.google_gemini_api_key);
        (window as any).gemini = geminiSuggestor;
        console.log(geminiSuggestor);
      }
      setState({ activeWindow: event.payload as any });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const debouncedInputValue = useDebounceValue(state.inputValue, 1000);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setState({ suggestions: [] });
      return;
    }

    const localSuggestions = await getLocalSuggestions(query);
    if (localSuggestions.length == 0) {
      // time to fetch ai suggestions
      if (geminiSuggestor.client) {
        const aiSuggestions = await geminiSuggestor.getSuggestions(query + "| preffered shell type:" + state.inputType);
        return setState({ suggestions: aiSuggestions });
      }
    }
    return setState({ suggestions: localSuggestions });
  };

  useEffect(() => {
    fetchSuggestions(debouncedInputValue);
  }, [debouncedInputValue]);

  useEffect(() => {
    if (state.selectedIndex >= 0) {
      const element = document.getElementById(`suggestion-${state.selectedIndex}`);
      if (element) element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.selectedIndex]);

  return (
    <div className="flex-col autocomplete-code-container flex-wrap" style={{ width: "100%", height: "100%", padding: 16 }}>
      <Typography variant="caption" style={{ color: "white" }}>
        {state.suggestions[state.selectedIndex]?.description}
      </Typography>
      <div className={"flex-row flex-wrap input-" + state.mode} style={{ padding: 0 }}>
        <Select value={state.inputType} onChange={(e) => setState({ inputType: e.target.value })} sx={{ width: 140, mr: 1 }}>
          {ShellTypes.map((shellType, index) => (
            <MenuItem key={index} value={shellType}>
              {shellType}
            </MenuItem>
          ))}
        </Select>
        {["search", "selection"].includes(state.mode) ? (
          <TextField
            className="flex-item"
            value={state.inputValue}
            onChange={(e) => setState({ inputValue: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus={true}
            placeholder="Search..."
          />
        ) : (
          state.selectedCmd.map((part, index) => {
            // if (part.type === "static") {
            //   return <TextField size="small" style={{ whiteSpace: "nowrap" }} value={part.label} />;
            // }
            // if (part.type == "input") {
            return (
              <AutoWidthTextField
                key={index}
                placeholder={part.label}
                variant="outlined"
                className={"cmd-inp cmd-inp-" + part.type}
                style={{
                  marginLeft: 8,
                  marginRight: 8,
                  width: ((part.value || "").length == 0 ? part.label : part.value).length * 10 + 24,
                }}
                value={part.type == "static" ? part.label : part.value}
                onKeyDown={handleKeyDown}
                autoFocus={part.type === "input"}
                size="small"
                onChange={(e: any) => {
                  if (part.type !== "input") return;
                  const newCmd = [...state.selectedCmd];
                  newCmd[index].value = e.target.value;
                  setState({ selectedCmd: newCmd });
                }}
              />
            );
            // }
          })
        )}
      </div>
      <div className="suggestions-container flex-col">
        {state.suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item ${state.selectedIndex === index ? "active" : ""}`}
            id={`suggestion-${index}`}
            // onMouseDown={() => handleSuggestionClick(suggestion)}
          >
            <Typography variant="body1">{suggestion.cmd}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
