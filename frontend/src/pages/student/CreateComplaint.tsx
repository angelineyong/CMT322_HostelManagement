import React, { useState } from "react";
import complaintImage from "../../assets/Tools.png";

const CreateComplaint: React.FC = () => {
  const [facilityType, setFacilityType] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ facilityType, roomNumber, description, image });
    // TODO: Add submission logic here (e.g. send to backend)
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-indigo-50 p-10">
        <img
          src={complaintImage}
          alt="Report Issue"
          className="w-2/4 h-auto rounded-2xl shadow-lg mb-6"
        />
        <p className="text-2xl font-semibold text-indigo-700 text-center">“Notice a problem? Let’s fix it!”</p>
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
          {/* Facility Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            >
              <option value="">Select Facility</option>
              <option value="Hostel">Hostel</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Library">Library</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Sports Complex">Sports Complex</option>
            </select>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Room Number / Location
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Enter room number or location"
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
            className="mt-4 bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
