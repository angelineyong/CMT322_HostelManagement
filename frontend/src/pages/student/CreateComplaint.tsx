import React, { useState, useEffect } from "react";
import complaintImage from "../../assets/Tools.png";
import { supabase } from "../../lib/supabaseClient";

const CreateComplaint: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [facilityType, setFacilityType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [facilityTypes, setFacilityTypes] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    (async () => {
      if (!category) {
        setError("Please choose a category.");
        return;
      }
      if (!facilityType) {
        setError("Please choose a facility type.");
        return;
      }
      if (!description.trim()) {
        setError("Please enter a description.");
        return;
      }

      setLoading(true);
      try {
        const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string) || "complaint";
        let publicUrl: string | null = null;

        const insertPayload: any = {
          facility_type: Number(facilityType),
          description: description.trim(),
          status: 1, // initial status (Submitted)
        };

        // attach authenticated user id when available (safe no-op if not signed in)
        try {
          // supabase.auth.getUser() returns { data: { user } } in latest client
          // fall back safely if method not available
          const userResult = await supabase.auth.getUser?.();
          const user = userResult?.data?.user ?? null;
          if (user && user.id) insertPayload.user_id = user.id;
        } catch (e) {
          // ignore auth errors here; insertion will proceed without user_id
        }

        if (image) {
          const fileName = `${Date.now()}_${image.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, image as File, { cacheControl: "3600", upsert: false });

          if (uploadError) {
            // stop and surface upload error instead of inserting without image
            // eslint-disable-next-line no-console
            console.error("Supabase storage upload error:", uploadError);
            setError(`Image upload failed: ${uploadError.message}`);
            setLoading(false);
            return;
          }

          // uploadData.path contains the stored path; also get a public URL
          const uploadedPath = (uploadData as any)?.path ?? fileName;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath);
          publicUrl = (urlData as any)?.publicUrl ?? null;
          // include stored path in DB so you can later verify and generate URL server-side if needed
          insertPayload.image_path = uploadedPath;
        }

        if (publicUrl) insertPayload.image_url = publicUrl;

        const { data: inserted, error: insertError } = await supabase
          .from("complaint")
          .insert([insertPayload]);

        if (insertError) {
          throw insertError;
        }

        // success
        setShowPopup(true);
        // reset form
        setCategory("");
        setFacilityType("");
        setDescription("");
        setImage(null);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("Error submitting complaint:", err);
        setError(err?.message || "Failed to submit complaint.");
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    const loadFacilityTypes = async () => {
      try {
        const { data, error } = await supabase.from("facility_type").select("*");
        if (error) throw error;
        setFacilityTypes(data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed loading facility types:", err);
      }
    };

    loadFacilityTypes();
  }, []);

  // derive options from DB; filter by numeric category_id: 1 = Individual, 2 = Shared
  const facilityOptions = facilityTypes.filter((f) => {
    if (!category) return false;
    const catId = f.category_id ?? f.categoryId ?? (f.category ? Number(f.category) : null);
    if (category === "Individual") return Number(catId) === 1;
    if (category === "Shared") return Number(catId) === 2;
    return false;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      
      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-indigo-50 p-4 sm:p-8 lg:p-10">
        <img
          src={complaintImage}
          alt="Report Issue"
          className="w-2/3 sm:w-1/2 h-auto rounded-2xl shadow-lg mb-4 sm:mb-6"
        />
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-indigo-700 text-center px-2">
          "Notice a problem? Let's fix it!"
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-700 mb-6 sm:mb-8">
          Create a New Complaint
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
          
          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 sm:mb-3 text-sm lg:text-base">Category*</label>
            <div className="flex gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => { setCategory("Individual"); setFacilityType(""); }}
                className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold border transition-all transform text-sm sm:text-base ${
                  category === "Individual"
                    ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Individual
              </button>

              <button
                type="button"
                onClick={() => { setCategory("Shared"); setFacilityType(""); }}
                className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold border transition-all text-sm sm:text-base ${
                  category === "Shared"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Shared
              </button>
            </div>
          </div>

          {/* Facility Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">Facility Type</label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              disabled={!category}
              className={`w-full border rounded-lg p-2 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none ${
                !category ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              required
            >
              <option value="">
                {category ? "Select Facility" : "Please choose a category first"}
              </option>

              {facilityOptions.map((item: any) => (
                <option key={item.id} value={String(item.id)}>
                  {item.facility_type ?? item.name ?? item.label ?? `Type ${item.id}`}
                </option>
              ))}
            </select>
          </div>
 
          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">Issue Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">
              Upload Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg p-2 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />

            {image && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Selected: {image.name}</p>
            )}
          </div>

          {/* Submit */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 sm:mt-4 ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-2 sm:py-3 rounded-lg text-sm sm:text-lg font-semibold transition-all duration-300 ${loading ? '' : 'hover:scale-105 hover:shadow-lg'}`}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>

        </form>
      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <>
          <style>
            {`
              /* Wheel spin */
              @keyframes wheelRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }

              /* Fade in tick circle */
              @keyframes tickFade {
                0% { opacity: 0; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
              }

              .wheel-loader {
                width: 70px;
                height: 70px;
                border: 6px solid #d1e7dd;
                border-top-color: #2ecc71;
                border-radius: 50%;
                animation: wheelRotate 0.8s ease-out forwards;
              }

              .tick-circle {
                width: 80px;
                height: 80px;
                background-color: #22c55e; /* Tailwind green-500 */
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                animation: tickFade 0.4s ease-out forwards;
                animation-delay: 0.75s; /* appears after wheel */
              }

              .tick-icon {
                width: 48px;
                height: 48px;
                color: white;
              }
            `}
          </style>

          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center w-11/12 sm:w-90 max-w-sm">

              <div className="flex justify-center mb-4 relative w-20 h-20 mx-auto">
                <div className="wheel-loader absolute"></div>
                  <div className="tick-circle absolute">
                    <svg
                      className="tick-icon"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

              <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                Complaint Submitted!
              </h3>

              <p className="text-gray-700 mb-4 sm:mb-5 text-xs sm:text-sm">
                Your complaint has been filed successfully.
              </p>

              <button
                onClick={() => setShowPopup(false)}
                className="bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base hover:bg-indigo-700 transition"
              >
                Close
              </button>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default CreateComplaint;
