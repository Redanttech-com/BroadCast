import React, { createContext, useContext, useState } from "react";

const SeenStatusContext = createContext();

export const SeenStatusProvider = ({ children }) => {
  const [seenMap, setSeenMap] = useState({}); // { uid: [statusId, ...] }

  const markAsSeen = (uid, statusId) => {
    setSeenMap((prev) => ({
      ...prev,
      [uid]: [...new Set([...(prev[uid] || []), statusId])],
    }));
  };

  const markGroupAsSeen = (uid, ids = []) => {
    setSeenMap((prev) => ({
      ...prev,
      [uid]: [...new Set([...(prev[uid] || []), ...ids])],
    }));
  };

  return (
    <SeenStatusContext.Provider
      value={{ seenMap, markAsSeen, markGroupAsSeen }}
    >
      {children}
    </SeenStatusContext.Provider>
  );
};

export const useSeenStatus = () => useContext(SeenStatusContext);
