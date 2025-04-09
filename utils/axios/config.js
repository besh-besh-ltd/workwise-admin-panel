const env = process.env.ENV ? process.env.ENV : "development";

const config = {
  development: {
    api: "http://localhost:8002/api/v1"
  },
  staging: {
    api: "http://13.203.194.198:8002/api/v1"
  },
  production: {
    api: "https://api.letsworkwise.com/api/v1"
  }
}[env];

export default config;
