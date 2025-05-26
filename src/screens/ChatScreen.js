// import React from "react";
// import { Chat, OverlayProvider, ChannelList } from "stream-chat-react-native";
// import { useStream } from "../context/StreamContext";
// import chatClient from "../services/stream";
// import { SafeAreaView } from "react-native";

// export default function ChatScreen() {
//   const { clientReady } = useStream();

//   if (!clientReady) return null;

//   return (
//     <OverlayProvider>
//       <Chat client={chatClient}>
//         <SafeAreaView style={{ flex: 1 }}>
//           <ChannelList />
//         </SafeAreaView>
//       </Chat>
//     </OverlayProvider>
//   );
// }


import { View, Text } from 'react-native'
import React from 'react'

export default function ChatScreen() {
  return (
    <View>
      <Text>ChatScreen</Text>
    </View>
  )
}