import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, session
import openai

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")  # Now loaded from .env

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_question = request.json.get('question')
    session['history'] = session.get('history', []) # Append the user's question to the session history with a specified role of 'user' 
    session['history'].append({"role": "user", "content": f"Answer this Bible question: {user_question}"}) # formatted content that indicates it is a Bible question.

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=session['history'],
            temperature=0.6,
            max_tokens=150  
        )

        full_text = response.choices[0].message.content if response.choices else ""
        # Save full response and provide initial part to the client
        session['full_response'] = full_text
        initial_response = full_text[:full_text.rfind('. ') + 1]  # Attempt to end at a complete sentence
        session['history'].append({"role": "system", "content": initial_response})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

    return jsonify({"response": initial_response})

@app.route('/expand', methods=['POST'])
def expand():
    # Ensure the expanded content starts right after the initially provided content
    full_response = session.get('full_response', '')
    initial_response = session['history'][-1]['content'] if session['history'] else ''
    expanded_content = full_response[len(initial_response):]  # Continue from where initial content ended
    return jsonify({"expandedContent": expanded_content})

@app.route('/reset', methods=['POST'])
def reset():
    # Clear the session to reset the history
    session.clear()
    return jsonify({"message": "Session and history cleared!"})



if __name__ == '__main__':
     app.run(host='0.0.0.0', port=5000, debug=True)
