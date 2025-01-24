from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import base64
from api_key import api_key  # Replace with your actual API key

app = Flask(__name__)

# Configure Google Generative AI
genai.configure(api_key=api_key)

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config
)

# Updated prompt to ensure structured output
default_prompt = """
Analyze the uploaded medical image and provide the following information in a structured format:
1. Disease Name
2. Cause
3. Symptoms (bullet points)
4. Complications (bullet points)
5. Recommendations for the next steps (bullet points)
6. Important Notes (if any)
"""

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_data = data.get("image_data")
        prompt = data.get("prompt", default_prompt)

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode the base64 image
        image_bytes = base64.b64decode(image_data)

        # AI prompt processing
        prompt_parts = [
            {
                "mime_type": "image/jpeg",
                "data": image_bytes
            },
            prompt
        ]

        # Generate content using AI model
        response = model.generate_content(prompt_parts)
        
        # Format response for better readability
        formatted_response = response.text.strip()

        return jsonify({"result": formatted_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=5003)
