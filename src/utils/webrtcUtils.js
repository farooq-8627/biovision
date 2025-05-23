/**
 * Connection states for WebRTC
 */
export const ConnectionState = {
	NEW: "new",
	CONNECTING: "connecting",
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	FAILED: "failed",
	CLOSED: "closed",
};

/**
 * Create a new RTCPeerConnection with enhanced state management
 * @param {Object} config - Configuration for the peer connection
 * @param {Function} onStateChange - Callback for connection state changes
 * @returns {RTCPeerConnection} The created peer connection
 */
export const createPeerConnection = (config = {}, onStateChange = null) => {
	const defaultConfig = {
		iceServers: [
			{
				urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
			},
			{
				urls: [
					"stun:stun2.l.google.com:19302",
					"stun:stun3.l.google.com:19302",
				],
			},
			{ urls: ["stun:stun4.l.google.com:19302"] },
			{
				urls: "turn:numb.viagenie.ca",
				username: "webrtc@live.com",
				credential: "muazkh",
			},
			{
				urls: "turn:turn.anyfirewall.com:443?transport=tcp",
				username: "webrtc",
				credential: "webrtc",
			},
		],
		iceCandidatePoolSize: 10,
		bundlePolicy: "max-bundle",
		rtcpMuxPolicy: "require",
		iceTransportPolicy: "all",
	};

	const mergedConfig = { ...defaultConfig, ...config };
	const peerConnection = new RTCPeerConnection(mergedConfig);

	// Enhanced logging and state management
	peerConnection.addEventListener("connectionstatechange", () => {
		const state = peerConnection.connectionState;
		console.log("Connection state changed:", state);

		if (state === "failed" || state === "disconnected") {
			console.warn("Connection issues detected. Attempting to recover...");
			tryReconnect(peerConnection);
		}

		if (onStateChange) {
			onStateChange(state);
		}
	});

	peerConnection.addEventListener("iceconnectionstatechange", () => {
		console.log("ICE connection state:", peerConnection.iceConnectionState);
		if (peerConnection.iceConnectionState === "failed") {
			console.warn("ICE connection failed. Attempting to restart ICE...");
			peerConnection.restartIce();
		}
	});

	peerConnection.addEventListener("icegatheringstatechange", () => {
		console.log("ICE gathering state:", peerConnection.iceGatheringState);
	});

	peerConnection.addEventListener("icecandidateerror", (event) => {
		console.error("ICE candidate error:", {
			errorCode: event.errorCode,
			errorText: event.errorText,
			hostCandidate: event.hostCandidate,
			url: event.url,
		});
	});

	// Add data channel for connection monitoring
	const monitorChannel = peerConnection.createDataChannel("monitor", {
		negotiated: true,
		id: 0,
	});
	monitorChannel.onopen = () => console.log("Monitor channel opened");
	monitorChannel.onclose = () => console.log("Monitor channel closed");
	monitorChannel.onerror = (error) =>
		console.error("Monitor channel error:", error);

	return peerConnection;
};

/**
 * Try to recover a failed connection
 * @param {RTCPeerConnection} peerConnection - The peer connection to recover
 */
const tryReconnect = async (peerConnection) => {
	if (!peerConnection) return;

	try {
		// Try to restart ICE
		await peerConnection.restartIce();

		// If there are existing transceivers, try to restart them
		peerConnection.getTransceivers().forEach((transceiver) => {
			if (transceiver.sender) {
				try {
					transceiver.sender.replaceTrack(transceiver.sender.track);
				} catch (error) {
					console.warn("Error restarting transceiver:", error);
				}
			}
		});
	} catch (error) {
		console.error("Error during connection recovery:", error);
	}
};

/**
 * Add tracks from a media stream to a peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {MediaStream} stream - The media stream containing tracks to add
 */
export const addStreamToPeerConnection = (peerConnection, stream) => {
	if (!peerConnection || !stream) return;

	stream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, stream);
	});
};

/**
 * Create a data channel on a peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {String} label - The label for the data channel
 * @param {Object} options - Options for the data channel
 * @returns {RTCDataChannel} The created data channel
 */
