import { StyleSheet, Text, View, Image, TouchableOpacity, BackHandler, ScrollView, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import axios from 'axios';
import { useAuth } from "@clerk/clerk-expo";

// --- CONFIG ---
const CLOUD_NAME = "dg9nqs3ng";
const UPLOAD_PRESET = "nutriscan_uploads";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
<<<<<<< HEAD

// --- LOCAL SERVER CONFIG (REPLACE IP IF NEEDED) ---
const SERVER_URL = 'http://192.168.1.12:5000/api/ocr'; 

=======
// REPLACE WITH YOUR IP
const SERVER_URL = 'http://192.168.29.109:5000/api/ocr';
>>>>>>> 57e462a48aeb2593150d11c745062fc9f305f601

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const { getToken } = useAuth();
  const cameraRef = useRef(null);
  const router = useRouter();

  // UI State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false); // Controls Retake/Confirm UI
  const [uploading, setUploading] = useState(false);

  // Results State
  const [ocrResult, setOcrResult] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [showDetails, setShowDetails] = useState(false); // Controls Details Modal

  // Permissions & Back Handler
  useEffect(() => {
    (async () => await ImagePicker.requestCameraPermissionsAsync())();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (showDetails) { setShowDetails(false); return true; }
      if (showPreview) { handleRetakePhoto(); return true; }
      if (photo && !uploading && ocrResult) { resetScan(); return true; }
      if (cameraOpen) { setCameraOpen(false); return true; }
      router.back(); return true;
    };
    // Corrected back handler removal
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [showDetails, showPreview, photo, cameraOpen, uploading, ocrResult]);


  // --- ACTIONS ---
  const resetScan = () => {
    setPhoto(null); setShowPreview(false); setOcrResult(null); setUploadedUrl(null); setShowDetails(false);
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setShowPreview(false);
  };

  const handleConfirmPhoto = () => {
    setShowPreview(false); // Hide preview UI
    scanIngredients();     // Start the scan
  };

  const processImage = async (uri) => {
    try {
      const manipulatedResult = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 800 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhoto(manipulatedResult.uri);
      setShowPreview(true); // Show Retake/Confirm UI
    } catch (error) {
      alert("Could not process image");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1,
    });
    if (!result.canceled) processImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync();
      setCameraOpen(false);
      processImage(pic.uri);
    }
  };

  // --- SCAN LOGIC ---
  const scanIngredients = async () => {
    if (!photo) return;
    setUploading(true); setOcrResult(null); setUploadedUrl(null);

    try {
      const token = await getToken();
      const cloudFormData = new FormData();
      cloudFormData.append("file", { uri: photo, type: "image/jpeg", name: "scan.jpg" });
      cloudFormData.append("upload_preset", UPLOAD_PRESET);

      const localFormData = new FormData();
      localFormData.append("file", { uri: photo, type: "image/jpeg", name: "scan.jpg" });

      const [cloudResponse, localResponse] = await Promise.all([
        fetch(CLOUDINARY_URL, { method: "POST", body: cloudFormData }).then(res => res.json()),
        axios.post(SERVER_URL, localFormData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
          timeout: 20000
        })
      ]);

      if (cloudResponse.secure_url) setUploadedUrl(cloudResponse.secure_url);
      if (localResponse.data.status === 'success') setOcrResult(localResponse.data.data);
      else alert("Server Error: " + localResponse.data.message);

    } catch (err) {
      alert("Error: Check your connection.");
    } finally {
      setUploading(false);
    }
  };


  // --- RENDERING HELPERS ---
  const renderOverallStatus = () => {
    if (uploading) return <Text style={styles.statusText}>Analyzing...</Text>;
    if (!ocrResult) return null;

    const flagged = ocrResult.flaggedIngredients || [];
    const hasAllergy = flagged.some(i => i.category.includes("ALLERGY"));
    const hasIssues = flagged.length > 0;

    if (hasAllergy) {
      return <View style={[styles.statusBanner, { backgroundColor: '#ffebee' }]}>
        <Ionicons name="alert-circle" size={36} color="#d32f2f" />
        <Text style={[styles.statusTitle, { color: '#d32f2f' }]}>Allergy Warning!</Text>
      </View>;
    } else if (hasIssues) {
      return <View style={[styles.statusBanner, { backgroundColor: '#fff3e0' }]}>
        <Ionicons name="warning" size={36} color="#ed6c02" />
        <Text style={[styles.statusTitle, { color: '#ed6c02' }]}>Unhealthy Ingredients</Text>
      </View>;
    } else {
      return <View style={[styles.statusBanner, { backgroundColor: '#e8f5e9' }]}>
        <Ionicons name="checkmark-circle" size={36} color="#2e7d32" />
        <Text style={[styles.statusTitle, { color: '#2e7d32' }]}>Looks Healthy!</Text>
      </View>;
    }
  };


  // --- MAIN RENDER ---
  if (!permission?.granted) return <View style={styles.center}><TouchableOpacity onPress={requestPermission} style={styles.button}><Text style={styles.buttonText}>Grant Permission</Text></TouchableOpacity></View>;

  return (
    <View style={styles.container}>
      {cameraOpen ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={takePhoto} style={styles.captureBtn}>
              <Ionicons name="camera" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* 1. INITIAL STATE: Show Camera/Gallery Buttons */}
          {!photo && (
            <>
              <Ionicons name="scan-outline" size={100} color="#ccc" />
              <Text style={{color: '#888', marginTop: 10}}>Scan an ingredient list</Text>
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.button} onPress={() => setCameraOpen(true)}>
                  <Ionicons name="camera-outline" size={24} color="#fff" /><Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Ionicons name="images-outline" size={24} color="#fff" /><Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* 2. PREVIEW STATE: Show Photo + Retake/Confirm Buttons */}
          {photo && showPreview && (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Image source={{ uri: photo }} style={styles.preview} />
              <View style={styles.previewButtons}>
                <TouchableOpacity style={[styles.previewBtn, { backgroundColor: '#FF3B30' }]} onPress={handleRetakePhoto}>
                  <Ionicons name="close" size={24} color="#fff" /><Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.previewBtn, { backgroundColor: '#34C759' }]} onPress={handleConfirmPhoto}>
                  <Ionicons name="checkmark" size={24} color="#fff" /><Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 3. SCANNING/RESULTS STATE: Preview Hidden, Show Results */}
          {photo && !showPreview && (
            <View style={{ alignItems: 'center', width: '100%', marginTop: 30 }}>
              {renderOverallStatus()}

              {/* Show "See Details" button only if scan is done and has issues */}
              {!uploading && ocrResult?.flaggedIngredients?.length > 0 && (
                <TouchableOpacity style={styles.detailsButton} onPress={() => setShowDetails(true)}>
                  <Text style={styles.detailsButtonText}>See Details</Text>
                  <Ionicons name="chevron-forward" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}

               {/* Show "Scan Another" button */}
               {!uploading && ocrResult && (
                <TouchableOpacity style={[styles.button, {marginTop: 30, backgroundColor: '#666', paddingVertical: 12}]} onPress={resetScan}>
                  <Ionicons name="refresh-outline" size={26} color="#fff" />
                  <Text style={styles.buttonText}>Scan Another</Text>
                </TouchableOpacity>
               )}

            </View>
          )}

          {/* --- DETAILS MODAL --- */}
          <Modal animationType="slide" transparent={true} visible={showDetails} onRequestClose={() => setShowDetails(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Flagged Ingredients</Text>
                  <TouchableOpacity onPress={() => setShowDetails(false)}>
                    <Ionicons name="close-circle" size={32} color="#888" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {ocrResult?.flaggedIngredients.map((item, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientName}>{item.name}</Text>
                      <Text style={[
                        styles.ingredientCategory, 
                        item.category.includes("ALLERGY") ? { color: '#d32f2f' } : {}
                      ]}>
                        {item.category}
                      </Text>
                      <Text style={styles.ingredientExplanation}>{item.explanation}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </View>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 30 },
  camera: { flex: 1 },
  cameraControls: { position: "absolute", bottom: 40, alignSelf: "center" },
  captureBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  buttons: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, width: "90%" },
  button: { flexDirection: "row", alignItems: "center", backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  buttonText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 18 }, // Increased font size
  preview: { width: 300, height: 300, borderRadius: 15, resizeMode: "cover", marginBottom: 20, borderWidth: 3, borderColor: '#eee' },
  // Preview Buttons
  previewButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '90%' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  
  // --- UPDATED RESULT STYLES ---
  statusText: { fontSize: 22, color: '#666', marginTop: 30, fontWeight: '600' }, // Larger, bolder
  statusBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 25, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    width: '95%', 
    justifyContent: 'center',
    shadowColor: "#000", 
    shadowOffset: {width: 0, height: 2}, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3
  },
  statusTitle: { fontSize: 26, fontWeight: '800', marginLeft: 15, letterSpacing: 0.5 }, // Much larger, bolder
  
  // Details Button
  detailsButton: { flexDirection: 'row', alignItems: 'center', marginTop: 30, padding: 15, backgroundColor: '#f0f8ff', borderRadius: 12 },
  detailsButtonText: { color: '#007AFF', fontSize: 20, fontWeight: '700', marginRight: 8 }, // Larger, bolder
  
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '75%', shadowColor: "#000", shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.2, shadowRadius: 5, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#333' }, // Larger title
  
  ingredientItem: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ingredientName: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 4 }, // Larger name
  ingredientCategory: { fontSize: 16, color: '#d84315', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }, // Larger category
  ingredientExplanation: { fontSize: 18, color: '#555', lineHeight: 26 }, // Larger explanation text with better line height
});