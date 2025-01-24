from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from flask import send_from_directory

# Initialize Flask app
app = Flask(__name__)

# Set up Google Generative AI configuration
from api_key import api_key  # Ensure this is the correct location for your API key
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

# Serve HTML template
@app.route('/')
def index():
    return render_template('index.html')  # The HTML file located in the templates folder

# Serve static files (CSS, JS)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/get-recommendation', methods=['POST'])
def get_recommendation():
    symptom = request.form.get('symptom')
    if symptom:
        prompt = f"Given the symptom '{symptom}', what are the potential medicine recommendations?"
        try:
            llm_response = model.generate_content([prompt])
            
            # Process the LLM response text into a more structured format
            recommendations = llm_response.text.split("\n")
            formatted_recommendations = []
            
            # Assuming the response has each recommendation on a new line
            for recommendation in recommendations:
                if recommendation.strip():
                    # Split the string into name and description
                    parts = recommendation.split(":")
                    if len(parts) > 1:
                        formatted_recommendations.append({
                            "name": parts[0].strip(),
                            "description": parts[1].strip()
                        })
                    else:
                        formatted_recommendations.append({
                            "name": parts[0].strip(),
                            "description": "No description available"
                        })

            # Limit the response to 5 recommendations
            limited_recommendations = formatted_recommendations[2:8]

            return jsonify({"recommendations": limited_recommendations})

        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "No symptom provided"}), 400

# Run the Flask app
if __name__ == "__main__":
    app.run(port=5002)
