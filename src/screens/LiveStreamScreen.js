// // screens/LiveStreamScreen.js
// import React from "react";
// import { View, StyleSheet } from "react-native";
// import {
//   StreamVideoClient,
//   StreamVideo,
//   Call,
//   useCall,
//   CallContent,
// } from "@stream-io/video-react-native-sdk";

// // Assume client is initialized elsewhere and passed in
// export default function LiveStreamScreen({ route }) {
//   const { callId, callType = "default" } = route.params;

//   const call = useCall(callType, callId);

//   if (!call) return null;

//   return (
//     <StreamVideo>
//       <Call call={call}>
//         <CallContent />
//       </Call>
//     </StreamVideo>
//   );
// }


import { View, Text } from 'react-native'
import React from 'react'

export default function LiveStreamScreen() {
  return (
    <View>
      <Text>LiveStreamScreen</Text>
    </View>
  )
}