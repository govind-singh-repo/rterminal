use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

pub fn parse_shortcut(input: &str) -> Option<Shortcut> {
    let mut modifiers = Modifiers::empty();
    let mut key: Option<Code> = None;
    for part in input.split('+') {
        match part.trim().to_lowercase().as_str() {
            "ctrl" | "control" | "commandorcontrol" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "alt" => modifiers |= Modifiers::ALT,
            "super" | "meta" | "win" | "cmd" | "command" => modifiers |= Modifiers::SUPER,
            "space" => key = Some(Code::Space),
            "a" => key = Some(Code::KeyA),
            "b" => key = Some(Code::KeyB),
            "c" => key = Some(Code::KeyC),
            "d" => key = Some(Code::KeyD),
            "e" => key = Some(Code::KeyE),
            "f" => key = Some(Code::KeyF),
            "g" => key = Some(Code::KeyG),
            "h" => key = Some(Code::KeyH),
            "i" => key = Some(Code::KeyI),
            "j" => key = Some(Code::KeyJ),
            "k" => key = Some(Code::KeyK),
            "l" => key = Some(Code::KeyL),
            "m" => key = Some(Code::KeyM),
            "n" => key = Some(Code::KeyN),
            "o" => key = Some(Code::KeyO),
            "p" => key = Some(Code::KeyP),
            "q" => key = Some(Code::KeyQ),
            "r" => key = Some(Code::KeyR),
            "s" => key = Some(Code::KeyS),
            "t" => key = Some(Code::KeyT),
            "u" => key = Some(Code::KeyU),
            "v" => key = Some(Code::KeyV),
            "w" => key = Some(Code::KeyW),
            "x" => key = Some(Code::KeyX),
            "y" => key = Some(Code::KeyY),
            "z" => key = Some(Code::KeyZ),
            "0" => key = Some(Code::Digit0),
            "1" => key = Some(Code::Digit1),
            "2" => key = Some(Code::Digit2),
            "3" => key = Some(Code::Digit3),
            "4" => key = Some(Code::Digit4),
            "5" => key = Some(Code::Digit5),
            "6" => key = Some(Code::Digit6),
            "7" => key = Some(Code::Digit7),
            "8" => key = Some(Code::Digit8),
            "9" => key = Some(Code::Digit9),
            "backspace" => key = Some(Code::Backspace),
            "tab" => key = Some(Code::Tab),
            "enter" | "return" => key = Some(Code::Enter),
            "escape" | "esc" => key = Some(Code::Escape),
            "delete" | "del" => key = Some(Code::Delete),
            "home" => key = Some(Code::Home),
            "end" => key = Some(Code::End),
            "pageup" => key = Some(Code::PageUp),
            "pagedown" => key = Some(Code::PageDown),
            "arrowup" | "up" => key = Some(Code::ArrowUp),
            "arrowdown" | "down" => key = Some(Code::ArrowDown),
            "arrowleft" | "left" => key = Some(Code::ArrowLeft),
            "arrowright" | "right" => key = Some(Code::ArrowRight),
            "f1" => key = Some(Code::F1),
            "f2" => key = Some(Code::F2),
            "f3" => key = Some(Code::F3),
            "f4" => key = Some(Code::F4),
            "f5" => key = Some(Code::F5),
            "f6" => key = Some(Code::F6),
            "f7" => key = Some(Code::F7),
            "f8" => key = Some(Code::F8),
            "f9" => key = Some(Code::F9),
            "f10" => key = Some(Code::F10),
            "f11" => key = Some(Code::F11),
            "f12" => key = Some(Code::F12),
            _ => {
                log::error!("Unknown key '{}' - please use lowercase letters with modifiers (e.g. ctrl+a, shift+space)", part);
            }
        }
    }
    if key.is_none() {
        log::error!("failed to parse {}", input);
    }
    key.map(|k| Shortcut::new(Some(modifiers), k))
}
