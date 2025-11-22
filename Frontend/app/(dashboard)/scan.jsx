import { StyleSheet, Text, View, Image, TouchableOpacity, BackHandler } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

const CLOUD_NAME = "dg9nqs3ng"; 
const UPLOAD_PRESET = "nutriscan_uploads"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);              
  const [uploading, setUploading] = useState(false);     
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);  

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setUploadedUrl(null); 
    }
  };

  const takePhoto = async (camera) => {
    if (camera) {
      const pic = await camera.takePictureAsync();
      setPhoto(pic.uri);
      setCameraOpen(false);
      setUploadedUrl(null);
    }
  };

  //Upload local image uri -> Cloudinary
  const uploadToCloudinary = async () => {
  if (!photo) return;

  try {
    setUploading(true);
    setUploadProgress(0);
    setUploadedUrl(null);

    const formData = new FormData();

    // format change
    formData.append("file", {
      uri: photo,
      type: "image/jpeg",       
      name: "scan.jpg",    
    });

    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Cloudinary response:", data);

    if (!res.ok) {
      // error message
      throw new Error(data?.error?.message || "Upload failed");
    }

    if (data.secure_url) {
      setUploadedUrl(data.secure_url);
      setUploadProgress(100);
    } else {
      alert("Upload succeeded, but no URL returned. Check console.");
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    alert(err.message || "Upload failed. Check console logs.");
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
        <View style={styles.content}>
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
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Upload to Cloudinary section */}
          {photo && (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { width: "80%", justifyContent: "center", opacity: uploading ? 0.7 : 1 },
                ]}
                onPress={uploadToCloudinary}
                disabled={uploading}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>
                  {uploading ? "Uploading..." : "Upload to Cloudinary"}
                </Text>
              </TouchableOpacity>

              {/* Progress / status */}
              {uploading && (
                <Text style={{ marginTop: 10 }}>
                  Uploading... {uploadProgress}%
                </Text>
              )}

              {uploadedUrl && (
                <>
                  <Text style={{ marginTop: 10, textAlign: "center" }}>
                    Uploaded URL:
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#007AFF",
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    {uploadedUrl}
                  </Text>
                </>
              )}
            </View>
          )}
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
});
