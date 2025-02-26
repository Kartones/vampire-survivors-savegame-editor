import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// This is the amount of coins that will be added to the save game, if not passed as command-line argument
const DEFAULT_NEW_COINS_AMOUNT = 5000000;

const SAVE_FILENAME = "SaveData";
const SAVE_FILENAME_OLD = "SaveData.sav";

const main = () => {
  if (isOldFileName()) {
    console.log("Savegame is too old.");
    return;
  }

  let newCoinsAmount = DEFAULT_NEW_COINS_AMOUNT;
  if (process.argv.length === 3) {
    try {
      newCoinsAmount = parseInt(process.argv[2], 10);
    } catch {
      // Just keep the default
    }
  }

  let saveGameData = loadSaveData(SAVE_FILENAME);

  createBackup(SAVE_FILENAME, saveGameData);

  let saveData = changeAvailableCoins(saveGameData, newCoinsAmount);
  saveData = removeBadEggs(saveData);

  saveData["checksum"] = calculateChecksum(saveData);
  saveDataToFile(saveData, SAVE_FILENAME);
  console.log(`Modified game saved as '${SAVE_FILENAME}'`);
};

const isOldFileName = () => {
  // Test first with the new filename, in case there are both files
  if (existsSync(join(process.cwd(), SAVE_FILENAME))) {
    return false;
  }
  if (existsSync(join(process.cwd(), SAVE_FILENAME_OLD))) {
    return true;
  }
  throw new Error(
    `Save file not found, attempted with filenames: ${SAVE_FILENAME}, ${SAVE_FILENAME_OLD}`
  );
};

const loadSaveData = (fileName) => {
  const filePath = join(process.cwd(), fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
};

const saveDataToFile = (saveData, fileName) => {
  writeFileSync(fileName, JSON.stringify(saveData));
};

const copyData = (data) => {
  return JSON.parse(JSON.stringify(data));
};

const calculateChecksum = (jsonObject) =>
  createHash("sha256").update(JSON.stringify(jsonObject)).digest("hex");

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

  // Main game
  saveDataCopy["LifetimeCoins"] -= saveDataCopy["Coins"];
  saveDataCopy["Coins"] = desiredAmount;
  saveDataCopy["LifetimeCoins"] += desiredAmount;

  // Adventures - Need to have started one (just start and buy any power-up), else won't be present in the save file
  Object.keys(saveDataCopy["AdventuresSaveData"]).forEach((adventureId) => {
    saveDataCopy["AdventuresSaveData"][adventureId]["ADV_LifetimeCoins"] -=
      saveDataCopy["AdventuresSaveData"][adventureId]["ADV_Coins"];
    saveDataCopy["AdventuresSaveData"][adventureId]["ADV_Coins"] =
      desiredAmount;
    saveDataCopy["AdventuresSaveData"][adventureId]["ADV_LifetimeCoins"] +=
      desiredAmount;
  });

  return saveDataCopy;
};

// TODO: expand to adventures (`AdventuresSaveData` -> <Adventure-Id> -> `ADV_EggData`)
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

main();
