
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 767, hash: '66c055699e96101b30679438b2a70ebb3c046c7676ad8718af87460695a7fd7f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 953, hash: 'b30620d4660a3bc1fe43db6f56e42f3bf049df87ec72633795deb90ed5276766', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 9773, hash: '8ff4e38f0f52a4c38b73b3b485facc3b2b8ec1496109397760b991a57159d1ae', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-45TVYQQF.css': {size: 202, hash: '6C0ALicXuuc', text: () => import('./assets-chunks/styles-45TVYQQF_css.mjs').then(m => m.default)}
  },
};
