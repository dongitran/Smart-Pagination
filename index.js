const { pool } = require("./config");
const { getSmartPage } = require("./getSmartPage");

async function runTest() {
  let client;
  try {
    client = await pool.connect();

    const pageData = await getSmartPage(client, 2, 20); // Page 2, PerPage 20
    console.log(pageData);
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runTest().catch((err) => {
  console.error("Test run error:", err);
  process.exit(1);
});
