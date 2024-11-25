// State to track results and feedback
let consecutiveResults = {
  face_direction: 0, // Counter for face direction (good behavior streak)
  smile: 0, // Counter for smile (good behavior streak)
  face_direction_bad: 0, // Counter for face direction (poor behavior streak)
  smile_bad: 0, // Counter for smile (poor behavior streak)
};

// Track total attempts and successes for confidence calculation
let metrics = {
  face_direction: { attempts: 0, successes: 0 },
  smile: { attempts: 0, successes: 0 },
};

// Endpoint to handle the POST request (image analysis)
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { image } = req.body;

    try {
      // Call Python backend to analyze the image
      const response = await fetch("http://127.0.0.1:8000/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("data:", data);

        // Track behavior and update streaks
        const { face_direction, smile } = data;

        // Update metrics for confidence calculation
        metrics.face_direction.attempts += 1;
        metrics.smile.attempts += 1;

        if (face_direction === 1) metrics.face_direction.successes += 1;
        if (smile === 1) metrics.smile.successes += 1;

        // Update streaks
        if (face_direction === 1) {
          consecutiveResults.face_direction += 1;
          consecutiveResults.face_direction_bad = 0; // Reset bad streak
        } else {
          consecutiveResults.face_direction_bad += 1;
          consecutiveResults.face_direction = 0; // Reset good streak
        }

        if (smile === 1) {
          consecutiveResults.smile += 1;
          consecutiveResults.smile_bad = 0; // Reset bad streak
        } else {
          consecutiveResults.smile_bad += 1;
          consecutiveResults.smile = 0; // Reset good streak
        }

        // Generate feedback based on current behavior
        const feedback = [];
        if (consecutiveResults.face_direction >= 2) {
          feedback.push("Great job maintaining eye contact with the camera!");
          consecutiveResults.face_direction = 0; // Reset good streak
        }

        if (consecutiveResults.smile >= 2) {
          feedback.push("Nice smile! Keep it up!");
          consecutiveResults.smile = 0; // Reset good streak
        }

        // Feedback for poor behavior (3 consecutive 0s)
        if (consecutiveResults.face_direction_bad >= 3) {
          feedback.push("Try facing the camera to stay engaged!");
          consecutiveResults.face_direction_bad = 0; // Reset bad streak
        }

        if (consecutiveResults.smile_bad >= 3) {
          feedback.push("A smile can make a great impression!");
          consecutiveResults.smile_bad = 0; // Reset bad streak
        }

        // Return feedback immediately after the POST request
        res.status(200).json({ feedback: feedback.join(" ") || "" });
      } else {
        console.error("Error from backend:", data);
        res.status(500).json({ error: data.error || "Internal Server Error" });
      }
    } catch (error) {
      console.error("Error calling Python backend:", error);
      res.status(500).json({ error: "Failed to process the image." });
    }
  } else if (req.method === "GET") {
    // Calculate the confidence score and return it on GET request

    console.log("Metrics:", metrics);

    // Calculate confidence score (out of 100)
    const faceScore =
      (metrics.face_direction.successes / metrics.face_direction.attempts) *
      100;
    const smileScore = (metrics.smile.successes / metrics.smile.attempts) * 100;
    const confidenceScore = ((faceScore + smileScore) / 2).toFixed(2); // Average score of both metrics

    // Return only the confidence score on GET request
    res.status(200).json({ faceScore, smileScore });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
