// src/utils/token-cache.js
import * as SecureStore from "expo-secure-store";

export const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.log("Error getting token", err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.log("Error saving token", err);
    }
  },
};
