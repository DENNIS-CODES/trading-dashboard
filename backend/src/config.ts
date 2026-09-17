type Config = {
  port: number | string;
  host: string;
};
const config: Config = {
  port: process.env.PORT || 4010,
  host: process.env.HOST || "localhost",
};

export default config;
