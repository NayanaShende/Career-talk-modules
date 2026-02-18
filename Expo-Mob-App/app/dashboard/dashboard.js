import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { router } from "expo-router";

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>S</Text>
          </View>

          <Text style={styles.headerText}>Hi Sakshi</Text>

          <Pressable style={styles.walletBtn}>
            <Text style={styles.walletText}>Add Cash +</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <TextInput placeholder="Search" style={{ flex: 1 }} />
        </View>

        {/* CATEGORY ICONS */}
        <View style={styles.categoryRow}>
          <Category title="Python" icon="🐍" />
          <Category title="AWS" icon="🚀" />
          <Category title="Power BI" icon="📶" />
          <Category title="React.js" icon="🔯" />
        </View>

        {/* BANNER CARD */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text>Ask Expert</Text>

            <Pressable style={styles.chatBtn}>
              <Text style={{ fontWeight: "bold" }}>Chat Now</Text>
            </Pressable>
          </View>

          <Image
            source={require("../../assets/banner.png")}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* PROMO CARD */}
        {/* <View style={styles.banner}> */}
        <View style={styles.new}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannertitle}>Got any questions?    </Text>
            <Text style={styles.bannertitle}>Chat With Expert</Text>
            <Text style={styles.bannertitle}>@INR 5/min</Text>
            <Pressable style={styles.chatbtn}>
              <Text style={{ fontWeight: "bold" }}>Chat Now</Text>
            </Pressable>
          </View>

          <Image
            source={require("../../assets/new.png")}
            style={styles.bannerImage}
          />
        </View>

        {/* </View> */}

        {/* EXPERT LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Expert</Text>
          <Text
            style={styles.viewAll}
            onPress={() => router.push("/expert/recommended")}
          >
            View All
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <LiveExpert
    name="Tarot Shivanajli"
    title="Will he/she understand me?"
    viewers="858"
    image="https://i.pravatar.cc/300?img=32"
  />

  <LiveExpert
    name="Tarot Maestro"
    title="What does your future say?"
    viewers="938"
    image="https://i.pravatar.cc/300?img=45"
  />

  <LiveExpert
    name="Astro Sarita"
    title="Healing after breakup"
    viewers="995"
    image="https://i.pravatar.cc/300?img=47"
  />
</ScrollView>
</ScrollView>



      <View style={styles.bottomNav}>
        <NavItem icon="🏠" label="Home" active route="/dashboard/dashboard" />
        <NavItem icon="🔎" label="Search" route="/expert/search" />
        <NavItem icon="💬" label="Chat" route="/chat" />
        <NavItem icon="👤" label="Profile" route="/home/profile" />
      </View>
    </SafeAreaView>
  );
}

/* CATEGORY COMPONENT */
const Category = ({ title, icon }) => (
  <View style={styles.categoryItem}>
    <Text style={styles.categoryIcon}>{icon}</Text>
    <Text style={styles.categoryText}>{title}</Text>
  </View>
);

/* EXPERT CARD */
const LiveExpert = ({ name, title, viewers, image }) => (
  <View style={styles.liveCard}>
    <Image source={{ uri: image }} style={styles.liveImage} />

    {/* LIVE badge */}
    <View style={styles.liveBadge}>
      <Text style={styles.liveText}>LIVE</Text>
    </View>

    {/* viewers */}
    <View style={styles.viewerBox}>
      <Text style={styles.viewerText}>👁 {viewers}</Text>
    </View>

    {/* bottom overlay */}
    <View style={styles.liveOverlay}>
      <Text style={styles.liveName}>{name}</Text>
      <Text style={styles.liveTitle}>{title}</Text>
    </View>
  </View>
);

const NavItem = ({ icon, label, active, route }) => (
  <Pressable style={styles.navItem} onPress={() => route && router.push(route)}>
    <Text style={[styles.navIcon, active && { color: "#FFD600" }]}>{icon}</Text>
    <Text style={[styles.navText, active && { color: "#FFD600" }]}>
      {label}
    </Text>
  </Pressable>
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },

  walletBtn: {
    marginLeft: "auto",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  walletText: {
    fontWeight: "600",
  },

  searchBox: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  categoryItem: {
    alignItems: "center",
  },

  categoryIcon: {
    fontSize: 28,
    backgroundColor: "#BDE8F5",
    padding: 16,
    borderRadius: 40,
  },

  categoryText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
  },
  new: {
    flexDirection: "row",
    backgroundColor: "#111010",
    margin:2,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  banner: {
    flexDirection: "row",
    backgroundColor: "#FFF7CC",
    margin: 15,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 200,
  },
  bannerTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  bannertitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },

  bannerImage: {
    width: 180,
    height: 130,
  },

  chatBtn: {
    backgroundColor: "#BDE8F5",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  chatbtn: {
    backgroundColor: "#BDE8F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: "flex-left",
    alignItems: "center",
  },

  promo: {
    backgroundColor: "#000",
    marginHorizontal: 15,
    borderRadius: 14,
    padding: 15,
  },

  promoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  promoSub: {
    color: "#ccc",
    marginVertical: 6,
  },

  chatBtnDark: {
    backgroundColor: "#BDE8F5",
    padding: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop:20,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  viewAll: {
    color: "#7C3AED",
    fontWeight: "600",
  },

  expertCard: {
    backgroundColor: "#fff",
    marginLeft: 15,
    marginTop: 10,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },

  expertImg: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },

  expertName: {
    marginTop: 6,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  navItem: {
    alignItems: "center",
  },

  navIcon: {
    fontSize: 20,
    color: "#777",
  },

  navText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  liveCard: {
  width: 120,
  height: 150,
  borderRadius: 16,
  marginLeft: 15,
  marginTop: 15,
  overflow: "hidden",
  backgroundColor: "#eee",
},

liveImage: {
  width: "100%",
  height: "100%",
  position: "absolute",
},

liveBadge: {
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: "red",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
},

liveText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
},

viewerBox: {
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "rgba(0,0,0,0.6)",
  paddingHorizontal: 6,
  borderRadius: 6,
},

viewerText: {
  color: "#fff",
  fontSize: 10,
},

liveOverlay: {
  position: "absolute",
  bottom: 0,
  width: "100%",
  padding: 8,
  backgroundColor: "rgba(0,0,0,0.5)",
},

liveName: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 13,
},

liveTitle: {
  color: "#ddd",
  fontSize: 11,
},

});
