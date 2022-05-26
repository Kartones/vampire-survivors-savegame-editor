const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// This is the amount of coins that will be added to the save game
const newCoinsAmount = 500000;

// Useful for when you want to change other parameters of the save file by yourself, and still want to have a valid
// checksum generated at the end
const skipChecksum = false;

const loadSaveData = () => {
  const fileName = "SaveData.sav";
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else {
    throw new Error(`File '${fileName}' not found`);
  }
};

const saveDataToFile = (saveData, fileName) => {
  fs.writeFileSync(fileName, JSON.stringify(saveData));
};

const copyData = (data) => {
  return JSON.parse(JSON.stringify(data));
};

const calculateChecksum = (jsonObject) =>
  crypto
    .createHash("sha256", "DefinitelyNotSaveDataSecretKey")
    .update(JSON.stringify(jsonObject))
    .digest("hex");

const validateChecksum = (saveData) => {
  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  return calculateChecksum(saveDataCopy) === saveData["checksum"];
};

const changeAvailableCoins = (saveData, desiredAmount) => {
  const saveDataCopy = copyData(saveData);

  const backupFileName = `SaveData_Backup_${Date.now()}.sav`;
  saveDataToFile(saveDataCopy, backupFileName);
  console.log(`Original game backup saved as '${backupFileName}'`);

  // Emtpy checksum, will be filled afterwards
  saveDataCopy["checksum"] = "";

  saveDataCopy["LifetimeCoins"] -= saveDataCopy["Coins"];
  saveDataCopy["Coins"] = desiredAmount;
  saveDataCopy["LifetimeCoins"] += desiredAmount;

  saveDataCopy["checksum"] = calculateChecksum(saveDataCopy);

  const fileName = "SaveData.sav";
  saveDataToFile(saveDataCopy, fileName);
  console.log(`Modified game saved as '${fileName}'`);
};

// ---

let saveGameData = loadSaveData();
if (!skipChecksum) {
  console.log("checksum correct?", validateChecksum(saveGameData));
}
if (skipChecksum || validateChecksum(saveGameData)) {
  changeAvailableCoins(saveGameData, newCoinsAmount);
}
