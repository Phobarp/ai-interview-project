import Button from "@/components/button";
import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";

// RobotWidget component
const RobotWidget = ({ text, timeSaid }) => {
  return (
    <div className="flex flex-row gap-2 items-start mb-4">
      <div>
        <Image src="/robot.svg" width={24} height={24} alt="Robot Icon" />
      </div>
      <div className="flex flex-col">
        <div className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg font-medium max-w-xs">
          {text}
        </div>
        <div className="text-xs text-gray-400 mt-1">{timeSaid}</div>
      </div>
    </div>
  );
};

// LiveAIFeedback component
const LiveAIFeedback = ({ aiFeedback }) => {
  const feedbackRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever aiFeedback changes
    if (feedbackRef.current) {
      feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight;
    }
  }, [aiFeedback]);

  return (
    <div
      className="p-4 rounded-xl shadow-custom bg-white w-[384px] overflow-scroll"
      ref={feedbackRef}
    >
      <div className="text-black font-bold text-3xl mb-8">Live AI Feedback</div>
      <div>
        {aiFeedback.map((feedback, index) => (
          <RobotWidget
            key={index}
            text={feedback.text}
            timeSaid={feedback.timeSaid}
          />
        ))}
      </div>
    </div>
  );
};
function getCurrentTimeWithSeconds() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM/PM format
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Add leading zero
  const formattedSeconds = seconds.toString().padStart(2, "0"); // Add leading zero
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
}

function getCurrentTimeWithoutSeconds() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM/PM format
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Add leading zero
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Function to calculate elapsed time in "m:ss" format
function getElapsedTime(startTime) {
  const now = new Date();
  const [time, period] = startTime.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);

  // Convert 12-hour time to 24-hour time
  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const startDate = new Date();
  startDate.setHours(hours, minutes, seconds, 0);

  const diffInMilliseconds = now - startDate;
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  const elapsedMinutes = Math.floor(diffInSeconds / 60);
  const elapsedSeconds = diffInSeconds % 60;

  return `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, "0")}`;
}

const BottomBar = () => {
  const startTime = useMemo(() => getCurrentTimeWithoutSeconds(), []);
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Initialize startTime on the client side with seconds included
    const clientStartTime = getCurrentTimeWithSeconds();

    // Update elapsed time every second
    const interval = setInterval(() => {
      if (clientStartTime) {
        setCurrentTime(getElapsedTime(clientStartTime));
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  const navigateFeedback = async () => {
    // Perform get on /api/get-feedback
    const response = await fetch("/api/get-feedback", {
      method: "GET",
    });

    if (response.ok) {
      const { faceScore, smileScore } = await response.json();

      router.push(
        "/feedback?faceScore=" + faceScore + "&smileScore=" + smileScore
      );
    }
  };

  if (!startTime) return null; // Avoid rendering until startTime is set

  return (
    <div className="flex flex-row justify-around items-center">
      <TimingWidget title="Start Time" time={startTime} />
      <Button
        className="text-3xl px-6 py-4 items-center h-max"
        onClick={navigateFeedback}
      >
        <div className="flex flex-row gap-x-2 items-center">
          <Image src="/check.svg" width={40} height={40} alt="Check" />
          <div>End Analysis</div>
        </div>
      </Button>
      <TimingWidget title="Elapsed Time" time={currentTime} />
    </div>
  );
};

const TimingWidget = ({ title, time }) => {
  return (
    <div className="font-inter text-3xl text-center">
      <div className="font-bold">{title}</div>
      <div className="font-light text-[#808080]">{time}</div>
    </div>
  );
};

const VideoWidget = ({ setAIFeedback }) => {
  const webcamRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current) {
        // Capture a screenshot from the webcam
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
          // Send the image to the API and receive AI feedback
          try {
            const response = await fetch("/api/get-feedback", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ image: imageSrc }),
            });

            if (response.ok) {
              const data = await response.json();
              const currentTime = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              if (!data.feedback) return;

              // Update AI feedback list with the new feedback
              setAIFeedback((prev) => [
                ...prev,
                { text: data.feedback, timeSaid: currentTime },
              ]);
            }
          } catch (error) {
            console.error("Error fetching AI feedback:", error);
          }
        }
      }
    }, 2000); // Run every 2s

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [webcamRef, setAIFeedback]);

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-3xl w-[80%] self-center mx-auto"
      />
      <div className="absolute top-4 right-[calc(10%+4px)] flex flex-row gap-x-2 bg-gradient-to-br from-[#6DD861] to-[#69D2AE] text-white font-inter px-4 py-2 text-xl w-max rounded-full font-medium">
        <Image src="/live.svg" width={20} height={20} alt="Live Icon" />
        <div>Live</div>
      </div>
    </div>
  );
};

const Interview = () => {
  const [aiFeedback, setAIFeedback] = useState([]);

  return (
    <div className="flex flex-row h-screen justify-between py-8 px-32 gap-x-6">
      <div className="flex flex-col justify-between h-full w-[65%]">
        <div className="flex flex-col gap-y-2 font-inter">
          <div className="font-bold text-5xl">Analyzing Interview</div>
          <div className="font-light text-[#808080] text-2xl">
            Our AI is analyzing various metrics! We got your back.
          </div>
        </div>
        <VideoWidget setAIFeedback={setAIFeedback} />
        <BottomBar />
      </div>
      <LiveAIFeedback aiFeedback={aiFeedback} />
    </div>
  );
};

export default Interview;
