// Script para testar as URLs do Baserow
const BASEROW_CONFIG = {
  apiToken: "wT4NNP5hwTaVuzixirWycVT4D4xDRorE",
  baseUrl: "https://api.baserow.io",
  databaseId: "296836",
  tables: {
    clients: "689319",
    scripts: "689333"
  }
};

// Teste diferentes estruturas de URL
const testUrls = [
  `${BASEROW_CONFIG.baseUrl}/api/database/${BASEROW_CONFIG.databaseId}/tables/`,
  `${BASEROW_CONFIG.baseUrl}/api/database/tables/${BASEROW_CONFIG.databaseId}/`,
  `${BASEROW_CONFIG.baseUrl}/api/database/rows/table/${BASEROW_CONFIG.tables.clients}/`,
  `${BASEROW_CONFIG.baseUrl}/api/database/tables/database/${BASEROW_CONFIG.databaseId}/`,
];

console.log('URLs para testar:');
testUrls.forEach((url, i) => {
  console.log(`${i + 1}. ${url}`);
});