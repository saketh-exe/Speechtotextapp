# Project Report: Speech-to-Text Expo Application

## 1. Executive Summary
The **Speech-to-Text Expo** project is a comprehensive, cross-platform mobile and web application engineered to record, process, and transcribe audio locally. Built on a modern React Native (Expo) frontend and a Node.js (Express) backend, the application focuses on high-performance, privacy-first offline transcription utilizing the `whisper.cpp` engine. To bridge current feature gaps while the native chat functionality is under development, the system integrates a Retrieval-Augmented Generation (RAG) architecture using the Gemini API, enabling intelligent interaction with historical call recordings and transcriptions.

## 2. Project Overview & Objectives
The primary objective of this project is to provide a seamless, end-to-end voice transcription pipeline that:
- Captures high-quality audio across iOS, Android, and Web platforms.
- Transforms and normalizes audio payloads for machine learning inference.
- Executes highly optimized, local speech-to-text inference without relying on cloud-based transcription APIs for the core conversion.
- Provides intelligent conversational capabilities over past recordings using advanced LLM integrations.

## 3. Architecture & Technical Stack

### 3.1. Frontend Architecture (Client)
- **Framework:** React Native (0.81.5) powered by Expo (SDK ~54).
- **Navigation:** Expo Router for dynamic, file-based routing and structured tab layouts (`home`, `chat`, `library`).
- **Language:** TypeScript (TSX) for strict type safety.
- **Media Handling:** `expo-audio` and `expo-av` for robust multimedia recording, playback, and visual pulse feedback.
- **Storage & Caching:** `@react-native-async-storage/async-storage` combined with `expo-file-system` (and `localforage` for web), ensuring resilient persistent tracking of audio URIs and transcriptions.

### 3.2. Backend Architecture (API Gateway)
- **Framework:** Node.js with Express, written in TypeScript (`ts-node`).
- **File Handling:** `multer` for secure, multipart form-data staging into disk storage (`processing/` and `uploads/` directories) to prevent memory buffer overloads.
- **Audio Processing Pipeline (`functions/audioProcessor.ts`):** A child-process wrapper interfacing with `ffmpeg` to strictly format incoming multi-platform audio streams (`.m4a`, web blobs) into the rigid format required by the inference engine (16kHz, mono channel, 16-bit PCM `.wav`).

### 3.3. Inference Engine (`functions/speechToText.ts`)
- **Core Technology:** `whisper.cpp` (whisper-cli), a high-performance C++ port of OpenAI's Whisper model.
- **Model:** `ggml-small-q8_0.bin` definition for an optimal balance of accuracy and local execution speed.
- **Execution:** Spawns via system threads, utilizing maximum host CPU cores (`os.cpus().length`) to minimize processing latency.

## 4. Core Features & Capabilities

### 4.1. Universal Recording & Playback
The `Home` screen serves as the primary interface, offering a polished recording experience with animated visual feedback (pulse frames) and tactile responses (`expo-haptics`). Users can review, playback, or discard recordings prior to server submission.

### 4.2. Secure Staging and Formatting
Audio payloads are intercepted by the backend and safely staged on disk. The system automatically creates timestamped duplicates in a `debug/` environment for metric tracking before piping the files through `ffmpeg` for strict normalization (PCM `s16le`). 

### 4.3. Local Edge-AI Transcription
Unlike conventional apps that stream voice data to third-party APIs, the core transcription relies entirely on local system paths and binary deployments. This guarantees data privacy and creates a highly functional localized edge AI tool.

### 4.4. Persistent Offline Caching
Post-transcription, the client reliably moves native audio into persistent offline storage, maintaining a synchronized mapping of audio URIs to transcribed text within local device storage.

## 5. Current State & Immediate Roadmap

The application is currently in a mature prototype / MVP (Minimum Viable Product) stage. The core loop—recording, backend ingestion, audio normalization, local inference, and client-side caching—is fully functional and heavily instrumented with backend logging metrics (bytes transferred, time taken per step).

### 5.1. Chat Module & Gemini API Integration (RAG Strategy)
While the `Chat` and `Library` tabs exist structurally, the native conversational interface is currently a work-in-progress. To deliver immediate value:
- **RAG Implementation:** Since the chat section isn't fully implemented yet, the project utilizes the **Gemini API** coupled with the stored call recordings to conduct Retrieval-Augmented Generation (RAG).
- **Workflow:** Transcribed text from previous sessions is indexed and vectorized. When a user queries the chat, the system retrieves the most relevant semantic chunks from past call recordings and feeds them into the Gemini model as context.
- **Result:** This allows the user to intuitively "chat with their recordings," summarizing past meetings, extracting action items, or searching for specific spoken details without requiring the final bespoke conversational UI to be finished.

## 6. Conclusion
The Speech-to-Text Expo project successfully demonstrates a highly capable, privacy-centric voice processing pipeline. By offloading the transcription workload to a localized C++ engine (`whisper.cpp`) and intelligently augmenting the current feature set with a Gemini-powered RAG architecture for historical call data, the system provides a robust, scalable foundation for future enhancements in conversational AI and media management.