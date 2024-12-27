import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [normalData, setNormalData] = useState(null);
  const [redisData, setRedisData] = useState(null);
  const [normalTimeTaken, setNormalTimeTaken] = useState(null);
  const [redisTimeTaken, setRedisTimeTaken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchType, setFetchType] = useState("");

  const fetchData = async (endpoint, type) => {
    setIsLoading(true);
    setFetchType(type);

    const startTime = performance.now();

    try {
      // Append a unique query parameter to bypass caching
      const response = await axios.get(`${endpoint}?nocache=${Date.now()}`);
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      if (type === "Normal Fetch") {
        setNormalData(response.data);
        setNormalTimeTaken(timeTaken);
      } else if (type === "Redis Fetch") {
        setRedisData(response.data);
        setRedisTimeTaken(timeTaken);
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      if (type === "Normal Fetch") setNormalData(null);
      if (type === "Redis Fetch") setRedisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Product Fetcher</h1>
        <p>Compare normal fetching vs Redis caching</p>
      </header>

      <div className="buttons" style={{ marginBottom: '20px' }}>
  <button
    onClick={() => fetchData("http://localhost:3000/get-Products", "Normal Fetch")}
    disabled={isLoading}
  >
    Fetch Normally
  </button>
  <button
    onClick={() => fetchData("http://localhost:3000/get-Products-viaRedis", "Redis Fetch")}
    disabled={isLoading}
  >
    Fetch via Redis
  </button>
</div>

      {isLoading && <div className="loader">Loading...</div>}

      <div className="result">
        {normalData && (
          <div>
            <h2>Normal Fetch Results</h2>
            <p>
              <strong>Time Taken:</strong>{" "}
              <span className="highlight">{normalTimeTaken} ms</span>
            </p>
            <div className="data">
              <pre>{JSON.stringify(normalData, null, 2)}</pre>
            </div>
          </div>
        )}
        {redisData && (
          <div>
            <h2>Redis Fetch Results</h2>
            <p>
              <strong>Time Taken:</strong>{" "}
              <span className="highlight">{redisTimeTaken} ms</span>
            </p>
            <div className="data">
              <pre>{JSON.stringify(redisData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
