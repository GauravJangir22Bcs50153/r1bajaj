"use client";
import { useState } from "react";
import axios from "axios";

interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_alphabet: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const filterableKeys = ["numbers", "alphabets", "highest_alphabet"] as const;
type FilterableKey = typeof filterableKeys[number];

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterableKey[]>([]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const parsedInput = JSON.parse(input);
      const { data } = await axios.post<ApiResponse>(`${API_URL}/bfhl`, parsedInput);
      setResponse(data);
      setError("");
    } catch {
      setError("Invalid JSON input. Please check the format and try again.");
    }
  };

  const toggleFilter = (filter: FilterableKey) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    const filteredData = selectedFilters.reduce((acc, key) => {
      acc[key] = response[key];
      return acc;
    }, {} as Partial<Pick<ApiResponse, FilterableKey>>);

    return (
      <div className="mt-4 space-y-2">
        {Object.entries(filteredData).map(([key, value]) => (
          <div key={key} className="p-2 bg-gray-100 rounded-lg">
            <strong className="capitalize">{key.replace("_", " ")}:</strong>
            <span className="ml-2 text-blue-600">{value?.join(", ")}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">22BCS50153</h1>

        <label htmlFor="jsonInput" className="block text-gray-700 font-semibold mb-2">
          API Input
        </label>
        <textarea
          id="jsonInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter JSON input"
          className={`w-full p-3 border rounded-lg mb-4 ${error ? 'border-red-500' : 'border-gray-300'}`}
          rows={4}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Submit
        </button>

        {error && <p className="mt-2 text-red-500 text-center">{error}</p>}

        {response && (
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">Multi Filter</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {filterableKeys.map((filter) => (
                <label key={filter} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(filter)}
                    onChange={() => toggleFilter(filter)}
                    className="accent-blue-500"
                  />
                  <span className="text-gray-700 capitalize">{filter.replace("_", " ")}</span>
                </label>
              ))}
            </div>

            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedFilters.map((filter) => (
                  <div
                    key={filter}
                    className="flex items-center bg-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{filter.replace("_", " ")}</span>
                    <button
                      onClick={() => toggleFilter(filter)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-xl font-bold mb-3">Filtered Response</h2>
            {renderFilteredResponse()}
          </div>
        )}
      </div>
    </div>
  );
}
