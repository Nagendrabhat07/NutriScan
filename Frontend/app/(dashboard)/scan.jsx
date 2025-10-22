import { StyleSheet, Text, View, Image, TouchableOpacity, BackHandler } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);
  useEffect(() => {
    const backAction = () => {
      if (photo) {
        setPhoto(null);
        return true;
      } else if (cameraOpen) {
        setCameraOpen(false);
        return true;
      } else {
        router.back();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [photo, cameraOpen]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const takePhoto = async (camera) => {
    if (camera) {
      const pic = await camera.takePictureAsync();
      setPhoto(pic.uri);
      setCameraOpen(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraOpen ? (
        <>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={() => takePhoto(cameraRef.current)} style={styles.captureBtn}>
              <Ionicons name="camera" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.content}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.preview} />
          ) : (
            <Ionicons name="image-outline" size={120} color="#ccc" />
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={() => setCameraOpen(true)}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1 },
  cameraControls: { position: "absolute", bottom: 40, alignSelf: "center" },
  captureBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  buttons: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, width: "90%" },
  button: { flexDirection: "row", alignItems: "center", backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
  preview: { width: 300, height: 300, borderRadius: 10, resizeMode: "cover" },
});
  