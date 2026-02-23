import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TextInput,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router, Stack } from "expo-router";
import axiosInstance from "../../../services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      const data = res?.data?.data || [];

      const normalized = data.map((e) => ({
        ...e,
        exp:
          e.experience_years ??
          e.experience ??
          e.yearsOfExperience ??
          e.total_experience ??
          0,
      }));

      const sorted = [...normalized].sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.exp || 0) - (a.exp || 0);
      });

      setExperts(sorted.slice(0, 10));
    } catch (error) {
      console.log("Error fetching experts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* PRESS ANIMATION */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container}>

        {/* 🔥 PREMIUM GRADIENT HEADER */}
        <LinearGradient
          colors={["#2563EB", "#1E40AF"]}
          style={styles.topHeader}
        >
          <Text style={styles.topTitle}> Top Recommended Experts</Text>

          <Pressable onPress={() => alert("Open Drawer")}>
            <Ionicons name="menu" size={28} color="#fff" />
          </Pressable>
        </LinearGradient>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Search expert..."
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={filteredExperts}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {

              const isTop = index < 3; // ⭐ top 3 badge

              return (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Pressable
                    style={styles.card}
                    onPressIn={animateIn}
                    onPressOut={animateOut}
                    onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
                  >

                    {/* AVATAR + ONLINE DOT */}
                    <View>
                      <Image
                        source={{
                          uri:
                            item.photo ||
                            `https://i.pravatar.cc/150?u=${item.id || item.name}`,
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.onlineDot} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.name}>{item.name}</Text>

                        {/* VERIFIED BADGE */}
                        {isTop && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#22C55E"
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>

                      <Text style={styles.role}>
                        {item.role || "Expert"} • {item.exp} yrs
                      </Text>

                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FACC15" />
                        <Text style={styles.rating}>{item.rating || 0}</Text>
                      </View>
                    </View>

                    <View style={styles.viewBtn}>
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        View
                      </Text>
                    </View>

                  </Pressable>
                </Animated.View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F1F5F9",
},

/* HEADER */
topHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
paddingHorizontal:20,
paddingTop:18,
paddingBottom:22,
borderBottomLeftRadius:28,
borderBottomRightRadius:28,

shadowColor:"#000",
shadowOffset:{width:0,height:6},
shadowOpacity:0.15,
shadowRadius:10,
elevation:8,
},

topTitle:{
color:"#fff",
fontSize:23,
fontWeight:"700",
letterSpacing:0.3
},

/* SEARCH FLOATING */
searchBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#fff",

marginHorizontal:18,
marginTop:-18,
marginBottom:12,

paddingHorizontal:16,
height:54,
borderRadius:22,

borderWidth:1,
borderColor:"#E5E7EB",

shadowColor:"#000",
shadowOffset:{width:0,height:4},
shadowOpacity:0.08,
shadowRadius:8,
elevation:4,
},

searchInput:{
flex:1,
marginLeft:10,
fontSize:16,
color:"#111",
paddingVertical:0
},

/* CARD */
card:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#FFFFFF",

marginHorizontal:18,
marginVertical:7,
padding:16,
borderRadius:22,

shadowColor:"#000",
shadowOffset:{width:0,height:5},
shadowOpacity:0.08,
shadowRadius:10,
elevation:4,
},

avatar:{
width:60,
height:60,
borderRadius:30,
marginRight:14,
},

onlineDot:{
position:"absolute",
right:12,
bottom:6,
width:13,
height:13,
borderRadius:7,
backgroundColor:"#22C55E",
borderWidth:2,
borderColor:"#fff"
},

name:{
fontSize:18,
fontWeight:"700",
color:"#111827"
},

role:{
color:"#6B7280",
marginTop:3,
fontSize:14.5
},

ratingRow:{
flexDirection:"row",
alignItems:"center",
marginTop:6
},

rating:{
marginLeft:6,
fontWeight:"600",
fontSize:14
},

/* VIEW BUTTON */
viewBtn:{
backgroundColor:"#2563EB",
paddingHorizontal:18,
paddingVertical:10,
borderRadius:14,

shadowColor:"#2563EB",
shadowOffset:{width:0,height:3},
shadowOpacity:0.3,
shadowRadius:6,
elevation:3,
},

viewText:{
color:"#fff",
fontWeight:"700",
fontSize:14
}

});