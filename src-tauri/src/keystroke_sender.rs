// keystroke_sender.rs

#[cfg(target_os = "windows")]
mod platform {
    use enigo::{Direction, Enigo, Key, Keyboard, Settings};
    use std::ffi::c_void;
    use windows::Win32::{
        Foundation::HWND,
        UI::WindowsAndMessaging::{SetForegroundWindow, ShowWindow, SW_RESTORE},
    };

    use std::collections::HashMap;

    pub fn send_text(enigo: &mut Enigo, text: &str) -> Result<(), String> {
        let shifted_map: HashMap<char, char> = HashMap::from([
            ('!', '1'),
            ('@', '2'),
            ('#', '3'),
            ('$', '4'),
            ('%', '5'),
            ('^', '6'),
            ('&', '7'),
            ('*', '8'),
            ('(', '9'),
            (')', '0'),
            ('_', '-'),
            ('+', '='),
            ('{', '['),
            ('}', ']'),
            ('|', '\\'),
            (':', ';'),
            ('"', '\''),
            ('<', ','),
            ('>', '.'),
            ('?', '/'),
        ]);

        // for ch in text.chars() {
        //     if let Some(base) = shifted_map.get(&ch) {
        //         enigo
        //             .key(Key::Shift, Direction::Press)
        //             .map_err(|e| format!("Shift press failed: {:?}", e))?;
        //         enigo
        //             .key(Key::Unicode(*base), Direction::Click)
        //             .map_err(|e| format!("Shifted key '{}' failed: {:?}", ch, e))?;
        //         enigo
        //             .key(Key::Shift, Direction::Release)
        //             .map_err(|e| format!("Shift release failed: {:?}", e))?;
        //     } else {
        //         enigo
        //             .key(Key::Unicode(ch), Direction::Click)
        //             .map_err(|e| format!("Key '{}' failed: {:?}", ch, e))?;
        //     }
        // }
        for ch in text.chars() {
            if let Some(base) = shifted_map.get(&ch) {
                // Shifted symbol
                enigo.key(Key::Shift, Direction::Press).map_err(|e| format!("Shift press failed: {:?}", e))?;
                enigo.key(Key::Unicode(*base), Direction::Click).map_err(|e| format!("Shifted key '{}' failed: {:?}", ch, e))?;
                enigo.key(Key::Shift, Direction::Release).map_err(|e| format!("Shift release failed: {:?}", e))?;
            } else if ch.is_uppercase() {
                // Shifted letter
                let lower = ch.to_ascii_lowercase();
                enigo.key(Key::Shift, Direction::Press).map_err(|e| format!("Shift press failed: {:?}", e))?;
                enigo.key(Key::Unicode(lower), Direction::Click).map_err(|e| format!("Shifted key '{}' failed: {:?}", ch, e))?;
                enigo.key(Key::Shift, Direction::Release).map_err(|e| format!("Shift release failed: {:?}", e))?;
            } else {
                // Normal character
                enigo.key(Key::Unicode(ch), Direction::Click).map_err(|e| format!("Key '{}' failed: {:?}", ch, e))?;
            }
        }

        Ok(())
    }

    pub fn send_command_to_window(window_id: usize, cmd: &str) -> Result<(), String> {
        let hwnd = HWND(window_id as *mut c_void);

        unsafe {
            let _ = ShowWindow(hwnd, SW_RESTORE);
            if !SetForegroundWindow(hwnd).as_bool() {
                return Err("Failed to bring window to foreground".into());
            }
        }

        let mut enigo = Enigo::new(&Settings::default())
            .map_err(|e| format!("Failed to initialize Enigo: {:?}", e))?;

        send_text(&mut enigo, cmd)?;

        Ok(())
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    pub fn send_command_to_window(_window_id: usize, _cmd: &str) -> Result<(), String> {
        Err("send_command_to_window is not implemented for this platform".into())
    }
}

pub use platform::send_command_to_window;
