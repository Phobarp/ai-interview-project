"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Function to interpolate colors based on percentage
const getGradientColor = (percentage) => {
  const red = [255, 0, 0]; // Red
  const yellow = [255, 255, 0]; // Yellow
  const green = [0, 255, 0]; // Green

  let color;
  if (percentage < 50) {
    // Interpolate between red and yellow
    const t = percentage / 50;
    color = red.map((c, i) => Math.round(c + t * (yellow[i] - c)));
  } else {
    // Interpolate between yellow and green
    const t = (percentage - 50) / 50;
    color = yellow.map((c, i) => Math.round(c + t * (green[i] - c)));
  }

  return `rgb(${color.join(",")})`;
};

const FeedbackBreakdown = (params) => {
  const searchParams = useSearchParams();

  const smileScore = searchParams.get("smileScore");
  const faceScore = searchParams.get("faceScore");

  // Dummy data
  const categories = [
    { name: "Smile", icon: "😊", score: smileScore },
    { name: "Face", icon: "🤷", score: faceScore },
  ];

  const [animatedScores, setAnimatedScores] = useState(
    categories.map(() => 0) // Initialize all scores at 0
  );

  useEffect(() => {
    const animateBars = () => {
      const startTime = Date.now();
      const duration = 1000; // Animation duration in milliseconds (1 second)

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // Ensure progress stays between 0 and 1

        const updatedScores = categories.map((category) =>
          Math.round(category.score * progress)
        );

        setAnimatedScores(updatedScores);

        if (progress === 1) {
          clearInterval(interval); // Stop the animation when done
        }
      }, 16); // ~60 FPS
    };

    animateBars();
  }, [JSON.stringify(categories)]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-black mb-6">
        Total Interview Score:{" "}
        <span className="text-orange-500">
          {Math.floor(parseFloat(faceScore) + parseFloat(smileScore)) / 2}%
        </span>
      </h1>

      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 w-[140px]">
              <span className="text-2xl">{category.icon}</span>
              <span className="text-lg font-medium">{category.name}</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-6 bg-gray-200 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${animatedScores[index]}%`,
                  backgroundColor: getGradientColor(animatedScores[index]),
                  transition: "width 0.1s ease, background-color 0.5s ease",
                }}
              />
            </div>

            {/* Score */}
            <div className="ml-4 text-lg font-medium text-gray-700">
              {animatedScores[index]}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackBreakdown;
