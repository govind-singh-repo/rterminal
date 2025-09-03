import axios, { AxiosInstance } from "axios";

type CommandSuggestion = {
  cmd: string;
  description: string;
};

export class GeminiCmdSuggestor {
  private systemPrompt = `You are a helpful terminal. When the user gives you a command or query, respond with the most suitable commands they can use. They may also specify a preferred shell.
You should return the 3 most relevant suggestions in JSON format.

Example:
User: git cmd to create a new branch | preffered shell type: powershell
Response: [
  {"cmd": "git checkout -b [branch-name]", "description": "Create a new branch from current branch"},
  {"cmd": "git switch -b [branch-name]", "description": "Create and switch to a new branch"},
  {"cmd": "git branch [branch-name] && git checkout [branch-name]", "description": "Create a new branch and switch to it"}
]`;

  public client?: AxiosInstance;
  private debounceDelay: number = 0;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  init(apiKey: string, debounceMs: number = 0) {
    this.client = axios.create({
      baseURL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    });
    this.debounceDelay = debounceMs;
  }

  async getSuggestions(input: string): Promise<CommandSuggestion[]> {
    const prompt = `${this.systemPrompt}\nUser: ${input}`;

    return new Promise((resolve) => {
      if (this.debounceDelay > 0) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.fetchSuggestions(prompt, resolve), this.debounceDelay);
      } else {
        this.fetchSuggestions(prompt, resolve);
      }
    });
  }

  private async fetchSuggestions(prompt: string, resolve: (value: CommandSuggestion[]) => void) {
    if(!this.client) {
        console.error("Gemini API client is not initialized");
        resolve([]);
        return;
    }
    try {
      const response = await this.client.post("", {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const candidates = response.data?.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const match = text.match(/\[.*\]/s);
      if (!match) throw new Error("No JSON array found in response");

      const suggestions: CommandSuggestion[] = JSON.parse(match[0]);
      resolve(suggestions);
    } catch (err) {
      console.error("Gemini API error:", err);
      resolve([]);
    }
  }
}