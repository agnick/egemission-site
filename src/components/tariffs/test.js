const CryptoJS = require("crypto-js");

function generateToken(params) {
  const password = "UiJclu%oqfWQuqGz"; // Укажите ваш пароль

  // Соберите параметры для создания строки для хеширования
  let tokenData = {
    terminalkey: params.terminalkey,
    amount: params.amount,
    order: params.order,
    description: params.description,
    language: params.language,
    frame: params.frame,
  };

  // Добавьте пароль в параметры
  tokenData.password = password;

  //
  // Сортируйте ключи и создайте строку
  const sortedKeys = Object.keys(tokenData).sort();
  const concatenatedString = sortedKeys.map((key) => tokenData[key]).join("");

  // Создайте хеш SHA-256
  return CryptoJS.SHA256(concatenatedString).toString(CryptoJS.enc.Hex);
}

function testGenerateToken() {
  // Test input
  const params = {
    terminalkey: "1730997717244DEMO",
    amount: "29900000",
    order: "123456789",
    description: "Test payment",
    language: "ru",
    frame: true,
  };

  // Manually calculate the expected hash to match the function's output
  const expectedPassword = "UiJclu%oqfWQuqGz";
  let tokenData = {
    ...params,
    password: expectedPassword,
  };

  const sortedKeys = Object.keys(tokenData).sort();
  const concatenatedString = sortedKeys.map((key) => tokenData[key]).join("");
  const expectedToken = CryptoJS.SHA256(concatenatedString).toString(
    CryptoJS.enc.Hex,
  );

  // Run the function and compare the result
  const generatedToken = generateToken(params);

  console.log("Generated Token:", generatedToken);
  console.log("Expected Token:", expectedToken);

  if (generatedToken === expectedToken) {
    console.log("Test passed! Tokens match.");
  } else {
    console.error("Test failed. Tokens do not match.");
  }
}

// Run the test
testGenerateToken();
