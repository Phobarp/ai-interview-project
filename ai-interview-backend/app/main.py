# Run command (For Tariq to copy-paste): /Users/tariqmahamid/Library/Python/3.9/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import io
import base64
from image_processing import analyze_image
from feedback_generator import generate_feedback

app = FastAPI()

class ImageData(BaseModel):
    image: str  # Base64 encoded image

@app.post("/analyze-image")
async def get_feedback(data: ImageData):
    # Decode the base64 image data
    image_data = data.image

    img_bytes = base64.b64decode(image_data.split(',')[1])
    img = Image.open(io.BytesIO(img_bytes))

    # Analyze the image
    analysis_results = analyze_image(img)


    # Generate feedback based on analysis
    feedback = generate_feedback(analysis_results)

    print("Feedback:", feedback)

    return feedback
