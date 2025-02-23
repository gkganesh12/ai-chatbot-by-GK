from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)
# Configure CORS to allow requests from your React app
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://gkganesh12.github.io"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize model and tokenizer
print("Loading model and tokenizer...")
model_name = "gpt2"  # Using GPT-2 instead of the larger Deepseek model
try:
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    if torch.cuda.is_available():
        model = model.to('cuda')
        print("Model loaded on GPU!")
    else:
        print("Model loaded on CPU!")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route("/", methods=["GET"])
def home():
    # Add CORS headers to the response
    response = jsonify({"status": "Server is running"})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    return response

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        # Handling preflight request
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        user_input = request.json.get("message")
        if not user_input:
            return jsonify({"error": "No message provided"}), 400

        # Prepare prompt
        prompt = f"User: {user_input}\nAssistant:"
        
        try:
            # Tokenize input
            inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=512)
            if torch.cuda.is_available():
                inputs = {k: v.to('cuda') for k, v in inputs.items()}

            # Generate response
            with torch.no_grad():
                outputs = model.generate(
                    inputs["input_ids"],
                    max_length=150,  # Limit response length
                    num_return_sequences=1,
                    temperature=0.7,
                    top_k=50,
                    top_p=0.9,
                    pad_token_id=tokenizer.eos_token_id,
                    do_sample=True
                )

            # Decode and clean up response
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Extract only the assistant's response
            response = response.split("Assistant:")[-1].strip()
            
        except Exception as model_error:
            print(f"Model error: {str(model_error)}")
            response = "I apologize, but I'm having trouble processing your request right now. Please try again."

        # Add CORS headers to the response
        response_obj = jsonify({"response": response})
        response_obj.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response_obj

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=8000, debug=True)
