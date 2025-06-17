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
import { PulseLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CLOUD_NAME = "dsxgvpqax";
const UPLOAD_PRESET = "medicine5";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    name_lowercase: "",
    medicine_brand_lowercase: "",
    description: "",
    Brand: "",
    Composition: "",
    Dose_Indication: "",
    Company: "",
    Contraindications:"",
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
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
        setFetching(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCategories = async (user) => {
    if (!user) return;
    try {
      setFetching(true);
      const q = query(collection(db, "categories"), where("ownerId", "==", user.uid));
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      toast.error("Failed to load medicines");
      console.error("Error loading categories:", error);
    } finally {
      setFetching(false);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "samples/medicine");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.warning("Please fill all required fields");
      return;
    }

    setLoading(true);
    let imageUrl = "";

    try {
      if (form.image) {
        imageUrl = await uploadImageToCloudinary(form.image);
      }

      if (editId) {
        const docRef = doc(db, "categories", editId);
        const docSnap = await getDoc(docRef);
        const existingData = docSnap.data();

        const updatedData = {
          name: form.name || existingData.name,
          name_lowercase: form.name.toLowerCase() || existingData.name.toLowerCase(),
          description: form.description || existingData.description,
          Brand: form.Brand || existingData.Brand,
          medicine_brand_lowercase:
            form.Brand.toLowerCase() || existingData.Brand.toLowerCase(),
          Composition: form.Composition || existingData.Composition,
          Dose_Indication: form.Dose_Indication || existingData.Dose_Indication,
          Company: form.Company || existingData.Company,
          Contraindications: form.Contraindications || existingData.Contraindications,
          image: imageUrl || existingData.image,
          ownerId: existingData.ownerId,
        };

        await updateDoc(docRef, updatedData);
        setEditId(null);
        toast.success("Medicine updated successfully");
      } else {
        const payload = {
          name: form.name,
          name_lowercase: form.name.toLowerCase(),
          description: form.description,
          Brand: form.Brand,
          medicine_brand_lowercase: form.Brand.toLowerCase(),
          Composition: form.Composition,
          Dose_Indication: form.Dose_Indication,
          Contraindications:form.Contraindications,
          Company: form.Company,
          image: imageUrl || "",
          ownerId: currentUser.uid,
        };

        await addDoc(collection(db, "categories"), payload);
        toast.success("Medicine added successfully");
      }

      setForm({
        name: "",
        name_lowercase: "",
        medicine_brand_lowercase: "",
        description: "",
        Brand: "",
        Composition: "",
        Dose_Indication: "",
        Contraindications:"",
        Company: "",
        image: null,
      });
      await loadCategories(currentUser);
    } catch (err) {
      toast.error("Operation failed");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      name_lowercase: cat.name_lowercase,
      medicine_brand_lowercase: cat.medicine_brand_lowercase,
      description: cat.description,
      Brand: cat.Brand,
      Composition: cat.Composition,
      Dose_Indication: cat.Dose_Indication,
      Company: cat.Company,
      Contraindications:cat.Contraindications,
      image: null,
    });
    setEditId(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        setCategories(categories.filter((c) => c.id !== id));
        toast.success("Medicine deleted successfully");
      } catch (error) {
        toast.error("Failed to delete medicine");
        console.error("Error deleting category:", error);
      }
    }
  };

  const Logout = () => {
    signOut(Auth)
      .then(() => toast.success("Sign out successful"))
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Medicine Inventory</h1>
          <button
            onClick={Logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
              {editId ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Medicine
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Medicine
                </>
              )}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  value={form.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Napa"
                  value={form.Brand}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, Brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Beximco"
                  value={form.Company}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, Company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  placeholder="Medicine description"
                  value={form.description}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Composition</label>
                <textarea
                  placeholder="Active ingredients"
                  value={form.Composition}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, Composition: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dose & Indication</label>
                <textarea
                  placeholder="Recommended dosage and usage"
                  value={form.Dose_Indication}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form, Dose_Indication: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraindications</label>
                <textarea
                  placeholder="Recommended Contraindications"
                  value={form.Contraindications}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={(e) => setForm({ ...form,  Contraindications: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {form.image ? (
                      <span className="text-sm text-blue-600 font-medium">{form.image.name}</span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 mt-2">Click to upload image</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  />
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || uploadingImage}
                className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${
                  loading || uploadingImage
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading || uploadingImage ? (
                  <>
                    <PulseLoader color="#ffffff" size={8} />
                    {uploadingImage ? "Uploading Image..." : "Processing..."}
                  </>
                ) : editId ? (
                  "Update Medicine"
                ) : (
                  "Add Medicine"
                )}
              </button>

              {editId && (
                <button
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      name: "",
                      name_lowercase: "",
                      medicine_brand_lowercase: "",
                      description: "",
                      Brand: "",
                      Composition: "",
                      Dose_Indication: "",
                      Company: "",
                      Contraindications:"",
                      image: null,
                    });
                  }}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Medicine List Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Medicine List</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {categories.length} items
              </span>
            </div>

            {fetching ? (
              <div className="flex justify-center items-center h-64">
                <PulseLoader color="#3B82F6" size={15} />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-700">No medicines found</h3>
                <p className="mt-1 text-gray-500">Add your first medicine using the form on the left</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cat.Brand}</div>
                          <div className="text-sm text-gray-500">{cat.Company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:text-blue-900 mr-4 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-600 hover:text-red-900 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;