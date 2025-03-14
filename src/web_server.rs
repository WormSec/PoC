use axum::{
    routing::get,
    response::Json,
    Router,
};
use tokio::net::TcpListener;
use std::net::SocketAddr;
use tower_http::services::ServeDir;

use crate::state;

pub async fn run_web_server()
{
    let app = Router::new()
        .route("/api/machines", get(get_machines))
        .nest_service("/", ServeDir::new("./ui/build"));

    let addr = SocketAddr::from(([0, 0, 0, 0], 21335));
    println!("Web server running at http://{}", addr);
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

async fn get_machines() -> Json<Vec<state::Machine>>
{
    let machines = state::get_machines().await;
    Json(machines.clone())
}