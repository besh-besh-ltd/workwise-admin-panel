const env = process.env.ENV ? process.env.ENV : "development";

const config = {
  development: {
    api: "http://localhost:8002/api/v1"
  },
  staging: {
    api: "http://localhost:8002/api/v1"
  },
  production: {
    api: "http://localhost:8002/api/v1"
  }
}[env];

export default config;
