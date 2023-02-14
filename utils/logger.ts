import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import {
  Color,
  ConsoleTransport,
  dayjs,
  FileTransport,
  Format,
  Houston,
  LogLevel,
  TextPrefix,
} from "../deps.ts";

const DOCKER_ENV = Deno.env.get("DOCKER_ENV") === "true";

const config = [
  new ConsoleTransport([
    LogLevel["Error"],
    LogLevel["Success"],
    LogLevel["Warning"],
    LogLevel["Info"],
  ], {
    format: Format["text"],
    prefix: new TextPrefix(dayjs().format("MMMM D, YYYY h:mm:ss A")),
    logColors: {
      [LogLevel.Info]: Color.Black,
      [LogLevel.Error]: Color.Red,
      [LogLevel.Success]: Color.Green,
      [LogLevel.Warning]: Color.Yellow,
    },
  }),
  DOCKER_ENV
    ? new FileTransport(
      "/logs",
      [LogLevel["Error"], LogLevel["Warning"]],
    )
    : null,
]
  .filter((x) => !!x) as Array<ConsoleTransport | FileTransport>;

const logger = new Houston(config);

export default logger;
