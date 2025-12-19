from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status':'ok'})

# Placeholder endpoint: accepts image uploads and returns a job id. Actual HR-VITON
# invocation requires the Python model and environment.
@app.route('/tryon', methods=['POST'])
def tryon():
    if 'image' not in request.files:
        return jsonify({'error':'no image provided'}), 400
    # Save file and return acknowledgement (actual processing not implemented)
    f = request.files['image']
    save_path = os.path.join('/tmp', f.filename)
    f.save(save_path)
    return jsonify({'status':'queued', 'path': save_path})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
