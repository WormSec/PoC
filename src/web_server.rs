use axum::{
    routing::get,
    response::Json,
    Router,
};
use tokio::net::TcpListener;
use std::net::SocketAddr;
use tower_http::services::ServeDir;

use crate::state;

/// Starts a web server that serves an API and static files.
///
/// This function sets up a web server using the `axum` framework. It defines two routes:
/// - `/api/machines`: A GET endpoint that returns the list of machines in JSON format.
/// - A fallback service that serves static files from the `./ui/build` directory.
///
/// The server listens on all available network interfaces at port `21335` and will respond
/// to incoming requests according to the defined routes.
///
/// # Example Usage:
///
/// To start the server, simply call `run_web_server()` in an async context.
pub async fn run_web_server()
{
    let app = Router::new()
        .route("/api/machines", get(get_machines))
        .fallback_service(ServeDir::new("./ui/dist/pocFront_Angular/browser/"));

    let addr = SocketAddr::from(([0, 0, 0, 0], 21335));
    println!("Web server running at http://{}", addr);
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

/// Retrieves the list of machines and returns it as JSON.
///
/// This is the handler for the `/api/machines` route. It fetches the list of machines
/// from the `state` module and returns it as a JSON response.
///
/// # Returns
///
/// A `Json<Vec<state::Machine>>` containing the list of machines in the system.
async fn get_machines() -> Json<Vec<state::Machine>>
{
    let machines = state::get_machines();
    Json(machines)
}
