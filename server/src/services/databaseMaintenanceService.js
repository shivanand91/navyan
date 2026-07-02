import { Application } from "../models/Application.js";

const LEGACY_APPLICATION_UNIQUE_INDEX = "user_1_internship_1_durationKey_1";

const dropLegacyApplicationIndex = async () => {
  const collection = Application.collection;
  const indexes = await collection.indexes();
  const legacyIndex = indexes.find(
    (index) =>
      index.name === LEGACY_APPLICATION_UNIQUE_INDEX &&
      index.unique === true
  );

  if (!legacyIndex) {
    return;
  }

  await collection.dropIndex(LEGACY_APPLICATION_UNIQUE_INDEX);
  await Application.createIndexes();
  console.log(`Dropped legacy unique index: ${LEGACY_APPLICATION_UNIQUE_INDEX}`);
};

export const runDatabaseMaintenance = async () => {
  await dropLegacyApplicationIndex();
};
