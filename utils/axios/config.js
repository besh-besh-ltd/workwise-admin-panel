const env = process.env.ENV ? process.env.ENV : "development";

const config = {
  development: {
    api: "http://143.110.242.57:8112/api/v1"
  },
  staging: {
    api: "http://localhost:3000/api"
  },
  production: {
    api: "http://localhost:3000/api"
  }
}[env];

export default config;
