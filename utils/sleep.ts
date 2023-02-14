export default async function sleep(ms: number) {
  const timeout = await new Promise<number>((resolve) =>
    setTimeout(resolve, ms)
  );
  clearTimeout(timeout);
}
