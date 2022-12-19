const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// This is the amount of coins that will be added to the save game
const NEW_COINS_AMOUNT = 500000;

// Useful for when you want to change other parameters of the save file by yourself, and still want to have a valid
// checksum generated at the end
const SKIP_CHECKSUM = false;

const SAVE_FILENAME = "SaveData";
const SAVE_FILENAME_OLD = "SaveData.sav";

const isOldFileName = () => {
  if (fs.existsSync(path.join(process.cwd(), SAVE_FILENAME_OLD))) {
    return true;
  }
  if (fs.existsSync(path.join(process.cwd(), SAVE_FILENAME))) {
    return false;
  }
  throw new Error(
    `Save file not found, attempted with filenames: ${SAVE_FILENAME}, ${SAVE_FILENAME_OLD}`
  );
};

const loadSaveData = (fileName) => {
  const filePath = path.join(process.cwd(), fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

const isChecksumValid = (saveData) => {
  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  return calculateChecksum(saveDataCopy) === saveData["checksum"];
};

const changeAvailableCoins = (fileName, saveData, desiredAmount) => {
  const saveDataCopy = copyData(saveData);

  const backupFileNameWithoutExt = fileName.split(".")[0];
  const backupFileExtension = fileName.split(".")[1] || "";
  const backupFileName = `${backupFileNameWithoutExt}_Backup_${Date.now()}${
    backupFileExtension ? `.${backupFileExtension}` : ""
  }`;

  saveDataToFile(saveDataCopy, backupFileName);
  console.log(`Original game backup saved as '${backupFileName}'`);

  // Emtpy checksum, will be filled afterwards
  saveDataCopy["checksum"] = "";

  saveDataCopy["LifetimeCoins"] -= saveDataCopy["Coins"];
  saveDataCopy["Coins"] = desiredAmount;
  saveDataCopy["LifetimeCoins"] += desiredAmount;

  saveDataCopy["checksum"] = calculateChecksum(saveDataCopy);

  saveDataToFile(saveDataCopy, fileName);
  console.log(`Modified game saved as '${fileName}'`);
};

// ---

let fileName = isOldFileName() ? SAVE_FILENAME_OLD : SAVE_FILENAME;

let saveGameData = loadSaveData(fileName);
let validChecksum = isChecksumValid(saveGameData);

if (!SKIP_CHECKSUM) {
  console.log("checksum correct?", validChecksum);
}
if (validChecksum || SKIP_CHECKSUM) {
  changeAvailableCoins(fileName, saveGameData, NEW_COINS_AMOUNT);
}
