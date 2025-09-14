const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const { orderId, action } = JSON.parse(event.body);

    if (!orderId || !action) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ status: "error", message: "Missing parameters" })
      };
    }

    const response = await fetch("https://script.google.com/macros/s/AKfycbz5oyC0QKsmgZ27IWpuNSGYNcdT0eq2K-XufsU-45u4rSBF13vnGsKGeuMFOlipktwR/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action })
    });

    const text = await response.text();

    // Try parsing JSON
    try {
      const result = JSON.parse(text);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result)
      };
    } catch (err) {
      // Apps Script returned HTML instead of JSON
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          status: "error",
          message: "Apps Script returned invalid response",
          raw: text
        })
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: err.message })
    };
  }
};
