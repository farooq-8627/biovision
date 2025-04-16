/**
 * Frame buffer management utilities
 */

import { HR_CONSTANTS } from "./heartRateUtils";

/**
 * Circular buffer for efficient frame storage
 */
export class CircularBuffer {
	constructor(maxSize = HR_CONSTANTS.MIN_BUFFER_SIZE) {
		this.maxSize = maxSize;
		this.buffer = new Array(maxSize);
		this.head = 0;
		this.tail = 0;
		this.size = 0;
		this.totalFrames = 0;
	}

	/**
	 * Add a frame to the buffer
	 * @param {Object} frame - Frame data with r,g,b values
	 * @returns {boolean} True if frame was added successfully
	 */
	push(frame) {
		if (!this.isValidFrame(frame)) {
			console.warn("Invalid frame data:", frame);
			return false;
		}

		this.buffer[this.head] = frame;
		this.head = (this.head + 1) % this.maxSize;
		this.size = Math.min(this.size + 1, this.maxSize);
		this.totalFrames++;
		return true;
	}

	/**
	 * Get all frames in chronological order
	 * @returns {Array} Array of frames
	 */
	getFrames() {
		const frames = [];
		let current = (this.head - this.size + this.maxSize) % this.maxSize;

		for (let i = 0; i < this.size; i++) {
			frames.push(this.buffer[current]);
			current = (current + 1) % this.maxSize;
		}

		return frames;
	}

	/**
	 * Clear the buffer
	 */
	clear() {
		this.buffer = new Array(this.maxSize);
		this.head = 0;
		this.tail = 0;
		this.size = 0;
		this.totalFrames = 0;
	}

	/**
	 * Check if buffer is ready for processing
	 * @returns {boolean} True if buffer has enough frames
	 */
	isReady() {
		return this.size >= HR_CONSTANTS.MIN_BUFFER_SIZE;
	}

	/**
	 * Validate frame data
	 * @param {Object} frame - Frame data to validate
	 * @returns {boolean} True if frame is valid
	 */
	isValidFrame(frame) {
		return (
			frame &&
			typeof frame === "object" &&
			"r" in frame &&
			"g" in frame &&
			"b" in frame &&
			Object.values(frame).every(
				(val) =>
					typeof val === "number" && !isNaN(val) && val >= 0 && val <= 255
			)
		);
	}

	/**
	 * Get buffer statistics
	 * @returns {Object} Buffer statistics
	 */
	getStats() {
		return {
			size: this.size,
			maxSize: this.maxSize,
			totalFrames: this.totalFrames,
			isReady: this.isReady(),
		};
	}
}

/**
 * Frame processor for heart rate calculation
 */
export class FrameProcessor {
	constructor(options = {}) {
		this.buffer = new CircularBuffer(
			options.bufferSize || HR_CONSTANTS.MIN_BUFFER_SIZE
		);
		this.lastProcessTime = 0;
		this.processingInterval = options.processingInterval || 1000; // 1 second
		this.onNewHeartRate = options.onNewHeartRate || (() => {});
		this.isProcessing = false;
	}

	/**
	 * Process a new frame
	 * @param {Object} frame - Frame data with r,g,b values
	 * @returns {boolean} True if frame was processed
	 */
	processFrame(frame) {
		if (!frame || this.isProcessing) return false;

		const wasAdded = this.buffer.push(frame);
		if (!wasAdded) return false;

		const now = Date.now();
		if (
			this.buffer.isReady() &&
			now - this.lastProcessTime >= this.processingInterval
		) {
			this.processBuffer();
		}

		return true;
	}

	/**
	 * Process the current buffer
	 */
	async processBuffer() {
		if (this.isProcessing || !this.buffer.isReady()) return;

		try {
			this.isProcessing = true;
			const frames = this.buffer.getFrames();

			// Calculate heart rate
			const heartRate = await this.calculateHeartRate(frames);

			if (heartRate) {
				this.onNewHeartRate(heartRate);
			}

			this.lastProcessTime = Date.now();
		} catch (error) {
			console.error("Error processing buffer:", error);
		} finally {
			this.isProcessing = false;
		}
	}

	/**
	 * Calculate heart rate from frames
	 * @param {Array} frames - Array of frames
	 * @returns {Promise<number>} Heart rate in BPM
	 */
	async calculateHeartRate(frames) {
		try {
			const { calculateHeartRate } = await import("./heartRateUtils");
			return calculateHeartRate(frames);
		} catch (error) {
			console.error("Error calculating heart rate:", error);
			return null;
		}
	}

	/**
	 * Reset the processor
	 */
	reset() {
		this.buffer.clear();
		this.lastProcessTime = 0;
		this.isProcessing = false;
	}

	/**
	 * Get processor statistics
	 * @returns {Object} Processor statistics
	 */
	getStats() {
		return {
			...this.buffer.getStats(),
			lastProcessTime: this.lastProcessTime,
			isProcessing: this.isProcessing,
		};
	}
}
