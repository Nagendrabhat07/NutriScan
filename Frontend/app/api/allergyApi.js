// Frontend/app/api/allergyApi.js
import { useAuth } from "@clerk/clerk-expo";
// ⚠️ Change this to your PC IP address
const API_URL = "http://192.168.1.12:5000/api/allergies";

export function useAllergyAPI() {
  const { getToken } = useAuth();
 
  const getAllergies = async () => {
    const token = await getToken();
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("GET /api/allergies →", data);
    return data;
  };

  const createAllergy = async (name) => {
    const token = await getToken();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // 👇 IMPORTANT: key must be "name"
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    console.log("POST /api/allergies →", data);
    return data; // { _id, name, ... }
  };

  const deleteAllergy = async (id) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    console.log("DELETE /api/allergies/:id →", data);
    return data;
  };

  return { getAllergies, createAllergy, deleteAllergy };
}