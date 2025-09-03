mod shortcut_parser;
mod wininfo;
mod keystroke_sender;

// use std::sync::{Arc, Mutex};

use crate::shortcut_parser::parse_shortcut;
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt};
// use shortcut_parser::parse_shortcut;

static AREA_RATIO: f64 = 0.5;


#[tauri::command]
fn send_keystrokes(window_id: usize, cmd: String) -> Result<(), String> {
    keystroke_sender::send_command_to_window(window_id, &cmd)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .build(),
        )
        .invoke_handler(tauri::generate_handler![send_keystrokes])
        .setup(move |app| {
            #[cfg(desktop)]
            {
                log::info!("In Setup :)");

                let config = std::fs::read_to_string("config.json")
                    .ok()
                    .and_then(|contents| serde_json::from_str::<serde_json::Value>(&contents).ok())
                    .unwrap_or_default();

                // log::info!("{}", config["hot-key"]);

                let hot_key_str = config
                    .get("hot-key")
                    .and_then(|v| v.as_str())
                    .filter(|s| !s.is_empty())
                    .unwrap_or("ctrl+shift+space")
                    .to_string();

                let hot_key_shortcut = parse_shortcut(&hot_key_str).unwrap();
                // .unwrap_or(Shortcut::new(
                //     Some(Modifiers::CONTROL | Modifiers::SHIFT),
                //     Code::Space,
                // ));

                log::info!("{:?}", hot_key_shortcut);
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            if shortcut == &hot_key_shortcut {
                                use tauri_plugin_global_shortcut::ShortcutState;
                                if let ShortcutState::Pressed = event.state() {
                                    use std::thread;
                                    use std::time::Duration;

                                    use crate::wininfo::{get_active_window_info, get_active_window_monitor};
                                    thread::sleep(Duration::from_millis(100)); // <-- Add this line
                                    let mut active_window_info = get_active_window_info();

                                    let active_monitor = get_active_window_monitor(_app);
                                    thread::sleep(Duration::from_millis(100)); // <-- Add this line

                                    // Reminder: Focusing on app window, do all prev related window ops before this

                                    let window = if let Some(win) = _app.get_webview_window("main")
                                    {
                                        win
                                    } else {
                                        use tauri::WebviewUrl;
                                        use tauri::WebviewWindowBuilder;

                                        WebviewWindowBuilder::new(
                                            _app,
                                            "main",
                                            WebviewUrl::default(),
                                        )
                                        .visible(false)
                                        .transparent(true)
                                        .decorations(false)
                                        .always_on_top(true)
                                        .build()
                                        .unwrap()
                                    };

                                    log::info!("Active monitor {:?}", active_monitor);

                                    let _ = window.set_focus();

                                    if let Some(active_monitor) = active_monitor {
                                        use tauri::Emitter;

                                        use crate::wininfo::get_centered_win_pos;

                                        let active_monitor_pos_param =
                                            get_centered_win_pos(active_monitor, AREA_RATIO);

                                        log::info!(
                                            "Active monitor position parameters: {},{},{},{}",
                                            active_monitor_pos_param.width,
                                            active_monitor_pos_param.height,
                                            active_monitor_pos_param.win_x_start,
                                            active_monitor_pos_param.win_y_start
                                        );
                                        for _i in 0..5 {
                                            window
                                                .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                                                    width: active_monitor_pos_param.width as u32,
                                                    height: active_monitor_pos_param.height as u32,
                                                }))
                                                .unwrap();
                                            window
                                                .set_position(tauri::Position::Physical(
                                                    tauri::PhysicalPosition {
                                                        x: active_monitor_pos_param.win_x_start as i32,
                                                        y: active_monitor_pos_param.win_y_start as i32,
                                                    },
                                                ))
                                                .unwrap();
                                            thread::sleep(Duration::from_millis(100));
                                        }
                                        window.show().unwrap();

                                        // get 'GOOGLE_GEMINI_API_KEY' from env, if present add it to active_window_info
                                        if let Ok(api_key) = std::env::var("GOOGLE_GEMINI_API_KEY") {
                                            active_window_info.insert("google_gemini_api_key".to_string(), api_key);
                                        }
                                        window.emit("active-window", active_window_info).unwrap();
                                        window.set_focus().unwrap();
                                    } else {
                                        window
                                            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                                                width: 400.0,
                                                height: 300.0,
                                            }))
                                            .unwrap();
                                    }
                                    // win.set (tauri::Position::Center);
                                }
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(hot_key_shortcut)?;
            }

            Ok(())
        });

    let app = builder
        .build(tauri::generate_context!())
        .expect("error building app");

    app.run(|app_handle, event| match event {
        tauri::RunEvent::ExitRequested { .. } => {
            #[cfg(desktop)]
            {
                log::info!("Cleaning up before exit...");
                if let Err(e) = app_handle.global_shortcut().unregister_all() {
                    log::error!("Failed to unregister shortcuts: {}", e);
                }
            }
        }
        _ => {}
    });
}
