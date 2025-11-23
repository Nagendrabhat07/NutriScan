import { StyleSheet, Text, View, Image, TouchableOpacity, BackHandler, ScrollView } from "react-native"; 
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator'; 
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import axios from 'axios';

// --- CLOUDINARY CONFIG ---
const CLOUD_NAME = "dg9nqs3ng"; 
const UPLOAD_PRESET = "nutriscan_uploads"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// --- LOCAL SERVER CONFIG (REPLACE IP IF NEEDED) ---
const SERVER_URL = 'http://192.168.29.109:3000/api/ocr'; 

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);              
  const [uploading, setUploading] = useState(false);     
  
  // Results State
  const [ocrResult, setOcrResult] = useState(null);   // Local OCR Result
  const [uploadedUrl, setUploadedUrl] = useState(null); // Cloudinary URL

  const cameraRef = useRef(null);
  const router = useRouter();

  // ask permission for gallery/camera
  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  //Android back button
  useEffect(() => {
    const backAction = () => {
      if (photo) {
        setPhoto(null);
        setOcrResult(null);
        setUploadedUrl(null);
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

  // --- OPTIMIZATION FUNCTION ---
  const processImage = async (uri) => {
    console.log("Optimizing image...");
    try {
      const manipulatedResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], 
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      setPhoto(manipulatedResult.uri); 
      setOcrResult(null); 
      setUploadedUrl(null);
    } catch (error) {
      console.error("Error optimizing:", error);
      alert("Could not process image");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      quality: 1,
    });
    if (!result.canceled) {
      processImage(result.assets[0].uri); 
    }
  };

  const takePhoto = async (camera) => {
    if (camera) {
      const pic = await camera.takePictureAsync();
      setCameraOpen(false);
      processImage(pic.uri); 
    }
  };

  // --- MAIN FUNCTION: UPLOADS TO BOTH CLOUDINARY & LOCAL SERVER ---
  const scanIngredients = async () => {
    if (!photo) return;

    try {
      setUploading(true);
      setOcrResult(null);
      setUploadedUrl(null);

      // 1. Prepare Data for Cloudinary
      const cloudFormData = new FormData();
      cloudFormData.append("file", {
        uri: photo,
        type: "image/jpeg",
        name: "scan.jpg",
      });
      cloudFormData.append("upload_preset", UPLOAD_PRESET);

      // 2. Prepare Data for Local Server
      const localFormData = new FormData();
      localFormData.append("file", {
        uri: photo,
        type: "image/jpeg",       
        name: "scan.jpg",    
      });

      console.log("Starting simultaneous uploads...");

      // 3. EXECUTE BOTH REQUESTS AT THE SAME TIME (Parallel)
      const [cloudResponse, localResponse] = await Promise.all([
        // A. Cloudinary Fetch
        fetch(CLOUDINARY_URL, {
          method: "POST",
          body: cloudFormData,
        }).then(res => res.json()),

        // B. Local Server Axios
        axios.post(SERVER_URL, localFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000 // 15 sec timeout
        })
      ]);

      // 4. Handle Cloudinary Result
      console.log("Cloudinary Result:", cloudResponse);
      if (cloudResponse.secure_url) {
        setUploadedUrl(cloudResponse.secure_url);
      }

      // 5. Handle Local Server Result
      console.log("Local Server Result:", localResponse.data);
      if (localResponse.data.status === 'success') {
        setOcrResult(localResponse.data.data); 
      } else {
        alert("Server Error: " + localResponse.data.message);
      }

    } catch (err) {
      console.error("Upload error:", err);
      alert("Error: Check your connection or server status.");
    } finally {
      setUploading(false);
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
            <TouchableOpacity
              onPress={() => takePhoto(cameraRef.current)}
              style={styles.captureBtn}
            >
              <Ionicons name="camera" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Preview area */}
          {photo ? (
            <Image source={{ uri: photo }} style={styles.preview} />
          ) : (
            <Ionicons name="image-outline" size={120} color="#ccc" />
          )}

          {/* Main buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCameraOpen(true)}
            >
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Button section */}
          {photo && (
            <View style={{ marginTop: 20, alignItems: "center", width: '100%' }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { width: "80%", justifyContent: "center", opacity: uploading ? 0.7 : 1 },
                ]}
                onPress={scanIngredients} 
                disabled={uploading}
              >
                <Ionicons name="scan-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>
                  {uploading ? "Processing..." : "Scan & Upload"}
                </Text>
              </TouchableOpacity>

              {/* --- CLOUDINARY URL RESULT --- */}
              {uploadedUrl && (
                <View style={[styles.resultBox, { backgroundColor: '#e6f7ff' }]}>
                  <Text style={styles.resultTitle}>Cloudinary Upload:</Text>
                  <Text style={{color: 'blue', fontSize: 12}}>{uploadedUrl}</Text>
                </View>
              )}

              {/* --- LOCAL OCR RESULT --- */}
              {ocrResult && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultTitle}>Analysis Results:</Text>
                  
                  {/* Just displaying the raw JSON nicely */}
                  <Text style={styles.resultText}>
                    {JSON.stringify(ocrResult, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

};

export default Scan;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 }, 
  camera: { flex: 1 },
  cameraControls: { position: "absolute", bottom: 40, alignSelf: "center" },
  captureBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "90%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
  preview: { width: 300, height: 300, borderRadius: 10, resizeMode: "cover" },
  
  resultBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '90%',
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace' // Makes JSON look better
  }
});