type Environment = "development" | "staging" | "production";

interface EnvConfig {
  api: string;
}

const env: Environment = (process.env.ENV as Environment) || "production";

const config: EnvConfig = {
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
