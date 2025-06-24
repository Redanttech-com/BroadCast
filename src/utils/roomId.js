export const getRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    const roomId = sortedIds.join("_");
    return roomId;
}