export const createDataChannel = (peerConnection, label, options = {}) => {
	if (!peerConnection) return null;

	const defaultOptions = {
		ordered: true,
	};

	const mergedOptions = { ...defaultOptions, ...options };

	return peerConnection.createDataChannel(label, mergedOptions);
};

/**
 * Create an offer for a peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @returns {Promise<RTCSessionDescription>} A promise that resolves to the created offer
 */
export const createOffer = async (peerConnection) => {
	if (!peerConnection) throw new Error("Peer connection is null");

	const offer = await peerConnection.createOffer({
		offerToReceiveAudio: true,
		offerToReceiveVideo: true,
	});

	await peerConnection.setLocalDescription(offer);

	return offer;
};

/**
 * Create an answer for a peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @returns {Promise<RTCSessionDescription>} A promise that resolves to the created answer
 */
export const createAnswer = async (peerConnection) => {
	if (!peerConnection) throw new Error("Peer connection is null");

	const answer = await peerConnection.createAnswer();

	await peerConnection.setLocalDescription(answer);

	return answer;
};

/**
 * Set the remote description on a peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {RTCSessionDescription} description - The session description to set
 * @returns {Promise<void>} A promise that resolves when the description is set
 */
export const setRemoteDescription = async (peerConnection, description) => {
	if (!peerConnection) throw new Error("Peer connection is null");

	await peerConnection.setRemoteDescription(
		new RTCSessionDescription(description)
	);
};

/**
 * Handle ICE candidate exchange
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {Function} onIceCandidate - Callback when new ICE candidate is available
 */
export const handleICECandidateExchange = (peerConnection, onIceCandidate) => {
	if (!peerConnection) return;

	peerConnection.onicecandidate = (event) => {
		if (event.candidate) {
			if (onIceCandidate) {
				onIceCandidate(event.candidate);
			}
		}
	};
};

/**
 * Add ICE candidate to peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {RTCIceCandidate} candidate - The ICE candidate to add
 */
export const addICECandidate = async (peerConnection, candidate) => {
	if (!peerConnection || !candidate) return;

	try {
		await peerConnection.addIceCandidate(candidate);
	} catch (error) {
		console.error("Error adding ICE candidate:", error);
	}
};

/**
 * Reconnect peer connection
 * @param {RTCPeerConnection} peerConnection - The peer connection
 * @param {MediaStream} stream - The media stream
 * @returns {Promise<RTCSessionDescription>} A promise that resolves to the new offer
 */
export const reconnectPeerConnection = async (peerConnection, stream) => {
	if (!peerConnection || !stream)
		throw new Error("Invalid parameters for reconnection");

	try {
		// Remove all existing tracks
		const senders = peerConnection.getSenders();
		senders.forEach((sender) => peerConnection.removeTrack(sender));

		// Add new tracks
		stream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, stream);
		});

		// Create and set new offer
		const offer = await createOffer(peerConnection);
		return offer;
	} catch (error) {
		console.error("Error reconnecting peer connection:", error);
		throw error;
	}
};

/**
 * Get user media with enhanced error handling and constraints
 * @param {Object} constraints - The constraints for getUserMedia
 * @returns {Promise<MediaStream>} A promise that resolves to the media stream
 */
export const getUserMedia = async (constraints = {}) => {
	const defaultConstraints = {
		audio: true,
		video: {
			facingMode: "user",
			width: { ideal: 1280 },
			height: { ideal: 720 },
			frameRate: { ideal: 30 },
		},
	};

	const mergedConstraints = { ...defaultConstraints, ...constraints };

	try {
		// First try with ideal constraints
		return await navigator.mediaDevices.getUserMedia(mergedConstraints);
	} catch (error) {
		console.warn(
			"Failed to get media with ideal constraints, trying fallback:",
			error
		);

		// Fallback to basic constraints
		const fallbackConstraints = {
			audio: true,
			video: {
				facingMode: "user",
				width: { ideal: 640 },
				height: { ideal: 480 },
				frameRate: { ideal: 15 },
			},
		};

		return await navigator.mediaDevices.getUserMedia(fallbackConstraints);
	}
};

/**
 * Stop all tracks in a media stream
 * @param {MediaStream} stream - The media stream containing tracks to stop
 */
export const stopMediaStream = (stream) => {
	if (!stream) return;

	stream.getTracks().forEach((track) => {
		track.stop();
	});
};
