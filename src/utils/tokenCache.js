import * as SecureStore from "expo-secure-store";

/**
 * Custom token cache for Clerk using Expo SecureStore
 */
export const tokenCache = {
  getToken: async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error("Error getting token from SecureStore:", error);
      return null;
    }
  },

  saveToken: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error saving token to SecureStore:", error);
    }
  },
};
