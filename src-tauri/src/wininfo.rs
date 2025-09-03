use active_win_pos_rs::get_active_window;
use std::collections::HashMap;
use sysinfo::{Pid, System};
use tauri::{Manager, Monitor};

pub fn get_active_window_info() -> HashMap<String, String> {
    let mut info = HashMap::new();
    let mut sys = System::new_all();
    sys.refresh_processes();

    if let Ok(win) = get_active_window() {
        info.insert("window_id".to_string(), win.window_id.clone());
        info.insert("process_id".to_string(), win.process_id.to_string());
        info.insert(
            "position".to_string(),
            format!(
                "x={}, y={}, width={}, height={}",
                win.position.x, win.position.y, win.position.width, win.position.height
            ),
        );

        let pid = Pid::from(win.process_id as usize);
        if let Some(proc) = sys.process(pid) {
            info.insert("process_name".to_string(), proc.name().to_string());
            info.insert(
                "executable_path".to_string(),
                proc.exe()
                    .map_or("Unknown".to_string(), |p| p.display().to_string()),
            );
        } else {
            info.insert("process_name".to_string(), "Unknown".to_string());
            info.insert("executable_path".to_string(), "Unknown".to_string());
        }
    } else {
        info.insert(
            "error".to_string(),
            "Failed to get active window".to_string(),
        );
    }

    info
}

pub fn get_active_window_monitor(app: &tauri::AppHandle) -> Option<tauri::Monitor> {
    if let Ok(active) = get_active_window() {
        let active_x = (active.position.width + active.position.x) / 2.0;
        let active_y = (active.position.height + active.position.y) / 2.0;
        let monitors = app.app_handle().available_monitors().unwrap_or_default();
        let found_monitor = monitors.clone().into_iter().find(|m| {
            let pos = m.position();
            let size = m.size();

            let result = active_x >= pos.x as f64
                && active_x < pos.x as f64 + size.width as f64
                && active_y >= pos.y as f64
                && active_y < pos.y as f64 + size.height as f64;
            if result {
                log::info!("Active window is within monitor {:?}", m);
            } else {
                // log::info!("Active window is NOT within monitor {:?}", m);
            }
            result
        });

        found_monitor.or_else(|| monitors.into_iter().next())
    } else {
        None
    }
}

pub struct ActiveMonitorPosParam {
    pub width: f64,
    pub height: f64,
    pub win_x_start: f64,
    pub win_y_start: f64,
}

pub fn get_centered_win_pos(active_monitor: Monitor, area_ratio: f64) -> ActiveMonitorPosParam {
    let monitor_size = active_monitor.size();
    let monitor_pos = active_monitor.position();

    let width = monitor_size.width as f64 * (area_ratio as f64).powf(0.5);
    let height = monitor_size.height as f64 * (area_ratio as f64).powf(0.5);
    let win_x_start = monitor_pos.x as f64 + (monitor_size.width as f64 - width) / 2.0;
    let win_y_start = monitor_pos.y as f64 + (monitor_size.height as f64 - height) / 2.0;

    ActiveMonitorPosParam {
        width,
        height,
        win_x_start,
        win_y_start,
    }
}
