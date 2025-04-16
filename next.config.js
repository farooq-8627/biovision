/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config) => {
		// This is needed for the MediaPipe and face-api.js libraries
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			encoding: false,
		};
		return config;
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://localhost:8000/api/:path*",
				basePath: false,
			},
			{
				source: "/socket.io/:path*",
				destination: "http://localhost:8000/socket.io/:path*",
				basePath: false,
			},
		];
	},
	// Add CORS headers
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,POST,PUT,DELETE,OPTIONS",
					},
					{ key: "Access-Control-Allow-Headers", value: "Content-Type" },
				],
			},
		];
	},
};

module.exports = nextConfig;
