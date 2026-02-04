import React, { useState, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,Dimensions,ActivityIndicator,ScrollView,StyleSheet,} from"react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useSignOut } from "@clerk/clerk-expo";
import { useNavigation } from "expo-router";
import { Colors } from "../../constant/Colors";
import SignOutButton from "../../components/SignOutButton";
import { useAllergyAPI } from "../api/allergyApi";

// Suggested allergens
const SUGGESTIONS = [
  "Peanuts",
  "Tree nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Sulphites",
  "Gluten",
];

export default function ProfileCombined() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getAllergies, createAllergy, deleteAllergy } = useAllergyAPI();

  const navigation = useNavigation();

  // Username setup
  const initialHandle =
    user?.username ||
    user?.publicMetadata?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(initialHandle || "");
  const [savingUser, setSavingUser] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Bio
  const [bio, setBio] = useState(user?.publicMetadata?.bio || "");
  const [savingBio, setSavingBio] = useState(false);

  // Allergens (MongoDB)
  const [allergens, setAllergens] = useState([]); // always array
  const [inputAllergen, setInputAllergen] = useState("");
  const [savingAllergens, setSavingAllergens] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS);
  const [statusAllergens, setStatusAllergens] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  // Helper to safely get allergen names as lowercase
  const getAllergenNamesLower = () => {
    if (!Array.isArray(allergens)) return [];
    return allergens
      .map((a) => {
        if (!a) return null;
        if (typeof a === "string") return a;
        if (typeof a.name === "string") return a.name;
        return null;
      })
      .filter(Boolean)
      .map((name) => name.toLowerCase());
  };

  // Load allergies from Mongo once Clerk loads
  useEffect(() => {
    if (!userLoaded) return;

    const loadAllergies = async () => {
      try {
        const data = await getAllergies();
        if (Array.isArray(data)) setAllergens(data);
        else {
          console.log("getAllergies returned non-array:", data);
          setAllergens([]);
        }
      } catch (err) {
        console.log("Error fetching allergies:", err);
        setAllergens([]);
      }
    };

    loadAllergies();
  }, [userLoaded]);

  // Filter suggestion tags based on typed allergen
  useEffect(() => {
    const q = inputAllergen.trim().toLowerCase();
    const existingNamesLower = getAllergenNamesLower();

    if (!q) {
      setFilteredSuggestions(
        SUGGESTIONS.filter(
          (s) => !existingNamesLower.includes(s.toLowerCase())
        )
      );
      return;
    }

    const filtered = SUGGESTIONS.filter(
      (s) =>
        s.toLowerCase().includes(q) &&
        !existingNamesLower.includes(s.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [inputAllergen, allergens]);

  // --- Username Update ----
  const usernameIsValid = (u) => /^[a-z0-9._-]{3,24}$/.test(u.trim());
  const saveUsername = async () => {
    setStatusMsg("");

    if (!usernameIsValid(username)) {
      setStatusMsg(
        "Invalid username — use 3-24 lowercase letters/numbers or . _ -"
      );
      return;
    }

    setSavingUser(true);

    try {
      await user.update({ username: username.trim().toLowerCase() });
      setStatusMsg("Username updated");
      setEditing(false);
    } catch (err) {
      setStatusMsg("Failed to update username");
    } finally {
      setSavingUser(false);
    }
  };

  // --- Bio Update ----
  const saveBio = async () => {
    setSavingBio(true);
    try {
      await user.update({
        publicMetadata: { ...(user.publicMetadata || {}), bio },
      });
      setStatusMsg("Bio updated");
    } catch {
      setStatusMsg("Failed to save bio");
    } finally {
      setSavingBio(false);
    }
  };

  // --- ADD ALLERGEN (MongoDB) ----
  const addAllergen = async (value) => {
    const val = value.trim();
    if (!val) {
      setStatusAllergens("Enter an allergen name.");
      return;
    }

    const existingNamesLower = getAllergenNamesLower();
    if (existingNamesLower.includes(val.toLowerCase())) {
      setStatusAllergens(`${val} already exists.`);
      return;
    }

    try {
      setSavingAllergens(true);
      const newEntry = await createAllergy(val); // { _id, name, ... }
      setAllergens((prev) => [...prev, newEntry]);
      setInputAllergen("");
      setStatusAllergens(`${val} added.`);
    } catch (err) {
      console.log(err);
      setStatusAllergens("Failed to save allergen.");
    } finally {
      setSavingAllergens(false);
    }
  };

  // --- DELETE ALLERGEN ----
  const removeAllergen = async (item) => {
    try {
      setSavingAllergens(true);
      await deleteAllergy(item._id);
      setAllergens((prev) => prev.filter((a) => a._id !== item._id));
    } catch {
      setStatusAllergens("Failed to remove allergen.");
    } finally {
      setSavingAllergens(false);
    }
  };

  // UI Layout
  const { width } = Dimensions.get("window");

  return (
    <SafeAreaView
      style={{ backgroundColor: Colors.primary }}
      className="flex-1"
    >
      {/* Top header background */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-yellow-300 tracking-wide">
          PROFILE
        </Text>
        <Text className="text-xl font-medium text-white mt-1">
          Account & Allergies
        </Text>
        <Text className="text-[11px] text-gray-100 mt-1 opacity-80">
          Keep your details and allergy list updated for safer scan results.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="bg-gray-100 "
      >
        {/* Card */}
        <View className="px-6 mt-4">
          <View className="bg-white rounded-3xl p-5 shadow-md">
            {/* Avatar + basic info */}
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mr-4 border border-indigo-100">
                <Text className="text-xl font-bold text-indigo-700">
                  {user?.firstName?.[0] ||
                    username?.[0]?.toUpperCase() ||
                    "U"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                  {user?.fullName || username || "User"}
                </Text>

                <Text
                  className="text-xs text-gray-500 mt-1"
                  numberOfLines={2}
                >
                  {user?.primaryEmailAddress?.emailAddress ||
                    user?.emailAddresses?.[0]?.emailAddress ||
                    ""}
                </Text>
              </View>

              <SignOutButton />
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100 mt-5 mb-4" />

            {/* Username */}
            <View className="mt-2">
              <Text className="text-xs font-semibold text-gray-500 mb-1">
                USERNAME
              </Text>
              {!editing ? (
                <View className="flex-row items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <Text
                    className="text-base text-gray-800"
                    numberOfLines={1}
                  >
                    {username || "—"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditing(true)}
                    className="px-3 py-1 bg-emerald-50 rounded-md"
                  >
                    <Text className="text-[12px] text-emerald-700 font-semibold">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl px-3 py-3">
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    className="px-3 py-2 bg-white rounded-md border border-gray-200"
                    placeholder="choose-a-username"
                  />
                  <View className="flex-row items-center justify-end mt-3">
                    <TouchableOpacity
                      onPress={() => {
                        setEditing(false);
                        setUsername(initialHandle);
                      }}
                      className="px-4 py-2 mr-2"
                    >
                      <Text className="text-gray-500 text-sm">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={saveUsername}
                      disabled={savingUser}
                      className="px-4 py-2 bg-emerald-600 rounded-md"
                      style={{ opacity: savingUser ? 0.6 : 1 }}
                    >
                      {savingUser ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white text-sm font-semibold">
                          Save
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {statusMsg ? (
                <Text className="text-xs text-red-600 mt-2">{statusMsg}</Text>
              ) : null}
            </View>

            {/* Bio */}
            <View className="mt-6">
              <Text className="text-xs font-semibold text-gray-500 mb-1">
                BIO
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="A short bio (optional)"
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                multiline
                numberOfLines={3}
              />
              <View className="flex-row items-center justify-end mt-3">
                <TouchableOpacity
                  onPress={() => {
                    setBio(user?.publicMetadata?.bio || "");
                  }}
                  className="px-4 py-2 mr-2"
                >
                  <Text className="text-gray-500 text-sm">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveBio}
                  disabled={savingBio}
                  className="px-4 py-2 bg-blue-600 rounded-md"
                  style={{ opacity: savingBio ? 0.6 : 1 }}
                >
                  {savingBio ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-sm font-semibold">
                      Save Bio
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Allergens */}
            <View className="mt-7">
              <Text className="text-lg font-semibold text-red-500">
                ALLERGENS
              </Text>
              <Text className="text-[11px] text-gray-500 mt-1 mb-3">
                These are used to warn you during label scans.
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {Array.isArray(allergens) && allergens.length > 0 ? (
                  allergens.map((a, index) => (
                    <View
                      key={a._id || `${a.name}-${index}`}
                      className="bg-red-50 px-3 py-1.5 rounded-full mr-2 mb-2 flex-row items-center border border-red-100"
                    >
                      <Text className="text-[12px] text-red-700">
                        {a.name || "Unknown"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeAllergen(a)}
                        className="ml-2"
                      >
                        <Text className="text-[12px] text-red-400">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-500">
                    No allergens added yet.
                  </Text>
                )}
              </View>

              {/* Add allergen input + suggestions */}
              <TextInput
                placeholder="Type an allergen (e.g. Peanuts)"
                value={inputAllergen}
                onChangeText={setInputAllergen}
                className="p-3 bg-gray-50 rounded-xl mt-3 border border-gray-200 text-sm"
                autoCapitalize="words"
                onSubmitEditing={() => addAllergen(inputAllergen)}
              />

              {suggestionsVisible && filteredSuggestions.length > 0 && (
                <View className="flex-row flex-wrap mt-3">
                  {filteredSuggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => addAllergen(s)}
                      className="bg-emerald-50 px-3 py-1.5 rounded-full mr-2 mb-2 border border-emerald-100"
                    >
                      <Text className="text-[12px] text-emerald-700">
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => addAllergen(inputAllergen)}
                  className="bg-emerald-600 px-4 py-2 rounded-md mr-3"
                >
                  <Text className="text-white text-sm font-semibold">
                    {inputAllergen ? "Add" : "Add custom"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSuggestionsVisible(!suggestionsVisible);
                  }}
                  className="bg-gray-200 px-4 py-2 rounded-md"
                >
                  <Text className="text-xs text-gray-700">
                    {suggestionsVisible ? "Hide suggestions" : "Show suggestions"}
                  </Text>
                </TouchableOpacity>
              </View>

              {statusAllergens ? (
                <Text className="text-xs text-gray-600 mt-3">
                  {statusAllergens}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
