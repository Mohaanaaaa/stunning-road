import React, { useState } from "react";
import { Upload, MapPin, AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function ReportForm({
  onSubmit,
}: {
  onSubmit: (data: any) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [showHiddenTextBox, setShowHiddenTextBox] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeMap = () => {
    const map = L.map("map").setView([12.9716, 77.5946], 12); // Bengaluru coordinates
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const marker = L.marker([12.9716, 77.5946]).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng(e.latlng);
      setLocation(`${lat}, ${lng}`);

      // Reverse geocoding to get place name
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.display_name) {
            setLocation(data.display_name);
          }
        })
        .catch((err) => console.error("Geocoding error:", err));
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(Object.fromEntries(formData));
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Photo</label>
        <div className="relative">
          {preview ? (
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Upload photo</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            Location
          </div>
        </label>
        {showHiddenTextBox ? (
          <input
            type="text"
            name="location"
            value={location}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <input
            type="text"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter location within Bengaluru region only"
          />
        )}
        <button
          type="button"
          onClick={() => {
            setMapVisible(!mapVisible);
            if (!mapVisible) {
              setTimeout(initializeMap, 300); // Initialize map after toggling
            }
          }}
          className="mt-2 text-blue-600"
        >
          {mapVisible ? "Hide Map" : "Select from Map"}
        </button>
        {mapVisible && <div id="map" className="mt-4 h-48"></div>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Severity
          </div>
        </label>
        <select
          name="severity"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={3}
          spellCheck={true}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the road and its impact... note: use at least traffic and damaged like words"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-700">Use Hidden Text Box</label>
        <input
          type="checkbox"
          checked={showHiddenTextBox}
          onChange={() => setShowHiddenTextBox(!showHiddenTextBox)}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Submit Report
      </button>
    </form>
  );
}
