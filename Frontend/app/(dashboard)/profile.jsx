import React, { useState, useEffect } from "react";
import { View,Text,Image,TextInput,TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet, Alert, ScrollView,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useSignOut } from "@clerk/clerk-expo";
import { useNavigation } from "expo-router";
import { Colors } from "../../constant/Colors";
import  SignOutButton  from '../../components/SignOutButton'



// Small allergen suggestion list
const SUGGESTIONS = ["Peanuts","Tree nuts","Milk","Eggs","Wheat","Soy","Fish","Shellfish","Sesame","Mustard","Sulphites","Gluten",];

export default function ProfileCombined() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useSignOut ? useSignOut() : { signOut: async () => {} };
  const navigation = useNavigation();

  // initial handle 
  const initialHandle =
    user?.username ||
    user?.publicMetadata?.username ||
    (user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split("@")[0]
      : user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "");

  // UI state
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(initialHandle || "");
  const [savingUser, setSavingUser] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // bio local state 
  const [bio, setBio] = useState(user?.publicMetadata?.bio || "");
  const [savingBio, setSavingBio] = useState(false);

  // allergens section (state brooooo)
  const initialAllergens = (user?.publicMetadata?.allergens && Array.isArray(user.publicMetadata.allergens))
    ? user.publicMetadata.allergens
    : [];
  const [allergens, setAllergens] = useState(initialAllergens);
  const [inputAllergen, setInputAllergen] = useState("");
  const [savingAllergens, setSavingAllergens] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS);
  const [statusAllergens, setStatusAllergens] = useState("");

  // keep in sync when Clerk user loads/changes
  useEffect(() => {
    if (userLoaded) {
      const freshHandle =
        user?.username || user?.publicMetadata?.username || (user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "");
      setUsername(freshHandle);
      setBio(user?.publicMetadata?.bio || "");
      const metaAllergens = (user?.publicMetadata?.allergens && Array.isArray(user.publicMetadata.allergens))
        ? user.publicMetadata.allergens
        : [];
      setAllergens(metaAllergens);
    }
  }, [user, userLoaded]);

  // Helpers 
  const normalize = (s) => s.trim();

  const usernameIsValid = (u) => {
    if (!u) return false;
    const clean = u.trim().toLowerCase();
    const re = /^[a-z0-9._-]{3,24}$/;
    return re.test(clean);
  };

  // Save username
  const saveUsername = async () => {
    setStatusMsg("");
    if (!usernameIsValid(username)) {
      setStatusMsg("Invalid username — use 3-24 lowercase letters/numbers or . _ -");
      return;
    }
    const clean = username.trim().toLowerCase();
    setSavingUser(true);
    try {
      if (user && typeof user.update === "function") {
        await user.update({ username: clean });
        setStatusMsg("Username updated");
        setEditing(false);
        setSavingUser(false);
        return;
      }

      // update publicMetadata via user.update
      if (user && typeof user.update === "function") {
        await user.update({ publicMetadata: { ...(user.publicMetadata || {}), username: clean } });
        setStatusMsg("Username updated (metadata)");
        setEditing(false);
        setSavingUser(false);
        return;
      }

      // replace YOUR_SERVER_URL with MongoDB URL (baadme karunga)
      const resp = await fetch("https://YOUR_SERVER_URL/api/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: clean }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setStatusMsg("Username updated (server)");
      setEditing(false);
    } catch (err) {
      console.error("saveUsername error", err);
      setStatusMsg(err?.message || "Failed to update username");
    } finally {
      setSavingUser(false);
    }
  };

  // Save bio 
  const saveBio = async () => {
    // it saves bio in clerk meta data
    setSavingBio(true);
    setStatusMsg("");
    try {
      if (user && typeof user.update === "function") {
        await user.update({ publicMetadata: { ...(user.publicMetadata || {}), bio } });
        setStatusMsg("Bio saved");
        setSavingBio(false);
        return;
      }
      // mongoDB url
      await fetch("https://YOUR_SERVER_URL/api/update-public-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publicMetadata: { ...(user?.publicMetadata || {}), bio } }),
      });
      setStatusMsg("Bio saved (server)");
    } catch (err) {
      console.error("saveBio error", err);
      setStatusMsg(err?.message || "Failed to save bio");
    } finally {
      setSavingBio(false);
    }
  };

  // Allergens logic
  useEffect(() => {
    const q = inputAllergen.trim().toLowerCase();
    if (!q) {
      setFilteredSuggestions(SUGGESTIONS.filter(s => !allergens.some(a => a.toLowerCase() === s.toLowerCase())));
      return;
    }
    const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(q) && !allergens.some(a => a.toLowerCase() === s.toLowerCase()));
    setFilteredSuggestions(filtered);
  }, [inputAllergen, allergens]);

  const addAllergen = async (value) => {
    const val = normalize(value);
    if (!val) {
      setStatusAllergens("Enter an allergen name.");
      return;
    }
    const lower = val.toLowerCase();
    if (allergens.some(a => a.toLowerCase() === lower)) {
      setStatusAllergens(`${val} already added.`);
      return;
    }
    const next = [...allergens, val];
    setAllergens(next);
    setInputAllergen("");
    setStatusAllergens("");
    // auto-save
    try {
      await persistAllergens(next);
      setStatusAllergens(`${val} added.`);
    } catch (err) {
      console.error("auto-save allergens failed", err);
      setStatusAllergens("Failed to save allergens. Tap Save.");
    }
  };

  const removeAllergen = async (value) => {
    const next = allergens.filter(a => a !== value);
    setAllergens(next);
    setStatusAllergens("");
    try {
      await persistAllergens(next);
      setStatusAllergens(`${value} removed.`);
    } catch (err) {
      console.error("removeAllergen error", err);
      setStatusAllergens("Failed to save removal.");
    }
  };

  const persistAllergens = async (nextAllergens) => {
    const normalized = nextAllergens.map(a => normalize(a));
    setSavingAllergens(true);
    try {
      if (user && typeof user.update === "function") {
        await user.update({ publicMetadata: { ...(user.publicMetadata || {}), allergens: normalized } });
        setSavingAllergens(false);
        return;
      }
      // mongoDB URL
      const resp = await fetch("https://YOUR_SERVER_URL/api/update-public-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publicMetadata: { ...(user?.publicMetadata || {}), allergens: normalized } }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setSavingAllergens(false);
    } catch (err) {
      setSavingAllergens(false);
      throw err;
    }
  };

  const saveAllergensNow = async () => {
    setStatusAllergens("");
    setSavingAllergens(true);
    try {
      await persistAllergens(allergens);
      setStatusAllergens("Allergens saved");
    } catch (err) {
      console.error("saveAllergensNow", err);
      setStatusAllergens(err?.message || "Failed to save allergens");
    } finally {
      setSavingAllergens(false);
    }
  };

  // layout sizes
  const { width } = Dimensions.get("window");
  const COVER_H = Math.round(width * 0.45);

  return (
    <SafeAreaView style={{backgroundColor:Colors.primary}}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover */}
        <View style={{ width: "100%", height: Math.round(width * 0.18), backgroundColor: Colors.primary }} />

        {/* Card */}
        <View className="px-6 -mt-8">
          <View className="bg-white rounded-2xl p-5" style={{ elevation: 4 }}>
            {/* Avatar + basic info */}
            <View className="flex-row items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl font-bold text-gray-700">
                  {(user?.firstName && user.firstName[0]) || (username && username[0]?.toUpperCase()) || "U"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text className="text-lg font-bold text-gray-900">
                  {user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.emailAddresses?.[0]?.emailAddress || "User"))}
                </Text>

                <Text className="text-sm text-gray-500 mt-1">
                  {user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""}
                </Text>
              </View>
              <SignOutButton/>
              
            </View>

            {/* Username */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">Username</Text>
              {!editing ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-gray-800">{username || "—"}</Text>
                  <TouchableOpacity onPress={() => setEditing(true)} className="px-3 py-1 bg-green-100 rounded-md">
                    <Text className="text-green-700 font-semibold">Edit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    className="p-3 bg-gray-100 rounded-md"
                    placeholder="choose-a-username"
                  />
                  <View className="flex-row items-center justify-end mt-3">
                    <TouchableOpacity onPress={() => { setEditing(false); setUsername(initialHandle); }} className="px-4 py-2 mr-3">
                      <Text className="text-gray-600">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveUsername} disabled={savingUser} className="px-4 py-2 bg-green-600 rounded-md" style={{ opacity: savingUser ? 0.6 : 1 }}>
                      {savingUser ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Save</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {statusMsg ? <Text className="text-sm text-red-600 mt-2">{statusMsg}</Text> : null}
            </View>

            {/* Bio */}
            <View className="mt-6">
              <Text className="text-sm text-gray-600 mb-2">Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="A short bio (optional)"
                className="p-3 bg-gray-100 rounded-md"
                multiline
                numberOfLines={3}
              />
              <View className="flex-row items-center justify-end mt-3">
                <TouchableOpacity onPress={() => { setBio(user?.publicMetadata?.bio || ""); }} className="px-4 py-2 mr-3">
                  <Text className="text-gray-600">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveBio} disabled={savingBio} className="px-4 py-2 bg-blue-600 rounded-md" style={{ opacity: savingBio ? 0.6 : 1 }}>
                  {savingBio ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Save Bio</Text>}
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferences (kept) */}
            <View className="mt-6">
              <Text className="text-lg font-semibold">Preferences</Text>
              <Text className="text-sm text-gray-500 mt-1">Notifications</Text>
            </View>

            {/* Allergens */}
            <View className="mt-6">
              <Text className="text-lg font-semibold">Allergens</Text>
              <Text className="text-sm text-gray-500 mt-1 mb-3">Manage your food allergens so scans can surface warnings.</Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {allergens.length === 0 ? (
                  <Text className="text-sm text-gray-500">No allergens added yet.</Text>
                ) : (
                  allergens.map((a) => (
                    <View key={a} className="bg-red-100 px-3 py-1 rounded-full mr-2 mb-2" style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text className="text-sm text-red-700">{a}</Text>
                      <TouchableOpacity onPress={() => removeAllergen(a)} className="ml-2">
                        <Text className="text-sm text-red-400">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Add allergen input + suggestions */}
              <TextInput
                placeholder="Type an allergen (e.g. Peanuts)"
                value={inputAllergen}
                onChangeText={setInputAllergen}
                className="p-3 bg-gray-100 rounded-md mt-3"
                autoCapitalize="words"
                onSubmitEditing={() => inputAllergen.trim() && addAllergen(inputAllergen)}
              />

              {suggestionsVisible && filteredSuggestions.length > 0 && (
                <View className="flex-row flex-wrap mt-3">
                  {filteredSuggestions.map(s => (
                    <TouchableOpacity key={s} onPress={() => addAllergen(s)} className="bg-green-100 px-3 py-1 rounded-full mr-2 mb-2">
                      <Text className="text-sm text-green-700">{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <TouchableOpacity onPress={() => addAllergen(inputAllergen)} className="bg-green-600 px-4 py-2 rounded-md mr-3">
                  <Text className="text-white font-semibold">{inputAllergen ? "Add" : "Add custom"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setInputAllergen(""); setSuggestionsVisible(!suggestionsVisible); }} className="bg-gray-200 px-4 py-2 rounded-md">
                  <Text className="text-gray-700">{suggestionsVisible ? "Hide suggestions" : "Show suggestions"}</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-3">
                <TouchableOpacity onPress={saveAllergensNow} disabled={savingAllergens} className="bg-yellow-400 py-3 rounded-md items-center">
                  {savingAllergens ? <ActivityIndicator color="#000" /> : <Text className="text-black font-semibold">Save Allergens</Text>}
                </TouchableOpacity>

                {statusAllergens ? <Text className="text-sm text-gray-600 mt-3">{statusAllergens}</Text> : null}
              </View>
            </View>

            {/* end card */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
