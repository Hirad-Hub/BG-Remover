import io
import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session
from PIL import Image

app = FastAPI(title="Image Background Remover API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global session to pre-load the model
# Using 'u2net' which is the default for rembg
print("--- [BGClean] Pre-loading AI model (u2net)... ---")
start_time = time.time()
session = new_session("u2net")
print(f"--- [BGClean] Model loaded in {time.time() - start_time:.2f}s ---")

@app.get("/")
async def root():
    return {"message": "Background Remover API is running", "status": "online"}

@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Read image data
        input_data = await file.read()
        
        # Process the image using rembg with the pre-loaded session
        output_data = remove(input_data, session=session)
        
        # Return the processed image as PNG
        return Response(content=output_data, media_type="image/png")
    
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
