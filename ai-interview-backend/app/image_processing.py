import cv2
import dlib
import mediapipe as mp
import numpy as np

# Path to the shape predictor model (update this to your actual model path)
PREDICTOR_PATH = "../data/shape_predictor_68_face_landmarks.dat"
FACE_CASCADE_PATH = "../data/haarcascade_frontalface_default.xml"
EYE_CASCADE_PATH = "../data/haarcascade_eye.xml"

# Initialize MediaPipe Pose detection
mp_pose = mp.solutions.pose

# Intialize face and eye cascade classifiers
face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
eye_cascade = cv2.CascadeClassifier(EYE_CASCADE_PATH)

def detect_gaze(img):
    """
    Detect eyes and determine if the gaze is toward the camera.
    Returns "Looking at Camera" or "Not Looking at Camera".
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    eyes = eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=10, minSize=(30, 30))

    if len(eyes) == 0:
        return "Unknown"

    for (ex, ey, ew, eh) in eyes:
        # Draw rectangle around detected eyes (for debugging/visualization)
        cv2.rectangle(img, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)

        # Focus on the region of interest (eye)
        roi_gray = gray[ey:ey + eh, ex:ex + ew]
        roi_color = img[ey:ey + eh, ex:ex + ew]

        # Detect pupil using Hough Circles
        circles = cv2.HoughCircles(roi_gray,cv2.HOUGH_GRADIENT,1,200,param1=200,param2=1,minRadius=0,maxRadius=0)


        print('Circles:', circles)
        
        if circles is not None:
            circles = np.uint16(np.around(circles))
            for i in circles[0, :]:
                # Draw outer circle
                cv2.circle(roi_color, (i[0], i[1]), i[2], (255, 255, 255), 2)

                # Draw center of the circle
                cv2.circle(roi_color, (i[0], i[1]), 2, (255, 255, 255), 3)

                # Check if the pupil is approximately centered in the eye
                center_x, center_y = i[0], i[1]
                eye_center_x, eye_center_y = ew // 2, eh // 2

                print("Eye Center:", (eye_center_x, eye_center_y))

                # Threshold for determining gaze direction
                if abs(center_x - eye_center_x) < ew * 0.3 and abs(center_y - eye_center_y) < eh * 0.3:
                    return "Looking at Camera"
                
    return "Not Looking at Camera"

# Function to detect facial landmarks using dlib
def face_landmarks(img):
    # Convert image to grayscale for dlib
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Create objects for face detection and landmark detection
    face_detector = dlib.get_frontal_face_detector()
    landmark_detector = dlib.shape_predictor(PREDICTOR_PATH)

    # Detect faces
    faces = face_detector(gray, 0)
    landmarks_all = []

    # For each detected face, extract facial landmarks
    for face in faces:
        landmarks = landmark_detector(gray, face)
        landmarks_all.append(landmarks)

    return landmarks_all, faces

# Smile detection logic using facial landmarks
def check_smile(landmarks_all):
    """
    Analyze smile using specific facial landmarks.
    Returns 1 for a smile and 0 otherwise.
    """

    if not landmarks_all:
        return 0  # No face detected, assume no smile

    # Extract landmarks for the first detected face
    landmarks = landmarks_all[0]

    # Calculate the lips width and jaw width
    lips_width = abs(landmarks.parts()[49].x - landmarks.parts()[55].x)
    jaw_width = abs(landmarks.parts()[3].x - landmarks.parts()[15].x)

    # Calculate the ratio of lips width to jaw width
    ratio = lips_width / jaw_width


    # Threshold for smile detection
    return 1 if ratio > 0.29 else 0


def check_face_looking_at_camera(landmarks_all):
    """
    Determine if the face is approximately looking at the camera.
    This uses the relative alignment of key facial landmarks (nose and eyes).
    """
    if not landmarks_all:
        return "Facing Away"

    landmarks = landmarks_all[0]

    # Indices of the relevant landmarks (68-point model)
    NOSE = 30
    LEFT_EYE = [36, 37, 38, 39, 40, 41]  # Points around the left eye
    RIGHT_EYE = [42, 43, 44, 45, 46, 47]  # Points around the right eye

    # Get the nose position
    nose = landmarks.parts()[NOSE]

    # Get average eye center positions
    left_eye_center = np.mean(
        [(landmarks.parts()[i].x, landmarks.parts()[i].y) for i in LEFT_EYE], axis=0
    )
    right_eye_center = np.mean(
        [(landmarks.parts()[i].x, landmarks.parts()[i].y) for i in RIGHT_EYE], axis=0
    )

    print("Left Eye Center:", left_eye_center)
    print("Right Eye Center:", right_eye_center)

    # Calculate horizontal alignment difference
    eye_center_x = (left_eye_center[0] + right_eye_center[0]) / 2
    horizontal_diff = abs(nose.x - eye_center_x)

    print("Horizontal Diff:", horizontal_diff)

    # Threshold for determining if the face is looking at the camera
    return "Facing Camera" if horizontal_diff < 20 else "Facing Away"


# Analyze eye contact using head pose
def check_eye_contact(landmarks):
    NOSE = 0
    LEFT_EYE = 1
    RIGHT_EYE = 2

    nose = landmarks.landmark[NOSE]
    left_eye = landmarks.landmark[LEFT_EYE]
    right_eye = landmarks.landmark[RIGHT_EYE]

    # Check horizontal alignment of the nose and eyes
    horizontal_diff = abs(nose.x - (left_eye.x + right_eye.x) / 2)

    # Threshold for determining eye contact
    return "Good" if horizontal_diff < 0.1 else "Bad"

# Main image analysis function
def analyze_image(img):
    results = {}

    # Convert PIL image to OpenCV format
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    landmarks_all, _ = face_landmarks(img_cv)

    # Analyze smile
    results['smile'] = check_smile(landmarks_all)
    results['face_direction'] = check_face_looking_at_camera(landmarks_all)
   # results['gaze'] = detect_gaze(img_cv)


    # Analyze posture and eye contact
   # img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
   # with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
   #     pose_results = pose.process(img_rgb)
   #     if pose_results.pose_landmarks:
           # results['eye_contact'] = check_eye_contact(pose_results.pose_landmarks)

    return results
