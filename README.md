# Speech to Text Expo

A React Native (Expo) app with a local Node.js backend that transcribes audio using [whisper.cpp](https://github.com/ggerganov/whisper.cpp).

---

## Prerequisites

Before running anything, ensure the following are installed on your machine:

| Tool | Purpose |
|------|---------|
| [Node.js](https://nodejs.org/) (v18+) | Backend & frontend tooling |
| [ffmpeg](https://ffmpeg.org/download.html) | Audio conversion (`sudo apt install ffmpeg`) |
| [whisper.cpp](https://github.com/ggerganov/whisper.cpp) | Speech-to-text inference |
| [Android SDK](https://developer.android.com/studio) + ADB | Building/running the Android app |
| Java 17+ | Required by Gradle for Android builds |

### whisper.cpp Setup

The backend expects whisper.cpp to be compiled and a model downloaded at these exact paths:

```
/home/sak/Desktop/whisper.cpp/build/bin/whisper-cli
/home/sak/Desktop/whisper.cpp/models/ggml-small-q8_0.bin
```

To build whisper.cpp and download the model:

```bash
cd ~/Desktop
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
cmake -B build
cmake --build build --config Release
# Download the small quantized model
bash ./models/download-ggml-model.sh small.en-q8_0
```

---

## Project Structure

```
speech-to-text-expo/
├── index.ts              # Express backend entry point
├── functions/
│   ├── speechToText.ts   # Whisper.cpp integration
│   └── audioProcessor.ts # ffmpeg audio conversion
├── processing/           # Temp WAV files (auto-created)
├── uploads/              # Multer upload temp storage
└── client/               # Expo React Native frontend
```

---

## 1. Backend Setup

```bash
cd /home/sak/Desktop/speech-to-text-expo
npm install
```

### Environment Variables

Create a `.env` file in the root (optional — defaults to port 3000):

```env
PORT=3000
```

### Run the Backend

```bash
npm start
```

The server will start on `http://localhost:3000`. You should see:

```
Server is running on port 3000
```

**Keep this terminal open** while using the app.

---

## 2. Frontend Setup

### Configure the Backend URL

The frontend needs to know your **machine's local network IP** (not `localhost`) so the Android device/emulator can reach the backend.

1. Find your LAN IP:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   # e.g. 192.168.1.50
   ```

2. Update `BACKEND_URL` in [client/app/(tabs)/home.tsx](client/app/(tabs)/home.tsx#L11):
   ```ts
   const BACKEND_URL = 'http://<YOUR_LAN_IP>:3000/api/speech-to-text/';
   ```

### Install Dependencies

```bash
cd /home/sak/Desktop/speech-to-text-expo/client
npm install
```

---

## 3. Running the App

> Both the **backend** and **frontend** must be running simultaneously.

### Android (Physical Device via USB)

1. Enable **Developer Options** and **USB Debugging** on your Android device.
2. Connect via USB, then verify ADB detects it:
   ```bash
   adb devices
   ```
3. Run:
   ```bash
   cd client
   npm run android
   ```

This builds and installs the APK on your device, then starts the Metro bundler.

### Android (Emulator)

Start an AVD from Android Studio, then run the same command:

```bash
cd client
npm run android
```

### Web (Browser)

```bash
cd client
npm run web
```

> Note: Audio recording may not work in all browsers.

---

## 4. Building a Release APK

```bash
cd client
npx expo run:android --variant release
```

The APK will be output to:
```
client/android/app/build/outputs/apk/release/app-release.apk
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/speech-to-text` | Transcribe audio (multipart `audio` field) |

### Example Request

```bash
curl -X POST http://localhost:3000/api/speech-to-text \
  -F "audio=@/path/to/recording.m4a"
```

### Example Response

```json
{ "transcript": "Hello, this is a test." }
```

---

## Troubleshooting

**"Backend ping failed" in app logs**
- Confirm the backend is running (`npm start` in root).
- Check `BACKEND_URL` uses your machine's LAN IP, not `localhost`.
- Ensure your phone and computer are on the **same Wi-Fi network**.
- Check firewall rules: `sudo ufw allow 3000`.

**"ffmpeg exited with code 1"**
- Verify ffmpeg is installed: `ffmpeg -version`

**"No such file or directory" for whisper-cli**
- Rebuild whisper.cpp and confirm the binary exists at the path in `functions/speechToText.ts`.

**Gradle build fails**
- Ensure `JAVA_HOME` points to Java 17+: `java -version`
- Try: `cd client/android && ./gradlew clean`
