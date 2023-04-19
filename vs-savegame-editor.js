const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// This is the amount of coins that will be added to the save game
const NEW_COINS_AMOUNT = 5000000;

// Useful for when you want to change other parameters of the save file by yourself, and still want to have a valid
// checksum generated at the end
const SKIP_CHECKSUM = false;

const SAVE_FILENAME = "SaveData";
const SAVE_FILENAME_OLD = "SaveData.sav";

const isOldFileName = () => {
  // Test first with the new filename, in case there are both files
  if (fs.existsSync(path.join(process.cwd(), SAVE_FILENAME))) {
    return false;
  }
  if (fs.existsSync(path.join(process.cwd(), SAVE_FILENAME_OLD))) {
    return true;
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

const createBackup = (fileName, saveData) => {
  const saveDataCopy = copyData(saveData);

  const backupFileNameWithoutExt = fileName.split(".")[0];
  const backupFileExtension = fileName.split(".")[1] || "";
  const backupFileName = `${backupFileNameWithoutExt}_Backup_${Date.now()}${
    backupFileExtension ? `.${backupFileExtension}` : ""
  }`;

  saveDataToFile(saveDataCopy, backupFileName);
  console.log(`Original game backup saved as '${backupFileName}'`);
};

const changeAvailableCoins = (saveData, desiredAmount) => {
  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  saveDataCopy["LifetimeCoins"] -= saveDataCopy["Coins"];
  saveDataCopy["Coins"] = desiredAmount;
  saveDataCopy["LifetimeCoins"] += desiredAmount;

  return saveDataCopy;
};

const removeBadEggs = (saveData) => {
  // right now only one bad type, but allowing for future additions
  const badEggs = ["curse"];

  const saveDataCopy = copyData(saveData);
  saveDataCopy["checksum"] = "";

  Object.keys(saveDataCopy["EggData"]).forEach((characterId) => {
    badEggs.forEach((eggType) => {
      if (saveDataCopy["EggData"][characterId][eggType]) {
        delete saveDataCopy["EggData"][characterId][eggType];
      }
    });
  });

  return saveDataCopy;
};

// ---

let fileName = isOldFileName() ? SAVE_FILENAME_OLD : SAVE_FILENAME;

let saveGameData = loadSaveData(fileName);
// Ensure that we can modify the save file (generate a valid checksum)
let validChecksum = isChecksumValid(saveGameData);

if (!SKIP_CHECKSUM) {
  console.log("checksum correct?", validChecksum);
}

if (validChecksum || SKIP_CHECKSUM) {
  createBackup(fileName, saveGameData);

  let saveData = changeAvailableCoins(saveGameData, NEW_COINS_AMOUNT);
  if (!isOldFileName()) {
    saveData = removeBadEggs(saveData);
  }

  saveData["checksum"] = calculateChecksum(saveData);
  saveDataToFile(saveData, fileName);
  console.log(`Modified game saved as '${fileName}'`);
}
