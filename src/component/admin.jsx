import React, { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  where,
  query,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const API_KEY = "acdbd4ee67e9aaab093fe5f4b5cea704";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "",name_lowercase:"",medicine_brand_lowercase:"", description: "", Brand: "",Composition:"",Dose_Indication:"", image: null });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const Auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        loadCategories(user);
      } else {
        setCurrentUser(null);
        setCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCategories = async (user) => {
    if (!user) return;
    const q = query(collection(db, "categories"), where("ownerId", "==", user.uid));
    const snapshot = await getDocs(q);
    setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.data.url;
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert("Not submitted — all fields required.");
      return;
    }
console.log(form.name_lowercase);
    setLoading(true);
    let imageUrl = "";

    try {
      if (form.image) {
        imageUrl = await uploadImage(form.image);
      }

      if (editId) {
        const docRef = doc(db, "categories", editId);
        const docSnap = await getDoc(docRef);
        const existingData = docSnap.data();

        const updatedData = {
          name: form.name || existingData.name,
          name_lowercase:form.name.toLowerCase() || existingData.name.toLowerCase(),
          description: form.description || existingData.description,
          Brand: form.Brand || existingData.Brand,
          medicine_brand_lowercase:form.Brand.toLowerCase() || existingData.form.Brand.toLowerCase(),
          Composition:form.Composition || existingData.Composition,
          image: imageUrl || existingData.image,
          Dose_Indication:form.Dose_Indication || existingData.Dose_Indication,
          ownerId: existingData.ownerId,
        };

        await updateDoc(docRef, updatedData);
        setEditId(null);
      } else {
        const payload = {
          name: form.name,
          name_lowercase:form.name.toLowerCase(),
          description: form.description,
          Brand: form.Brand,
          medicine_brand_lowercase:form.Brand.toLowerCase(),
          Composition:form.Composition,
          Dose_Indication:form.Dose_Indication,
          image: imageUrl || "",
          ownerId: currentUser.uid,
        };

        await addDoc(collection(db, "categories"), payload);
      }

      setForm({ name: "", description: "", Brand: "",Composition:"",Dose_Indication:"", image: null });
      await loadCategories(currentUser);
    } catch (err) {
      console.error("Error uploading or saving:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, name_lowercase:cat.name_lowercase, medicine_brand_lowercase:cat.medicine_brand_lowercase, description: cat.description, Brand: cat.Brand,Composition:cat.Composition ,Dose_Indication:cat.Dose_Indication, image: null });
    setEditId(cat.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "categories", id));
    setCategories(categories.filter((c) => c.id !== id));
  };

  const Logout = () => {
    signOut(Auth)
      .then(() => alert("SignOut successful"))
      .catch((err) => alert(err));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        className="middle none center mp-8 float-end rounded-lg bg-green-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-green-500/20 transition-all hover:shadow-lg hover:shadow-green-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        data-ripple-light="true"
        onClick={Logout}
      >
        SignOut
      </button>
      <h1 className="text-2xl font-bold mb-6">All Medicine</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🧾 Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Medicine" : "Add Medicine"}
          </h2>
          <input
            type="text"
            placeholder="Medicine Generic Name..."
            className="w-full border p-2 rounded-md mb-4"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Medicine Brand Name..."
            className="w-full border p-2 rounded-md mb-4"
            value={form.Brand}
            onChange={(e) => setForm({ ...form, Brand: e.target.value })}
          />
          <textarea
            placeholder="Medicine Introduction..."
            className="w-full border p-2 rounded-md mb-4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
           <textarea
            placeholder="Composition..."
            className="w-full border p-2 rounded-md mb-4"
            value={form.Composition}
            onChange={(e) => setForm({ ...form, Composition: e.target.value })}
          />
           <textarea
            placeholder="Dose & Indication..."
            className="w-full border p-2 rounded-md mb-4"
            value={form.Dose_Indication}
            onChange={(e) => setForm({ ...form, Dose_Indication: e.target.value })}
          />
          <label className="block w-full p-4 border-dashed border-2 border-gray-300 text-center rounded-md cursor-pointer mb-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />
            {form.image ? form.image.name : "Upload or drag image (JPG, PNG, etc.)"}
          </label>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } text-white py-2 rounded-md transition`}
          >
            {loading
              ? "Processing..."
              : editId
              ? "Update Medicine"
              : "Add Medicine"}
          </button>
        </div>

        {/* 📋 List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">All medicine</h2>
          {categories.length === 0 ? (

          <div className="flex flex-col gap-2">
         <div className="h-10 bg-gray-300 rounded-xl"></div>
         <div className="h-10 bg-gray-300 rounded-xl"></div>
         <div className="h-10 bg-gray-300 rounded-xl"></div>
         <div className="h-10 bg-gray-300 rounded-xl"></div>
         </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Medicine</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    </td>
                    <td>{cat.name}</td>
                    <td>{cat.Brand}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;