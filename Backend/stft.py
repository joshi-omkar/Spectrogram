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
from flask import Flask

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, World!'


def get_stft_fig(signal_path):
    sf, signal = wav.read(signal_path)
    signal_normalized = signal - np.mean(signal)
    signal_resampled = scipy.signal.decimate(signal_normalized, 6)
    signal_resampled = signal_resampled / (max(abs(signal_resampled)))
    sfnew = sf / 6

    f, t, stft = scipy.signal.stft(signal_resampled, nperseg=int(len(signal_resampled) / 10), fs=sfnew)

   
    colorscale = [
        [0, '#000000'],        # Define the lowest value color (black)
        [0.1, '#000080'],      # Define a darker color for small values
        [0.3, '#008000'],      # Define a color for values around 0.3
        [0.5, '#00FF00'],      # Define a middle color for intermediate values
        [0.7, '#FFFF00'],      # Define a color for values around 0.7
        [0.9, '#FFA500'],      # Define a brighter color for larger values
        [1, '#FF0000']         # Define the highest value color (red)
    ]
   
    stft_fig = go.Figure(data=go.Heatmap(z=abs(stft[:3000].T), x=f[:3000], y=t, colorscale=colorscale))
    stft_fig.update_layout(title='STFT',xaxis=dict(title='frequency'),yaxis=dict(title='time'))
    return stft_fig.show()

signal_path = r"C:\Users\lenovo\Downloads\1. Fleet type submarine, 120 RPM, 6 knots.wav"
stft_fig = get_stft_fig(signal_path)