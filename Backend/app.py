from flask import Flask, jsonify, request
import numpy as np
import matplotlib
from matplotlib import pyplot as plt
import scipy
import scipy.io.wavfile as wav
from scipy import signal
import plotly.express as px
from scipy.io import wavfile
import plotly.graph_objects as go
import wave
import soundfile as sf
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_stft_fig(signal_path):
    sf, signal = wav.read(signal_path)
    signal_normalized = signal - np.mean(signal)
    signal_resampled = scipy.signal.decimate(signal_normalized, 6)
    signal_resampled = signal_resampled / (max(abs(signal_resampled)))
    sfnew = sf / 6

    f, t, stft = scipy.signal.stft(signal_resampled, nperseg=int(len(signal_resampled) / 10), fs=sfnew)

    return f[:3000], t, abs(stft[:3000].T)

def sanitize_filename(filename):
    # Replace spaces with underscores and remove any other potentially problematic characters
    return filename.replace(' ', '_').strip()


@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.wav'):
        filename = sanitize_filename(file.filename)
        file_path = os.path.join(filename)
        file.save(file_path)

        f, t, stft = get_stft_fig(file_path)
        
        response = {
            "freqs": f.tolist(),
            "times": t.tolist(),
            "stft": stft.tolist()
        }

        return jsonify(response)

    return jsonify({'error': 'Invalid file format. Only .wav files are allowed'}), 400
