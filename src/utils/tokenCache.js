// tokenCache.js
import * as SecureStore from "expo-secure-store";

export const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("Error getting token from cache", err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Error saving token to cache", err);
    }
  },
};
