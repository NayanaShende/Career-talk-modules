import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { router, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../services/api";
import { getAllExperts } from "../services/expertService";

function Home() {
  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);

      let serviceData = [];
      try {
        serviceData = await getAllExperts();
      } catch {}

      let resData = null;
      if (!serviceData || serviceData.length === 0) {
        const res = await axiosInstance.get("/experts");
        resData = res.data;
      }

      const data = serviceData?.length ? serviceData : resData;

      let expertsData = [];
      if (Array.isArray(data)) expertsData = data;
      else if (Array.isArray(data?.data)) expertsData = data.data;
      else if (Array.isArray(data?.experts)) expertsData = data.experts;

      setExperts(expertsData);
    } catch (error) {
      console.log("FETCH ERROR:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) =>
    (e?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderExpert = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/expert/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.image ||
            item.photo ||
            `https://ui-avatars.com/api/?name=${item.name}`,
        }}
        style={styles.avatar}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.role}>
          {item.role || "Expert"} •{" "}
          {item.experience || item.experience_years || 0} yrs
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FACC15" />
          <Text style={styles.rating}>{item.rating || "4.5"}</Text>
        </View>
      </View>

      <View style={styles.viewBtn}>
        <Text style={styles.viewTxt}>View</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* CURVED BLUE HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.topTitle}>Find Your Expert</Text>
        <Ionicons name="menu" size={26} color="#fff" />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          placeholder="Search expert..."
          value={search}
          onChangeText={setSearch}
          style={{ marginLeft: 8, flex: 1 }}
        />
      </View>

      {/* NAV BUTTONS */}
      <Pressable
        style={styles.recommendedBtn}
        onPress={() => router.push("/expert/recommended")}
      >
        <Text style={styles.recommendedText}> View Top Experts</Text>
      </Pressable>

      <Pressable
        style={[styles.recommendedBtn, { backgroundColor: "#16A34A" }]}
        onPress={() => router.push("/expert/online")}
      >
        <Text style={styles.recommendedText}>🟢 View Online Experts</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={renderExpert}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </SafeAreaView>
  );
}

export default function Index() {
  return <Redirect href="/loginOtp" />;
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F3F4F6",
},

/* HEADER */
topHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
backgroundColor:"#3B5BDB",
padding:18,
borderBottomLeftRadius:24,
borderBottomRightRadius:24,
shadowColor:"#000",
shadowOffset:{ width:0, height:3 },
shadowOpacity:0.15,
shadowRadius:6,
elevation:6,
},

topTitle:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

/* SEARCH */
searchBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#fff",
marginHorizontal:16,
marginTop:14,
marginBottom:10,
paddingHorizontal:16,
height:52,
borderRadius:18,
elevation:3,
shadowColor:"#000",
shadowOffset:{ width:0, height:2 },
shadowOpacity:0.06,
shadowRadius:5,
},

/* BUTTONS */
recommendedBtn:{
backgroundColor:"#2563EB",
padding:14,
borderRadius:16,
alignItems:"center",
marginHorizontal:16,
marginBottom:10,
elevation:3,
},

recommendedText:{
color:"#fff",
fontWeight:"bold",
fontSize:16
},

/* CARD */
card:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#fff",
marginHorizontal:16,
marginBottom:14,
padding:16,
borderRadius:18,
elevation:3,
shadowColor:"#000",
shadowOffset:{ width:0, height:2 },
shadowOpacity:0.08,
shadowRadius:6,
},

avatar:{
width:58,
height:58,
borderRadius:29,
marginRight:12
},

name:{
fontSize:18,
fontWeight:"bold"
},

role:{
color:"#6B7280",
marginTop:3
},

ratingRow:{
flexDirection:"row",
alignItems:"center",
marginTop:6
},

rating:{
marginLeft:5,
fontWeight:"600"
},

viewBtn:{
backgroundColor:"#2563EB",
paddingHorizontal:18,
paddingVertical:9,
borderRadius:12,
},

viewTxt:{
color:"#fff",
fontWeight:"600"
}

});