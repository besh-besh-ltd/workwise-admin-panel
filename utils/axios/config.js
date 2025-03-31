const env = process.env.ENV ? process.env.ENV : "development";

const config = {
  development: {
    api: "https://api.letsworkwise.com/api/v1"
  },
  staging: {
    api: "https://api.letsworkwise.com/api/v1"
  },
  production: {
    api: "https://api.letsworkwise.com/api/v1"
  }
}[env];

export default config;
