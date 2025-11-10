import React, { useState } from "react";
import complaintImage from "../../assets/Tools.png";

const CreateComplaint: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [facilityType, setFacilityType] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ category, facilityType, roomNumber, description, image });
    // TODO: Add backend submission logic here
  };

  // Facility type options based on selected category
  const individualFacilities = [
    "Ceiling fan",
    "Key",
    "Table lamp",
    "Ceiling light",
    "Furniture",
    "Electrical socket / Power Connection",
    "Other facilities in the room",
  ];

  const sharedFacilities = [
    "Study Room",
    "Bathroom",
    "TV Room",
    "Corridor",
    "Pantry",
    "Surau / Prayer Room",
    "Others",
  ];

  const facilityOptions =
    category === "Individual" ? individualFacilities : sharedFacilities;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-indigo-50 p-10">
        <img
          src={complaintImage}
          alt="Report Issue"
          className="w-1/2 h-auto rounded-2xl shadow-lg mb-6"
        />
        <p className="text-2xl font-semibold text-indigo-700 text-center">
          “Notice a problem? Let’s fix it!”
        </p>
      </div>

      {/* Right Section (Form) */}
      <div className="w-1/2 overflow-y-auto p-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-8">
          Create a New Complaint
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg"
        >
          {/* Category Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">
              Category*
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setCategory("Individual");
                  setFacilityType("");
                }}
                className={`w-1/2 py-3 rounded-lg font-semibold border transition-all transform ${
                  category === "Individual"
                    ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Individual
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("Shared");
                  setFacilityType("");
                }}
                className={`w-1/2 py-3 rounded-lg font-semibold border transition-all ${
                  category === "Shared"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Shared
              </button>
            </div>
          </div>

          {/* Facility Type Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              disabled={!category} // disable until category chosen
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none ${
                !category ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              required
            >
              <option value="">
                {category
                  ? "Select Facility"
                  : "Please choose a category first"}
              </option>
              {facilityOptions.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="eg. 01-07A"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Issue Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
              required
            ></textarea>
          </div>

          {/* Upload Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-gray-600 border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
            {image && (
              <p className="text-sm text-gray-500 mt-2">
                Selected: {image.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-all transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;